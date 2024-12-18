document.addEventListener('DOMContentLoaded', () => {
    // Initialize the UI
    const ui = new UI();

    // Set up compression slider
    const compressionSlider = document.getElementById('compressionLevel');
    const compressionValue = document.getElementById('compressionValue');
    
    if (compressionSlider && compressionValue) {
        compressionSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            compressionValue.textContent = `${Math.round((value / 9) * 100)}%`;
        });
    }

    // Handle service worker registration for PWA support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('ServiceWorker registration successful:', registration.scope);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('ServiceWorker registration failed:', error);
            }
        });
    }
});

// Update notification functionality
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <p>A new version is available!</p>
            <button onclick="window.location.reload()">Update Now</button>
        </div>
    `;
    document.body.appendChild(notification);
}

// Handle offline/online status
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const status = navigator.onLine;
    document.body.classList.toggle('offline', !status);
    
    if (!status) {
        showOfflineNotification();
    }
}

function showOfflineNotification() {
    const notification = document.createElement('div');
    notification.className = 'offline-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-wifi-slash"></i>
            <p>You are currently offline. Some features may be limited.</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Handle beforeinstallprompt event for PWA installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install prompt if user hasn't installed the app
    if (!localStorage.getItem('pwaInstalled')) {
        showInstallPrompt();
    }
});

function showInstallPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'install-prompt';
    prompt.innerHTML = `
        <div class="prompt-content">
            <p>Install FileForge for easier access!</p>
            <div class="prompt-buttons">
                <button id="installBtn">Install</button>
                <button id="dismissBtn">Not Now</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(prompt);
    
    document.getElementById('installBtn').addEventListener('click', async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const result = await deferredPrompt.userChoice;
            
            if (result.outcome === 'accepted') {
                localStorage.setItem('pwaInstalled', 'true');
            }
            
            deferredPrompt = null;
        }
        prompt.remove();
    });
    
    document.getElementById('dismissBtn').addEventListener('click', () => {
        prompt.remove();
    });
}