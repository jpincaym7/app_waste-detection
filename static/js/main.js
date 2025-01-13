// Bottom Navigation Handler
document.addEventListener('DOMContentLoaded', function() {
    const trigger = document.getElementById('bottomNavTrigger');
    const bottomNav = document.getElementById('bottomNav');
    let isOpen = false;

    if (trigger && bottomNav) {
        trigger.addEventListener('click', () => {
            isOpen = !isOpen;
            bottomNav.classList.toggle('active');
            trigger.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            
            // Add rotation animation to the trigger button
            trigger.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            trigger.style.transition = 'transform 0.3s ease';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (isOpen && !bottomNav.contains(e.target) && !trigger.contains(e.target)) {
                isOpen = false;
                bottomNav.classList.remove('active');
                trigger.innerHTML = '<i class="fas fa-bars"></i>';
                trigger.style.transform = 'rotate(0deg)';
            }
        });
    }
});

// Enhanced Dropdown Menu Handler
document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('#authUserMenu button');
    const dropdownMenu = document.querySelector('#dropdownMenu');
    
    if (button && dropdownMenu) {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
            
            // Add subtle animation
            if (!dropdownMenu.classList.contains('hidden')) {
                dropdownMenu.style.transform = 'scale(1)';
                dropdownMenu.style.opacity = '1';
            } else {
                dropdownMenu.style.transform = 'scale(0.95)';
                dropdownMenu.style.opacity = '0';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownMenu.classList.contains('hidden') && 
                !dropdownMenu.contains(e.target) && 
                !button.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
                dropdownMenu.style.transform = 'scale(0.95)';
                dropdownMenu.style.opacity = '0';
            }
        });
    }
});

// Enhanced Toast System
document.addEventListener('DOMContentLoaded', function() {
    function removeToast(toast) {
        toast.classList.add('animate-toast-out');
        setTimeout(() => toast.remove(), 300);
    }

    const closeButtons = document.querySelectorAll('.close-toast');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const toast = button.closest('.toast-message');
            removeToast(toast);
        });
    });

    // Enhanced toast handling
    const toasts = document.querySelectorAll('.toast-message');
    toasts.forEach(toast => {
        let timeoutId;
        let swipeStartX = 0;
        let swipeEndX = 0;

        const startTimer = () => {
            timeoutId = setTimeout(() => removeToast(toast), 5000);
        };

        // Pause/Resume timer on hover
        toast.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            const progressBar = toast.querySelector('.progress-bar');
            if (progressBar) progressBar.style.animationPlayState = 'paused';
        });

        toast.addEventListener('mouseleave', () => {
            const progressBar = toast.querySelector('.progress-bar');
            if (progressBar) progressBar.style.animationPlayState = 'running';
            startTimer();
        });

        // Enhanced touch gestures
        toast.addEventListener('touchstart', e => {
            swipeStartX = e.touches[0].clientX;
            clearTimeout(timeoutId);
        });

        toast.addEventListener('touchmove', e => {
            if (swipeStartX) {
                const deltaX = e.touches[0].clientX - swipeStartX;
                toast.style.transform = `translateX(${deltaX}px)`;
                toast.style.opacity = 1 - Math.abs(deltaX) / 200;
            }
        });

        toast.addEventListener('touchend', e => {
            swipeEndX = e.changedTouches[0].clientX;
            const deltaX = swipeEndX - swipeStartX;

            if (Math.abs(deltaX) > 100) {
                toast.style.transition = 'all 0.3s ease';
                toast.style.transform = `translateX(${deltaX > 0 ? '200%' : '-200%'})`;
                toast.style.opacity = '0';
                setTimeout(() => removeToast(toast), 300);
            } else {
                toast.style.transition = 'all 0.3s ease';
                toast.style.transform = '';
                toast.style.opacity = '';
                startTimer();
            }

            swipeStartX = 0;
        });

        startTimer();
    });
});

// Enhanced Page Loader
document.addEventListener('DOMContentLoaded', function() {
    const loaderWrapper = document.getElementById('loader-wrapper');
    const content = document.querySelector('.content');
    
    // Add minimum loading time and smooth transition
    setTimeout(() => {
        if (loaderWrapper) {
            loaderWrapper.style.opacity = '0';
            setTimeout(() => {
                loaderWrapper.style.display = 'none';
                if (content) content.style.opacity = '1';
            }, 500);
        }
    }, 1500);
});

// Variables for PWA installation
let deferredPrompt;
const installButton = document.getElementById('installPWA');

// Function to detect Android device
function isAndroidDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('android');
}

// Function to show install confirmation
function showInstallConfirmation() {
    return Swal.fire({
        title: '¿Instalar SmartWaste?',
        text: 'Instala nuestra aplicación para una mejor experiencia',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#059669',
        cancelButtonColor: '#dc2626',
        confirmButtonText: 'Sí, instalar',
        cancelButtonText: 'No, gracias'
    });
}

// Function to show device not supported message
function showDeviceNotSupported() {
    Swal.fire({
        title: 'Dispositivo no compatible',
        text: 'La instalación solo está disponible para dispositivos Android',
        icon: 'warning',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
    });
}

// Handle the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Only proceed if it's an Android device
    if (isAndroidDevice()) {
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show the install button
        installButton.classList.remove('hidden');
    } else {
        // Hide the install button for non-Android devices
        installButton.classList.add('hidden');
    }
});

// Installation button click handler
installButton.addEventListener('click', async (e) => {
    if (!isAndroidDevice()) {
        showDeviceNotSupported();
        return;
    }

    // Show confirmation dialog
    const result = await showInstallConfirmation();
    
    if (result.isConfirmed) {
        // Hide the installation button
        installButton.classList.add('hidden');
        
        // Show the prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the PWA installation');
                showInstallationSuccess();
            } else {
                console.log('User dismissed the PWA installation');
                // Show the button again in case they want to install later
                installButton.classList.remove('hidden');
            }
            
            // Clear the deferredPrompt variable
            deferredPrompt = null;
        });
    }
});

// Handle successful installation
window.addEventListener('appinstalled', (evt) => {
    // Hide the install button after successful installation
    installButton.classList.add('hidden');
    console.log('PWA was installed');
});

// Function to show success message using SweetAlert2
function showInstallationSuccess() {
    Swal.fire({
        icon: 'success',
        title: '¡Instalación Exitosa!',
        text: 'La aplicación ha sido instalada correctamente',
        confirmButtonColor: '#059669',
        timer: 3000,
        timerProgressBar: true
    });
}

// Check if the app is running in standalone mode (already installed)
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    // Hide install button if app is already installed
    installButton.classList.add('hidden');
}
