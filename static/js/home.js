// IIFE to avoid global scope pollution
(function() {
    // Constants
    const CONSTANTS = {
        ANIMATION: {
            THRESHOLD: 0.1,
            PARALLAX_FACTOR: 0.3,
            SWIPE_MULTIPLIER: 2
        },
        MODAL: {
            STATES: {
                FULL: 'full',
                PARTIAL: 'partial',
                CLOSED: 'closed'
            },
            DOUBLE_TAP_DELAY: 300,
            VELOCITY_THRESHOLD: 0.5,
            MIN_DRAG_THRESHOLD: 10,
            PARTIAL_HEIGHT_RATIO: 0.6,
            ANIMATION_DURATION: 300,
            MAX_VELOCITY_TRACKING_POINTS: 5
        }
    };

    // Helper Classes
    class VelocityTracker {
        constructor(maxPoints = CONSTANTS.MODAL.MAX_VELOCITY_TRACKING_POINTS) {
            this.positions = [];
            this.timestamps = [];
            this.maxPoints = maxPoints;
        }

        track(position, timestamp) {
            this.positions.push(position);
            this.timestamps.push(timestamp);

            if (this.positions.length > this.maxPoints) {
                this.positions.shift();
                this.timestamps.shift();
            }
        }

        calculateVelocity() {
            if (this.positions.length < 2) return 0;
            
            const lastIndex = this.positions.length - 1;
            const deltaY = this.positions[lastIndex] - this.positions[0];
            const deltaTime = (this.timestamps[lastIndex] - this.timestamps[0]) / 1000;
            
            return deltaY / deltaTime;
        }

        reset() {
            this.positions = [];
            this.timestamps = [];
        }
    }

    class AnimationManager {
        constructor() {
            this.setupIntersectionObserver();
            this.setupParallaxEffect();
        }

        setupIntersectionObserver() {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                },
                { threshold: CONSTANTS.ANIMATION.THRESHOLD }
            );

            document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        }

        setupParallaxEffect() {
            let lastScrollY = window.scrollY;
            const parallaxSections = document.querySelectorAll('.parallax-section');

            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                const delta = (scrollY - lastScrollY) * CONSTANTS.ANIMATION.PARALLAX_FACTOR;

                parallaxSections.forEach(section => {
                    const transform = parseFloat(section.style.transform.replace(/[^\d.-]/g, '') || 0);
                    section.style.transform = `translateY(${transform + delta}px)`;
                });

                lastScrollY = scrollY;
            }, { passive: true });
        }
    }

    class CategorySwipeHandler {
        constructor(container) {
            this.container = container;
            this.isMouseDown = false;
            this.startX = 0;
            this.scrollLeft = 0;
            this.setupEventListeners();
        }
    
        setupEventListeners() {
            // Touch events (mobile)
            this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    
            // Mouse events (PC)
            this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
            this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
            this.container.addEventListener('mouseleave', this.handleMouseUp.bind(this));
            
            // Prevent default drag behavior
            this.container.addEventListener('dragstart', (e) => e.preventDefault());
        }
    
        handleTouchStart(e) {
            this.startX = e.touches[0].pageX - this.container.offsetLeft;
            this.scrollLeft = this.container.scrollLeft;
        }
    
        handleTouchMove(e) {
            if (!this.startX) return;
            const x = e.touches[0].pageX - this.container.offsetLeft;
            const walk = (x - this.startX) * 2; // Increased sensitivity
            this.container.scrollLeft = this.scrollLeft - walk;
            e.preventDefault(); // Prevent scrolling
        }
    
        handleMouseDown(e) {
            this.isMouseDown = true;
            this.container.classList.add('cursor-grabbing');
            this.startX = e.pageX - this.container.offsetLeft;
            this.scrollLeft = this.container.scrollLeft;
        }
    
        handleMouseMove(e) {
            if (!this.isMouseDown) return;
            e.preventDefault();
            const x = e.pageX - this.container.offsetLeft;
            const walk = (x - this.startX) * 1.5; // Smooth scrolling
            this.container.scrollLeft = this.scrollLeft - walk;
        }
    
        handleMouseUp() {
            this.isMouseDown = false;
            this.container.classList.remove('cursor-grabbing');
        }
    }
    
    class ModalManager {
        constructor(modalId, backdropId) {
            this.modal = document.getElementById(modalId);
            this.content = this.modal.querySelector('.p-6');
            this.dragHandle = this.modal.querySelector('.modal-drag-handle');
            this.backdrop = document.getElementById(backdropId);
            
            this.state = CONSTANTS.MODAL.STATES.CLOSED;
            this.velocityTracker = new VelocityTracker();
            this.touchData = {
                startY: 0,
                currentY: 0,
                initialHeight: 0,
                isDragging: false,
                lastTapTime: 0
            };

            this.setupEventListeners();
        }

        setupEventListeners() {
            this.dragHandle.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            this.dragHandle.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            this.dragHandle.addEventListener('touchend', this.handleTouchEnd.bind(this));
            
            this.content.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            this.content.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            this.content.addEventListener('touchend', this.handleTouchEnd.bind(this));
            
            this.backdrop.addEventListener('click', () => this.hide());
            window.addEventListener('resize', () => {
                if (this.state !== CONSTANTS.MODAL.STATES.CLOSED) {
                    this.updateState(this.state);
                }
            });
        }

        setPosition(position) {
            if (this.state !== CONSTANTS.MODAL.STATES.CLOSED) {
                const maxPosition = window.innerHeight - this.touchData.initialHeight;
                position = Math.max(0, Math.min(maxPosition, position));
            }
            this.modal.style.transform = `translateY(${position}px)`;
        }

        animate(targetPosition, duration = CONSTANTS.MODAL.ANIMATION_DURATION) {
            this.modal.style.transition = `transform ${duration}ms ease-out`;
            this.setPosition(targetPosition);
            setTimeout(() => {
                this.modal.style.transition = '';
            }, duration);
        }

        updateState(newState) {
            this.state = newState;
            
            switch (newState) {
                case CONSTANTS.MODAL.STATES.FULL:
                    this.animate(0);
                    this.modal.classList.add('full-screen');
                    break;
                case CONSTANTS.MODAL.STATES.PARTIAL:
                    const partialHeight = window.innerHeight * CONSTANTS.MODAL.PARTIAL_HEIGHT_RATIO;
                    this.animate(window.innerHeight - partialHeight);
                    this.modal.classList.remove('full-screen');
                    break;
                case CONSTANTS.MODAL.STATES.CLOSED:
                    this.hide();
                    break;
            }
        }

        handleTouchStart(e) {
            const touch = e.touches[0];
            this.touchData.startY = touch.pageY;
            this.touchData.currentY = touch.pageY;
            this.touchData.initialHeight = this.modal.getBoundingClientRect().height;
            this.touchData.isDragging = true;

            const currentTime = Date.now();
            const tapLength = currentTime - this.touchData.lastTapTime;
            
            if (tapLength < CONSTANTS.MODAL.DOUBLE_TAP_DELAY && tapLength > 0) {
                this.updateState(this.state === CONSTANTS.MODAL.STATES.FULL ? 
                    CONSTANTS.MODAL.STATES.PARTIAL : 
                    CONSTANTS.MODAL.STATES.FULL
                );
            }
            this.touchData.lastTapTime = currentTime;

            this.velocityTracker.reset();
            this.velocityTracker.track(touch.pageY, e.timeStamp);
        }

        handleTouchMove(e) {
            if (!this.touchData.isDragging) return;
            
            const touch = e.touches[0];
            const deltaY = touch.pageY - this.touchData.startY;
            this.touchData.currentY = touch.pageY;

            this.velocityTracker.track(touch.pageY, e.timeStamp);

            const isAtTop = this.content.scrollTop <= 0;
            const isAtBottom = this.content.scrollTop + this.content.clientHeight >= this.content.scrollHeight;
            
            if ((deltaY > 0 && isAtTop) || 
                (this.state === CONSTANTS.MODAL.STATES.FULL && deltaY < 0) ||
                (isAtTop && deltaY > 0) || 
                (isAtBottom && deltaY < 0)) {
                e.preventDefault();
                this.setPosition(deltaY);
            }
        }

        handleTouchEnd() {
            if (!this.touchData.isDragging) return;
            this.touchData.isDragging = false;

            const velocity = this.velocityTracker.calculateVelocity();
            const deltaY = this.touchData.currentY - this.touchData.startY;

            if (Math.abs(velocity) > CONSTANTS.MODAL.VELOCITY_THRESHOLD) {
                this.updateState(velocity > 0 ? CONSTANTS.MODAL.STATES.CLOSED : CONSTANTS.MODAL.STATES.FULL);
            } else if (Math.abs(deltaY) > CONSTANTS.MODAL.MIN_DRAG_THRESHOLD) {
                if (deltaY > this.touchData.initialHeight * 0.3) {
                    this.updateState(CONSTANTS.MODAL.STATES.CLOSED);
                } else if (deltaY < -this.touchData.initialHeight * 0.3) {
                    this.updateState(CONSTANTS.MODAL.STATES.FULL);
                } else {
                    this.updateState(CONSTANTS.MODAL.STATES.PARTIAL);
                }
            } else {
                this.updateState(this.state);
            }
        }

        show(title, description, instructions) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalDescription').textContent = description;
            
            const instructionsList = document.getElementById('modalInstructions');
            instructionsList.innerHTML = instructions
                .split('\n')
                .filter(step => step.trim())
                .map(step => `<li class="instruction-step">${step}</li>`)
                .join('');
            
            this.modal.classList.add('active');
            this.backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            this.updateState(CONSTANTS.MODAL.STATES.PARTIAL);
        }

        hide() {
            this.modal.classList.remove('active', 'full-screen');
            this.backdrop.classList.remove('active');
            document.body.style.overflow = '';
            this.setPosition(window.innerHeight);
            this.state = CONSTANTS.MODAL.STATES.CLOSED;
        }
    }

    class RobotGuide {
        constructor() {
            this.steps = [
                {
                    title: "¡Bienvenido a SmartWaste! 👋",
                    message: "Soy tu asistente virtual y estoy aquí para mostrarte cómo funciona nuestra aplicación."
                },
                {
                    title: "Escaneo Inteligente 📸",
                    message: "Usa la cámara para identificar y clasificar tus residuos automáticamente. ¡Es fácil y rápido!"
                },
                {
                    title: "Puntos de Reciclaje 📍",
                    message: "Encuentra los puntos de reciclaje más cercanos y obtén direcciones para llegar a ellos."
                },
                {
                    title: "Tu Impacto Ambiental 🌱",
                    message: "Haz seguimiento de tu contribución al medio ambiente midiendo el CO₂ y agua ahorrada."
                },
                {
                    title: "Categorías de Residuos ♻️",
                    message: "Aprende sobre diferentes tipos de residuos y cómo reciclarlos correctamente."
                }
            ];

            this.currentStep = 0;
            this.robot = null;
            this.messagesContainer = null;
            this.progressDots = null;
            this.nextButton = null;
        }

        init() {
            this.robot = document.getElementById('robotMascot');
            if (!this.robot) return;

            this.messagesContainer = this.robot.querySelector('.messages-container');
            this.progressDots = this.robot.querySelector('.progress-dots');
            this.nextButton = this.robot.querySelector('.next-button');

            this.setupProgressDots();
            this.updateMessage();
            this.checkVisibility();
            this.setupEventListeners();
        }

        setupProgressDots() {
            this.progressDots.innerHTML = this.steps
                .map((_, index) => `
                    <div class="dot ${index === 0 ? 'active' : ''}"></div>
                `)
                .join('');
        }

        updateMessage() {
            const step = this.steps[this.currentStep];
            
            this.messagesContainer.innerHTML = `
                <div class="message active">
                    <h3 class="font-bold text-emerald-800 mb-2">${step.title}</h3>
                    <p class="text-sm text-emerald-700">${step.message}</p>
                </div>
            `;

            // Update progress dots
            const dots = this.progressDots.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                dot.className = `dot ${index === this.currentStep ? 'active' : ''}`;
            });

            // Update button text
            if (this.nextButton) {
                this.nextButton.innerHTML = `
                    ${this.currentStep === this.steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                    <i class="fas fa-chevron-right ml-1"></i>
                `;
            }
        }

        checkVisibility() {
            const hasSeenGuide = localStorage.getItem('hasSeenGuide');
            if (hasSeenGuide === 'true') {
                this.hide();
            }
        }

        setupEventListeners() {
            if (this.nextButton) {
                this.nextButton.addEventListener('click', () => this.nextStep());
            }

            // Optional: Add swipe gestures for mobile
            let touchStartX = 0;
            let touchEndX = 0;

            this.robot.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.robot.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }

        handleSwipe(startX, endX) {
            const SWIPE_THRESHOLD = 50;
            const difference = startX - endX;

            if (Math.abs(difference) > SWIPE_THRESHOLD) {
                if (difference > 0) {
                    // Swipe left - next step
                    this.nextStep();
                } else {
                    // Swipe right - previous step
                    this.previousStep();
                }
            }
        }

        nextStep() {
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.updateMessage();
            } else {
                this.completeGuide();
            }
        }

        previousStep() {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.updateMessage();
            }
        }

        completeGuide() {
            this.hide();
            localStorage.setItem('hasSeenGuide', 'true');
            
            // Optional: Trigger completion event
            const event = new CustomEvent('robotGuideCompleted');
            document.dispatchEvent(event);
        }

        hide() {
            if (this.robot) {
                this.robot.classList.add('hidden');
            }
        }

        show() {
            if (this.robot) {
                this.robot.classList.remove('hidden');
            }
        }

        reset() {
            this.currentStep = 0;
            localStorage.removeItem('hasSeenGuide');
            this.updateMessage();
            this.show();
        }
    }

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize Animation Manager
        const animationManager = new AnimationManager();
        
        // Initialize Swipe Handler if container exists
        const categoryContainer = document.querySelector('.swipe-container');
        if (categoryContainer) {
            new CategorySwipeHandler(categoryContainer);
        }

        // Initialize Modal Manager
        const modalManager = new ModalManager('instructionModal', 'modalBackdrop');
        
        // Initialize Robot Guide
        const robotGuide = new RobotGuide();
        robotGuide.init();
        
        // Expose necessary methods to window
        window.showInstructions = modalManager.show.bind(modalManager);
        window.hideInstructions = modalManager.hide.bind(modalManager);
        window.resetRobotGuide = robotGuide.reset.bind(robotGuide);

        // Optional: Listen for robot guide completion
        document.addEventListener('robotGuideCompleted', () => {
            console.log('Robot guide completed!');
            // Add any additional completion handlers here
        });
    });
})();


