
// PWA utilities for enhanced functionality
export class PWAUtils {
  
  // Register service worker with enhanced features
  static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.showUpdateNotification();
              }
            });
          }
        });
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
  
  // Show update notification
  private static showUpdateNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('App Update Available', {
        body: 'A new version of Krishi DairySync is available. Refresh to update.',
        icon: '/favicon.ico',
        tag: 'app-update',
        requireInteraction: true
      });
      
      notification.onclick = () => {
        window.location.reload();
        notification.close();
      };
    }
  }
  
  // Request notification permission
  static async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
  
  // Setup background sync for offline data
  static async setupBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }
  
  // Check if app is installed as PWA
  static isInstalledPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
  
  // Show install prompt
  static async showInstallPrompt(): Promise<boolean> {
    const deferredPrompt = (window as any).deferredPrompt;
    if (!deferredPrompt) {
      return false;
    }
    
    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      (window as any).deferredPrompt = null;
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }
  
  // Cache management
  static async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }
  
  // Get cache size
  static async getCacheSize(): Promise<number> {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }
  
  // Network status monitoring
  static setupNetworkMonitoring(): void {
    const updateOnlineStatus = () => {
      const status = navigator.onLine ? 'online' : 'offline';
      document.body.setAttribute('data-network-status', status);
      
      if (status === 'online') {
        // Trigger background sync when coming back online
        this.setupBackgroundSync();
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }
  
  // Show push notification
  static async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }
}

// Initialize PWA features
export const initializePWA = async (): Promise<void> => {
  await PWAUtils.registerServiceWorker();
  await PWAUtils.requestNotificationPermission();
  PWAUtils.setupNetworkMonitoring();
  
  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
  });
  
  console.log('PWA features initialized');
};
