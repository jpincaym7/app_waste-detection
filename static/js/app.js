class LocationHandler {
    constructor(recyclingPointsMap) {
        this.recyclingPointsMap = recyclingPointsMap;
        this.map = recyclingPointsMap.map;
        this.watchId = null;
        this.userMarker = null;
        this.accuracy = null;
        this.isTracking = false;
    }
    
    initialize() {
        // Add location control button
        const locationControl = document.createElement('button');
        locationControl.className = 'location-control';
        locationControl.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
        locationControl.title = 'Centrar en mi ubicación';
        
        locationControl.addEventListener('click', () => {
            if (!this.isTracking) {
                this.startTracking();
                locationControl.classList.add('tracking');
            } else {
                this.stopTracking();
                locationControl.classList.remove('tracking');
            }
        });
        
        // Add control to the map container
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.appendChild(locationControl);
        } else {
            console.warn('Map container not found');
        }
    }
    
    async startTracking() {
        try {
            if (!('geolocation' in navigator)) {
                throw new Error('Geolocation not supported');
            }
            
            this.isTracking = true;
            
            // Get initial position
            await this.updatePosition();
            
            // Start watching position
            this.watchId = navigator.geolocation.watchPosition(
                position => this.updatePosition(position),
                error => this.handleError(error),
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
            
        } catch (error) {
            this.handleError(error);
        }
    }
    
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        
        this.isTracking = false;
        
        if (this.userMarker) {
            this.userMarker.remove();
            this.userMarker = null;
        }
        
        if (this.accuracy) {
            this.accuracy.remove();
            this.accuracy = null;
        }
    }
    
    async updatePosition(position = null) {
        try {
            if (!position) {
                position = await this.getCurrentPosition();
            }
            
            const { latitude, longitude, accuracy } = position.coords;
            
            // Update or create user marker
            if (!this.userMarker) {
                const el = document.createElement('div');
                el.className = 'user-location-marker';
                el.innerHTML = '<div class="pulse"></div>';
                
                this.userMarker = new maplibregl.Marker(el)
                    .setLngLat([longitude, latitude])
                    .addTo(this.map);
            } else {
                this.userMarker.setLngLat([longitude, latitude]);
            }
            
            // Center map on user location
            this.map.flyTo({
                center: [longitude, latitude],
                zoom: 16,
                duration: 1000
            });
            
            // Update global user location for distance calculations
            this.map.userLocation = { latitude, longitude };
            
            // Trigger points reload with new location
            await this.recyclingPointsMap.loadPoints();
            
        } catch (error) {
            this.handleError(error);
        }
    }
    
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }
    
    handleError(error) {
        console.error('Location error:', error);
        let message = 'Error al obtener la ubicación';
        
        switch (error.code) {
            case 1:
                message = 'Por favor, permite el acceso a tu ubicación';
                break;
            case 2:
                message = 'No se pudo determinar tu ubicación';
                break;
            case 3:
                message = 'Tiempo de espera agotado';
                break;
        }
        
        this.recyclingPointsMap.showError(message);
        this.isTracking = false;
    }
    
    calculateDistance(point) {
        if (!this.map.userLocation || !point.latitude || !point.longitude) return null;
        
        const lat1 = this.map.userLocation.latitude * Math.PI / 180;
        const lon1 = this.map.userLocation.longitude * Math.PI / 180;
        const lat2 = point.latitude * Math.PI / 180;
        const lon2 = point.longitude * Math.PI / 180;
        
        // Haversine formula for more accurate distance calculation
        const R = 6371; // Earth's radius in kilometers
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
                
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        // Return distance rounded to 1 decimal place
        return Math.round(distance * 10) / 10;
    }
}

class RecyclingPointsMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.selectedPoint = null;
        this.userLocation = null;
        this.isMapExpanded = false;
        this.locationHandler = null;
        this.apiBaseUrl = this.getSecureApiUrl();
        this.initializeMap();
        this.setupEventListeners();
    }

    getSecureApiUrl() {
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split('/recycling_points')[0];
        return baseUrl.replace('http:', 'https:') + '/recycling_points/api/recycling-points/';
    }
    
    async initializeMap() {
        try {
            if (!MAPTILER_KEY) {
                throw new Error('MapTiler API key not found');
            }

            this.map = new maplibregl.Map({
                container: 'map',
                style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
                center: [-3.70325, 40.4167],
                zoom: 13,
                attributionControl: false
            });
            
            this.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
            
            this.map.on('styleimagemissing', (e) => {
                const id = e.id;
                const data = new Uint8Array(4).fill(0);
                this.map.addImage(id, { width: 1, height: 1, data });
            });
            
            // Initialize location handler after map is created
            this.locationHandler = new LocationHandler(this);
            
            // Wait for map to load
            await new Promise(resolve => this.map.on('load', () => {
                this.locationHandler.initialize();
                resolve();
            }));
            
            await this.loadPoints();
            await this.centerOnUserLocation();
            
        } catch (error) {
            console.error('Map initialization error:', error);
            this.showError('Error al inicializar el mapa: ' + error.message);
        }
    }
    
    setupEventListeners() {
        // Toggle map size
        const toggleBtn = document.querySelector('.toggle-view-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleMapSize());
        }
        
        // Close details
        const closeBtn = document.querySelector('.close-details');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePointDetails());
        }
        
        // Directions
        const directionsBtn = document.querySelector('.directions-button');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', () => this.openDirections());
        }
        
        // Center location
        const centerLocationBtn = document.getElementById('centerLocation');
        if (centerLocationBtn) {
            centerLocationBtn.addEventListener('click', () => this.centerOnUserLocation());
        }
        
        // Handle back button for details panel
        window.addEventListener('popstate', () => {
            if (this.selectedPoint) {
                this.closePointDetails();
            }
        });
    }
    
    toggleMapSize() {
        const mapContainer = document.querySelector('.map-container');
        const toggleBtn = document.querySelector('.toggle-view-btn');
        if (!mapContainer || !toggleBtn) return;

        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('i');
        if (!toggleText || !toggleIcon) return;
        
        this.isMapExpanded = !this.isMapExpanded;
        
        if (this.isMapExpanded) {
            mapContainer.classList.add('expanded');
            toggleText.textContent = 'Ver lista';
            toggleIcon.className = 'fas fa-list';
        } else {
            mapContainer.classList.remove('expanded');
            toggleText.textContent = 'Ver mapa completo';
            toggleIcon.className = 'fas fa-expand-alt';
        }
        
        // Trigger map resize event
        setTimeout(() => this.map.resize(), 300);
    }
    
    async centerOnUserLocation() {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });
            
            this.userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            // Add user location marker
            this.addUserLocationMarker();
            
            this.map.flyTo({
                center: [position.coords.longitude, position.coords.latitude],
                zoom: 15,
                duration: 1000
            });
            
            await this.loadPoints();
            
        } catch (error) {
            console.error('Could not get user location:', error);
            this.showError('No se pudo obtener tu ubicación');
        }
    }
    
    addUserLocationMarker() {
        if (!this.userLocation) return;
        
        // Remove existing user marker if any
        if (this.userMarker) {
            this.userMarker.remove();
        }
        
        // Create user location marker
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.innerHTML = '<div class="pulse"></div>';
        
        this.userMarker = new maplibregl.Marker(el)
            .setLngLat([this.userLocation.longitude, this.userLocation.latitude])
            .addTo(this.map);
    }
    
    async loadPoints() {
        this.showLoading();
        
        try {
            const response = await fetch(this.apiBaseUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const points = await response.json();
            
            if (this.userLocation) {
                points.forEach(point => {
                    point.distance = this.locationHandler.calculateDistance(point);
                });
                points.sort((a, b) => (a.distance || 999) - (b.distance || 999));
            }
            
            this.updateMarkers(points);
            this.updatePointsList(points);
            
            if (points.length > 0) {
                const bounds = new maplibregl.LngLatBounds();
                points.forEach(point => {
                    if (point.latitude && point.longitude) {
                        bounds.extend([point.longitude, point.latitude]);
                    }
                });
                if (this.userLocation) {
                    bounds.extend([this.userLocation.longitude, this.userLocation.latitude]);
                }
                this.map.fitBounds(bounds, { padding: 50 });
            }
            
        } catch (error) {
            console.error('Error loading points:', error);
            this.showError('No se pudieron cargar los puntos de reciclaje. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            this.hideLoading();
        }
    }
    
    updateMarkers(points) {
        // Remove existing markers
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
        
        // Add new markers
        points.forEach(point => this.addMarker(point));
    }
    
    addMarker(point) {
        if (!point.latitude || !point.longitude) return;
        
        const el = document.createElement('div');
        el.className = 'recycling-point-marker';
        el.innerHTML = '<i class="fas fa-recycle"></i>';
        
        const marker = new maplibregl.Marker(el)
            .setLngLat([point.longitude, point.latitude])
            .addTo(this.map);
            
        el.addEventListener('click', () => this.showPointDetails(point));
        this.markers.push(marker);
        
        // Store marker reference in point object
        point.marker = marker;
    }
    
    updatePointsList(points) {
        const listContainer = document.getElementById('recyclingPointsList');
        if (!listContainer) {
            console.warn('Recycling points list container not found');
            return;
        }
        
        listContainer.innerHTML = points.map(point => `
            <div class="recycling-point-card" data-point-id="${point.id}">
                <div class="point-card-header">
                    <div class="point-card-name">${point.name}</div>
                    ${point.distance ? `
                        <div class="point-card-distance">
                            <i class="fas fa-walking"></i> ${point.distance} km
                        </div>
                    ` : ''}
                </div>
                <div class="point-card-address">
                    <i class="fas fa-map-marker-alt"></i> ${point.address}
                </div>
                <div class="point-card-types">
                    ${(point.waste_types || []).map(type => `
                        <span class="type-tag">
                            <i class="fas fa-trash-alt"></i> ${type}
                        </span>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Add click event listeners to cards
        const cards = listContainer.querySelectorAll('.recycling-point-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const pointId = card.dataset.pointId;
                const point = points.find(p => p.id === pointId);
                if (point) {
                    this.showPointDetails(point);
                    this.highlightMarker(point);
                }
            });
        });
    }

    highlightMarker(point) {
        // Remove highlight from all markers
        this.markers.forEach(marker => {
            const element = marker.getElement();
            if (element) {
                element.classList.remove('highlighted');
            }
        });

        // Add highlight to selected marker
        if (point.marker) {
            const element = point.marker.getElement();
            if (element) {
                element.classList.add('highlighted');
                
                // Center map on point with padding for the details panel
                this.map.flyTo({
                    center: [point.longitude, point.latitude],
                    zoom: 16,
                    padding: { bottom: this.isMapExpanded ? 0 : 300 },
                    duration: 1000
                });
            }
        }
    }
    
    showPointDetails(point) {
        if (!point) return;
        
        const detailsPanel = document.getElementById('pointDetails');
        if (!detailsPanel) {
            console.warn('Details panel not found');
            return;
        }
        
        const nameElement = detailsPanel.querySelector('.point-name');
        const addressElement = detailsPanel.querySelector('.point-address');
        const wasteTypesList = detailsPanel.querySelector('.waste-types-list');
        const hoursElement = detailsPanel.querySelector('.opening-hours');
        const contactElement = detailsPanel.querySelector('.contact-info');

        if (nameElement) nameElement.textContent = point.name;
        if (addressElement) {
            addressElement.innerHTML = `
                <i class="fas fa-map-marker-alt"></i> ${point.address}
            `;
        }
        
        // Update waste types with icons
        if (wasteTypesList) {
            wasteTypesList.innerHTML = (point.waste_types || []).map(type => `
                <div class="waste-type-item">
                    <i class="fas fa-recycle"></i>
                    <span>${type}</span>
                </div>
            `).join('');
        }
        
        // Update opening hours with icon
        if (hoursElement) {
            hoursElement.innerHTML = `
                <i class="far fa-clock"></i>
                ${point.opening_hours || 'No disponible'}
            `;
        }
        
        // Update contact info with icon
        if (contactElement) {
            contactElement.innerHTML = `
                <i class="fas fa-phone"></i>
                ${point.contact_info || 'No disponible'}
            `;
        }
        
        // Store selected point and update URL
        this.selectedPoint = point;
        history.pushState({ pointId: point.id }, '', `#point-${point.id}`);
        
        // Show panel with animation
        requestAnimationFrame(() => {
            detailsPanel.classList.add('visible');
        });
        
        // Highlight marker
        this.highlightMarker(point);
    }
    
    closePointDetails() {
        const detailsPanel = document.getElementById('pointDetails');
        if (!detailsPanel) return;
        
        detailsPanel.classList.remove('visible');
        
        // Remove marker highlight
        if (this.selectedPoint?.marker) {
            const element = this.selectedPoint.marker.getElement();
            if (element) {
                element.classList.remove('highlighted');
            }
        }
        
        this.selectedPoint = null;
        history.pushState(null, '', window.location.pathname);
        
        // Reset map padding
        this.map.setPadding({ bottom: 0 });
    }
    
    openDirections() {
        if (!this.selectedPoint) return;
        
        const url = `https://www.google.com/maps/dir/?api=1&destination=${this.selectedPoint.latitude},${this.selectedPoint.longitude}`;
        window.open(url, '_blank');
    }
    
    calculateDistance(point) {
        return this.locationHandler ? 
            this.locationHandler.calculateDistance(point) : 
            null;
    }
    
    showLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }
    
    showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Error',
                text: message,
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
            console.error(message);
            alert(message);
        }
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.map = new RecyclingPointsMap();
    } catch (error) {
        console.error('Error initializing map:', error);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Error',
                text: 'Error al inicializar el mapa. Por favor, recarga la página.',
                icon: 'error',
                confirmButtonText: 'Recargar',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
        } else {
            alert('Error al inicializar el mapa. Por favor, recarga la página.');
        }
    }
});