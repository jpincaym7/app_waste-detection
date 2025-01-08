class TrashReportForm {
    constructor() {
        this.currentStep = 1;
        this.map = null;
        this.marker = null;
        this.imagePreview = null;
        this.form = document.getElementById('reportForm');
        this.editMode = this.form?.dataset.reportId ? true : false;
        this.reportId = this.form?.dataset.reportId;
        
        this.initializeElements();
        this.initializeMapAndData();
        this.setupEventListeners();
    }
    initializeElements() {
        this.form = document.getElementById('reportForm');
        this.steps = document.querySelectorAll('.stepper-step');
        this.contents = document.querySelectorAll('.step-content');
        this.prevBtn = document.querySelector('.btn-prev');
        this.nextBtn = document.querySelector('.btn-next');
        this.submitBtn = document.querySelector('.btn-submit');
        this.imageInput = document.getElementById('imageInput');
        this.imagePreviewElement = document.querySelector('.image-preview');
        this.uploadZone = document.querySelector('.image-upload-zone');
    }
    // Add new method to get user location
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                this.defaultCoordinates = [-66.8792, 10.4880]; // Default fallback
                resolve();
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.defaultCoordinates = [
                        position.coords.longitude,
                        position.coords.latitude
                    ];
                    resolve();
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    this.defaultCoordinates = [-66.8792, 10.4880]; // Default fallback
                    resolve();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }

    async initializeMapAndData() {
        await this.getUserLocation();
        await this.initializeMap();
        
        if (this.editMode) {
            await this.loadExistingData();
        }
        this.loadReports();
    }

    async initializeMap() {
        return new Promise((resolve) => {
            maplibregl.setRTLTextPlugin(
                'https://unpkg.com/@maplibre/maplibre-gl-rtl-text@0.2.0/maplibre-gl-rtl-text.min.js'
            );

            this.map = new maplibregl.Map({
                container: 'map',
                style: `https://api.maptiler.com/maps/basic/style.json?key=${MAPTILER_KEY}`,
                center: this.defaultCoordinates,
                zoom: 15
            });

            // Add controls
            this.map.addControl(new maplibregl.NavigationControl());
            
            const geolocateControl = new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showAccuracyCircle: true
            });
            
            this.map.addControl(geolocateControl);

            this.map.on('load', () => {
                // Solo activamos el geolocate si no estamos en modo edición
                if (!this.editMode) {
                    geolocateControl.trigger();
                }
                resolve();
            });

            this.map.on('click', (e) => this.handleMapClick(e));
        });
    }

    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.navigateStep(-1));
        this.nextBtn.addEventListener('click', () => this.navigateStep(1));
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.uploadZone.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));

        // Touch events for swipe navigation
        let touchStartX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, false);

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0 && this.currentStep < 4) {
                    this.navigateStep(1);
                } else if (diff < 0 && this.currentStep > 1) {
                    this.navigateStep(-1);
                }
            }
        }, false);
    }

    handleMapClick(e) {
        if (this.marker) this.marker.remove();
        
        this.marker = new maplibregl.Marker({
            color: '#10B981',
            draggable: true
        })
            .setLngLat(e.lngLat)
            .addTo(this.map);

        this.updateCoordinates(e.lngLat);

        this.marker.on('dragend', () => {
            const lngLat = this.marker.getLngLat();
            this.updateCoordinates(lngLat);
        });
    }

    updateCoordinates(lngLat) {
        document.getElementById('latitude').value = lngLat.lat.toFixed(6);
        document.getElementById('longitude').value = lngLat.lng.toFixed(6);
        
        // Reverse geocoding
        fetch(`https://api.maptiler.com/geocoding/${lngLat.lng},${lngLat.lat}.json?key=${MAPTILER_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.features && data.features.length > 0)
                    {
                        const location = data.features[0];
                        document.getElementById('locationInfo').innerHTML = `
                            <div class="flex items-center">
                                <i class="fas fa-map-marker-alt text-green-600 mr-2"></i>
                                <span>${location.place_name}</span>
                            </div>
                        `;
                    }
                })
                .catch(error => console.error('Error en geocodificación inversa:', error));
        }
    
        handleImageUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
    
            if (!file.type.startsWith('image/')) {
                this.showError('Por favor, seleccione una imagen válida');
                return;
            }
    
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreviewElement.querySelector('img').src = e.target.result;
                this.imagePreviewElement.classList.remove('hidden');
                this.uploadZone.querySelector('.upload-placeholder').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    
        navigateStep(direction) {
            if (!this.validateCurrentStep()) return;
    
            const newStep = this.currentStep + direction;
            if (newStep < 1 || newStep > 4) return;
    
            // Animate step transition
            this.contents[this.currentStep - 1].classList.add('animate-out');
            setTimeout(() => {
                this.contents[this.currentStep - 1].classList.remove('active', 'animate-out');
                this.currentStep = newStep;
                this.updateStepUI();
            }, 300);
        }
    
        validateCurrentStep() {
            switch (this.currentStep) {
                case 1:
                    if (!this.marker) {
                        this.showError('Por favor, seleccione una ubicación en el mapa');
                        return false;
                    }
                    break;
                case 2:
                    const description = this.form.querySelector('[name="description"]').value;
                    const severity = this.form.querySelector('[name="severity"]').value;
                    if (!description || !severity) {
                        this.showError('Por favor, complete todos los campos requeridos');
                        return false;
                    }
                    break;
                case 3:
                    // Verificar si hay una imagen nueva en el input O si hay una imagen existente previsualizándose
                    const hasNewImage = this.imageInput.files.length > 0;
                    const hasExistingImage = !this.imagePreviewElement.classList.contains('hidden');
                    
                    if (!hasNewImage && !hasExistingImage) {
                        this.showError('Por favor, suba una imagen del reporte');
                        return false;
                    }
                    break;
            }
            return true;
        }
    
        updateStepUI() {
            // Update stepper indicators
            this.steps.forEach((step, index) => {
                if (index + 1 === this.currentStep) {
                    step.classList.add('active');
                } else if (index + 1 < this.currentStep) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
    
            // Show current step content
            this.contents.forEach((content, index) => {
                if (index + 1 === this.currentStep) {
                    content.classList.add('active');
                    content.classList.add('animate-in');
                    setTimeout(() => content.classList.remove('animate-in'), 300);
                }
            });
    
            // Update navigation buttons
            this.prevBtn.classList.toggle('hidden', this.currentStep === 1);
            this.nextBtn.classList.toggle('hidden', this.currentStep === 4);
            this.submitBtn.classList.toggle('hidden', this.currentStep !== 4);
    
            // Update confirmation step if needed
            if (this.currentStep === 4) {
                this.updateConfirmationStep();
            }
        }
    
        updateConfirmationStep() {
            const summaryHTML = `
                <div class="space-y-4">
                    <div class="flex items-start space-x-4">
                        <img src="${this.imagePreviewElement.querySelector('img').src}" 
                             alt="Evidencia" 
                             class="w-32 h-32 object-cover rounded-lg">
                        <div>
                            <h3 class="font-medium">Ubicación</h3>
                            <p class="text-sm text-gray-600">${document.getElementById('locationInfo').textContent}</p>
                            
                            <h3 class="font-medium mt-2">Descripción</h3>
                            <p class="text-sm text-gray-600">${this.form.querySelector('[name="description"]').value}</p>
                            
                            <h3 class="font-medium mt-2">Severidad</h3>
                            <p class="text-sm text-gray-600">
                                ${this.form.querySelector('[name="severity"] option:checked').text}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            document.querySelector('.report-summary').innerHTML = summaryHTML;
        }
        

        async loadReports() {
            try {
                const response = await fetch('/gamification/reports/list/');
                const data = await response.json();
                
                if (!data || data.length === 0) {
                    document.getElementById('reportsList').innerHTML = '<p>No hay reportes disponibles.</p>';
                    return;
                }
        
                const reportsList = data.map(report => {
                    return `
                        <div class="bg-white p-4 rounded-lg shadow-md">
                            <h4 class="font-semibold">${report.description}</h4>
                            <p class="text-sm text-gray-600">Ubicación: ${report.location}</p>
                            <p class="text-sm text-gray-600">Severidad: ${report.severity}</p>
                            <p class="text-sm text-gray-600">Estado: ${report.status}</p>
                            <img src="${report.image_url}" alt="Evidencia" class="max-h-32 mx-auto mt-2">
                        </div>
                    `;
                }).join('');
        
                document.getElementById('reportsList').innerHTML = reportsList;
            } catch (error) {
                console.error('Error al cargar los reportes:', error);
                document.getElementById('reportsList').innerHTML = '<p>Error al cargar los reportes.</p>';
            }
        }

        async loadExistingData() {
            try {
                const response = await fetch(`/gamification/reports/${this.reportId}/`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Guardar referencias a los elementos del formulario
                const descriptionField = this.form.querySelector('[name="description"]');
                const severityField = this.form.querySelector('[name="severity"]');
                const recurringField = this.form.querySelector('[name="is_recurring"]'); // Corregido el nombre del campo
                
                // Verificar que los campos existen antes de establecer valores
                if (descriptionField) {
                    descriptionField.value = data.description || '';
                }
                
                if (severityField) {
                    severityField.value = data.severity || '';
                }
                
                if (recurringField) {
                    recurringField.checked = Boolean(data.is_recurring);
                }
                
                // Establecer coordenadas y marcador si existen
                const lat = parseFloat(data.latitude);
                const lng = parseFloat(data.longitude);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    // Actualizar el mapa y crear el marcador
                    this.map.setCenter([lng, lat]);
                    if (this.marker) this.marker.remove();
                    
                    this.marker = new maplibregl.Marker({
                        color: '#10B981',
                        draggable: true
                    })
                    .setLngLat([lng, lat])
                    .addTo(this.map);
                    
                    // Actualizar los campos ocultos
                    const latitudeField = document.getElementById('latitude');
                    const longitudeField = document.getElementById('longitude');
                    
                    if (latitudeField) latitudeField.value = lat;
                    if (longitudeField) longitudeField.value = lng;
                    
                    // Actualizar la información de ubicación
                    this.updateCoordinates({ lat, lng });
                }
                
                // Mostrar imagen existente si existe
                if (data.image_url && this.imagePreviewElement) {
                    const previewImg = this.imagePreviewElement.querySelector('img');
                    if (previewImg) {
                        previewImg.src = data.image_url;
                        this.imagePreviewElement.classList.remove('hidden');
                    }
                    
                    const placeholder = this.uploadZone?.querySelector('.upload-placeholder');
                    if (placeholder) {
                        placeholder.classList.add('hidden');
                    }
                }
                
            } catch (error) {
                console.error('Error al cargar datos existentes:', error);
                this.showError('Error al cargar los datos del reporte. Por favor, recarga la página o intenta más tarde.');
            }
        }

        async handleSubmit(e) {
            e.preventDefault();
            if (this.isSubmitting) return;
    
            this.isSubmitting = true;
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
    
            try {
                const formData = new FormData(this.form);
                const url = this.editMode 
                    ? `/gamification/reports/update/${this.reportId}/`
                    : '/gamification/reports/create/';
                
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                    }
                });
    
                if (!response.ok) throw new Error('Error al procesar el reporte');
    
                const data = await response.json();
                this.showSuccess(this.editMode ? '¡Reporte actualizado con éxito!' : '¡Reporte enviado con éxito!');
                setTimeout(() => window.location.href = `/gamification/reports/view/`, 1500);
            } catch (error) {
                this.showError(`Error al ${this.editMode ? 'actualizar' : 'enviar'} el reporte. Por favor, intente nuevamente.`);
                this.submitBtn.disabled = false;
                this.submitBtn.innerHTML = `<i class="fas fa-check mr-2"></i>${this.editMode ? 'Actualizar' : 'Enviar'} Reporte`;
            } finally {
                this.isSubmitting = false;
            }
        }
    
        showError(message) {
            Swal.fire({
                title: 'Error',
                text: message,
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    
        showSuccess(message) {
            Swal.fire({
                title: '¡Éxito!',
                text: message,
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    }
    
    
    

// Initialize the form when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const trashReportForm = new TrashReportForm();
    
    // Enable gestures for mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
});
