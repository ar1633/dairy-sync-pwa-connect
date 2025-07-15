
// PWA utilities for offline support and installation

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export const checkForPWAInstall = () => {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    
    // Show install button or banner
    showInstallPromotion();
  });

  const showInstallPromotion = () => {
    // Create install notification
    const installBanner = document.createElement('div');
    installBanner.innerHTML = `
      <div id="install-banner" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #16a34a;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 1000;
        font-family: system-ui;
      ">
        <span>Install Krishi DairySync for better performance!</span>
        <button id="install-btn" style="
          background: white;
          color: #16a34a;
          border: none;
          padding: 8px 16px;
          margin-left: 12px;
          border-radius: 4px;
          cursor: pointer;
        ">Install</button>
        <button id="dismiss-btn" style="
          background: none;
          color: white;
          border: 1px solid white;
          padding: 8px 16px;
          margin-left: 8px;
          border-radius: 4px;
          cursor: pointer;
        ">Later</button>
      </div>
    `;
    
    document.body.appendChild(installBanner);
    
    document.getElementById('install-btn')?.addEventListener('click', () => {
      installPWA(deferredPrompt);
      document.getElementById('install-banner')?.remove();
    });
    
    document.getElementById('dismiss-btn')?.addEventListener('click', () => {
      document.getElementById('install-banner')?.remove();
    });
  };

  return deferredPrompt;
};

export const installPWA = (deferredPrompt: any) => {
  if (deferredPrompt) {
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
        showSuccessNotification('App installed successfully!');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  }
};

const showUpdateNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('App Update Available', {
      body: 'A new version of Krishi DairySync is available. Refresh to update.',
      icon: '/icons/icon-96x96.png',
      actions: [
        { action: 'refresh', title: 'Refresh Now' }
      ]
    });
  }
};

const showSuccessNotification = (message: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Krishi DairySync', {
      body: message,
      icon: '/icons/icon-96x96.png'
    });
  }
};

// Electron detection and setup
export const isElectron = () => {
  return !!(window as any).electronAPI;
};

export const setupElectronFeatures = () => {
  if (isElectron()) {
    console.log('Running in Electron environment');
    
    // Setup Electron-specific features
    const electronAPI = (window as any).electronAPI;
    
    // File system access for EIP files
    if (electronAPI.fileSystem) {
      window.addEventListener('electron-file-dropped', (event: any) => {
        const files = event.detail.files;
        files.forEach((filePath: string) => {
          if (filePath.endsWith('.eip')) {
            electronAPI.fileSystem.readFile(filePath)
              .then((content: string) => {
                // Process EIP file content
                console.log('Processing EIP file from Electron:', filePath);
                // Handle the file content here
              });
          }
        });
      });
    }
    
    // Setup USB monitoring in Electron
    if (electronAPI.usb) {
      electronAPI.usb.onConnect((device: any) => {
        console.log('USB device connected in Electron:', device);
        // Trigger EIP file detection
      });
    }
  }
};

// Enhanced offline capabilities
export const setupOfflineMode = () => {
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('App is online');
    showSuccessNotification('Connection restored - syncing data...');
    // Trigger data sync when online
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline');
    showSuccessNotification('App is offline - data will sync when connection is restored');
  });
  
  // Cache management
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      console.log('Available caches:', cacheNames);
    });
  }
};

// Initialize all PWA features
export const initializePWA = () => {
  registerServiceWorker();
  checkForPWAInstall();
  setupElectronFeatures();
  setupOfflineMode();
  
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showSuccessNotification('Notifications enabled for Krishi DairySync');
      }
    });
  }
};
