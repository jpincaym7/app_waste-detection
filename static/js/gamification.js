// gamification.js

class StatsModalController {
    constructor() {
        this.modal = document.getElementById('statsModal');
        this.panel = this.modal.querySelector('.transform');
        this.backdrop = document.getElementById('statsModalBackdrop');
        this.closeButton = document.getElementById('closeStatsModal');
        this.floatingButton = document.getElementById('statsFloatingButton');
        
        this.isOpen = false;
        this.bindEvents();
    }

    bindEvents() {
        // Open modal
        this.floatingButton.addEventListener('click', () => this.open());
        
        // Close modal
        this.closeButton.addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', () => this.close());
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Prevent body scroll when modal is open
        this.modal.addEventListener('wheel', (e) => {
            if (!this.panel.contains(e.target)) {
                e.preventDefault();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Animate in
        requestAnimationFrame(() => {
            this.panel.classList.remove('translate-x-full');
        });
    }

    close() {
        this.isOpen = false;
        this.panel.classList.add('translate-x-full');
        document.body.style.overflow = '';
        
        // Wait for animation to finish before hiding
        setTimeout(() => {
            if (!this.isOpen) {
                this.modal.classList.add('hidden');
            }
        }, 300);
    }

    // Update modal stats
    updateStats(stats) {
        // Update level and points
        document.getElementById('modalUserLevel').textContent = stats.level;
        document.getElementById('modalUserPoints').textContent = stats.points;
        
        // Update progress bar
        const percentage = (stats.points % 100) + '%';
        document.getElementById('modalLevelProgressBar').style.width = percentage;
        
        // Update next reward
        this.updateNextReward(stats);
        
        // Update badges
        this.updateBadges(stats.badges || []);
    }

    updateNextReward(stats) {
        const nextLevel = Math.ceil(stats.level / 5) * 5;
        const pointsNeeded = (nextLevel * 100) - stats.points;
        
        document.getElementById('modalNextRewardLevel').textContent = `Nivel ${nextLevel}`;
        document.getElementById('modalPointsToNextReward').textContent = `Faltan ${pointsNeeded} puntos`;
    }

    updateBadges(badges) {
        const container = document.getElementById('modalUserBadges');
        container.innerHTML = '';
        
        if (badges.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <i class="fas fa-lock text-gray-400 text-2xl mb-2"></i>
                    <span class="text-sm text-gray-500">Aún no hay insignias</span>
                </div>
            `;
            return;
        }
        
        badges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'flex flex-col items-center p-3 bg-gray-50 rounded-lg';
            badgeEl.innerHTML = `
                <i class="fas fa-${badge.icon} text-2xl text-yellow-500 mb-2"></i>
                <span class="text-sm font-medium text-center">${badge.name}</span>
            `;
            container.appendChild(badgeEl);
        });
    }
}
const statsModal = new StatsModalController();

class GamificationSystem {
    constructor() {
        this.pointsPerDetection = 10;
        this.pointsPerLevel = 100;
        this.levelBonuses = {
            5: 'recycling_master',
            10: 'waste_warrior',
            15: 'eco_champion',
            20: 'environmental_hero'
        };
        
        // Badges/Trophies definitions
        this.badges = {
            recycling_master: {
                name: 'Maestro del Reciclaje',
                icon: 'fas fa-award',
                description: 'Has alcanzado el nivel 5'
            },
            waste_warrior: {
                name: 'Guerrero de Residuos',
                icon: 'fas fa-shield-alt',
                description: 'Has alcanzado el nivel 10'
            },
            eco_champion: {
                name: 'Campeón Ecológico',
                icon: 'fas fa-crown',
                description: 'Has alcanzado el nivel 15'
            },
            environmental_hero: {
                name: 'Héroe Ambiental',
                icon: 'fas fa-star',
                description: 'Has alcanzado el nivel 20'
            }
        };
    }

    async handleDetection(detections) {
        try {
            const points = detections.length * this.pointsPerDetection;
            const response = await this.updateUserProgress(points);
            
            if (response.new_level || response.new_badges) {
                this.showRewards(response);
            }
            
            this.updateUI(response);
            
            return response;
        } catch (error) {
            console.error('Error updating progress:', error);
            throw error;
        }
    }

    async updateUserProgress(points) {
        try {
            // Obtener el token CSRF
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
            
            if (!csrfToken) {
                throw new Error('CSRF token no encontrado');
            }
    
            const response = await fetch('/waste/api/update-progress/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({
                    points: points,
                    detections: 1
                }),
                credentials: 'include'  // Importante para incluir cookies
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Error en la respuesta del servidor');
            }
    
            return data;
        } catch (error) {
            console.error('Error en updateUserProgress:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar tu progreso. Por favor, intenta de nuevo.'
            });
            throw error;
        }
    }

    showRewards(rewards) {
        let message = '';
        
        if (rewards.new_level) {
            message += `¡Felicidades! Has alcanzado el nivel ${rewards.level}!\n`;
        }
        
        if (rewards.new_badges && rewards.new_badges.length > 0) {
            message += '¡Has desbloqueado nuevas insignias!\n';
            rewards.new_badges.forEach(badge => {
                const badgeInfo = this.badges[badge];
                message += `${badgeInfo.name}: ${badgeInfo.description}\n`;
            });
        }

        Swal.fire({
            title: '¡Predicción Completa!',
            html: message.replace(/\n/g, '<br>'),
            icon: 'success',
            confirmButtonText: '¡Genial!',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    }

    updateUI(progress) {
        // Update basic stats
        const levelElement = document.getElementById('userLevel');
        const pointsElement = document.getElementById('userPoints');
        const totalDetections = document.getElementById('totalDetections');
        const progressBar = document.getElementById('levelProgressBar');
        
        if (levelElement) levelElement.textContent = progress.level;
        if (pointsElement) pointsElement.textContent = progress.points;
        if (totalDetections) totalDetections.textContent = progress.total_detections;
        
        // Update progress bar
        if (progressBar) {
            const pointsInCurrentLevel = progress.points % this.pointsPerLevel;
            const percentage = (pointsInCurrentLevel / this.pointsPerLevel) * 100;
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
        
        // Update next reward info
        this.updateNextReward(progress);
        
        // Update badges
        this.updateBadgesDisplay(progress.badges || []);

        statsModal.updateStats(progress);
    }
    
    updateNextReward(progress) {
        const nextRewardLevel = document.getElementById('nextRewardLevel');
        const nextRewardName = document.getElementById('nextRewardName');
        const pointsToNextReward = document.getElementById('pointsToNextReward');
        
        // Find next badge level
        const currentLevel = progress.level;
        let nextBadgeLevel = null;
        let nextBadgeName = null;
        
        for (const [level, badge] of Object.entries(this.levelBonuses)) {
            if (parseInt(level) > currentLevel) {
                nextBadgeLevel = level;
                nextBadgeName = this.badges[badge].name;
                break;
            }
        }
        
        if (nextBadgeLevel) {
            const pointsNeeded = (nextBadgeLevel * this.pointsPerLevel) - progress.points;
            if (nextRewardLevel) nextRewardLevel.textContent = `Nivel ${nextBadgeLevel}`;
            if (nextRewardName) nextRewardName.textContent = nextBadgeName;
            if (pointsToNextReward) pointsToNextReward.textContent = `Faltan ${pointsNeeded} puntos`;
        } else {
            if (nextRewardLevel) nextRewardLevel.textContent = 'Nivel Máximo';
            if (nextRewardName) nextRewardName.textContent = '¡Felicitaciones!';
            if (pointsToNextReward) pointsToNextReward.textContent = 'Has desbloqueado todas las insignias';
        }
    }
    
    updateBadgesDisplay(badges) {
        const badgesContainer = document.getElementById('userBadges');
        if (!badgesContainer) return;
        
        badgesContainer.innerHTML = '';
        
        if (badges.length === 0) {
            // Show placeholder if no badges
            const placeholder = document.createElement('div');
            placeholder.className = 'badge-placeholder flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50';
            placeholder.innerHTML = `
                <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <i class="fas fa-question text-gray-400"></i>
                </div>
                <span class="text-xs text-gray-500 mt-2">Bloqueado</span>
            `;
            badgesContainer.appendChild(placeholder);
        } else {
            // Display earned badges
            badges.forEach(badge => {
                const badgeInfo = this.badges[badge];
                if (badgeInfo) {
                    const badgeElement = document.createElement('div');
                    badgeElement.className = 'badge-item flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors';
                    badgeElement.innerHTML = `
                        <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <i class="${badgeInfo.icon} text-yellow-500"></i>
                        </div>
                        <span class="text-xs font-medium text-gray-700 mt-2">${badgeInfo.name}</span>
                    `;
                    badgesContainer.appendChild(badgeElement);
                }
            });
        }
    }
}

// Initialize the gamification system
const gamification = new GamificationSystem();

// Modify the existing displayDetections function to include gamification
const originalDisplayDetections = displayDetections;
displayDetections = async function(detections) {
    // Call the original function first
    originalDisplayDetections(detections);
    
    // Handle gamification
    try {
        await gamification.handleDetection(detections);
    } catch (error) {
        console.error('Error handling gamification:', error);
    }
};