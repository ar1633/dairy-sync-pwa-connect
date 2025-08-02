// PWA Installation and Setup Utilities
export class PWAInstaller {
  private static deferredPrompt: any = null;

  // Initialize PWA installer
  static initialize(): void {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.hideInstallBanner();
      this.showWelcomeMessage();
    });

    // Show install banner if installable and not already installed
    if (!this.isPWA() && this.isInstallable()) {
      this.showInstallBanner();
    }
  }

  // Show install banner
  private static showInstallBanner(): void {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed top-0 left-0 right-0 bg-green-600 text-white p-4 z-50 shadow-lg';
    banner.innerHTML = `
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-white p-2 rounded">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold">Install Krishi DairySync</h3>
            <p class="text-sm opacity-90">Install this app on your device for the best experience</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button id="pwa-install-btn" class="bg-white text-green-600 px-4 py-2 rounded font-medium hover:bg-gray-100">
            Install
          </button>
          <button id="pwa-dismiss-btn" class="text-white hover:bg-green-700 p-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
      this.installPWA();
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  // Hide install banner
  private static hideInstallBanner(): void {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Install PWA
  static async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('PWA install prompt not available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA installation');
        this.hideInstallBanner();
        return true;
      } else {
        console.log('User dismissed PWA installation');
        return false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  // Show welcome message after installation
  private static showWelcomeMessage(): void {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <div>
          <h4 class="font-semibold">App Installed Successfully!</h4>
          <p class="text-sm">You can now access Krishi DairySync from your home screen</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  // Check if PWA is installable
  static isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  // Check if running as PWA
  static isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Show manual install instructions for unsupported browsers
  static showManualInstallInstructions(): void {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">Install Krishi DairySync</h3>
        <div class="space-y-4">
          <div>
            <h4 class="font-medium">Chrome/Edge (Recommended):</h4>
            <ol class="text-sm text-gray-600 list-decimal list-inside space-y-1">
              <li>Click the install icon in the address bar</li>
              <li>Or use the three-dot menu → "Install Krishi DairySync"</li>
            </ol>
          </div>
          <div>
            <h4 class="font-medium">Safari (iOS):</h4>
            <ol class="text-sm text-gray-600 list-decimal list-inside space-y-1">
              <li>Tap the share button</li>
              <li>Select "Add to Home Screen"</li>
            </ol>
          </div>
          <div>
            <h4 class="font-medium">Firefox:</h4>
            <ol class="text-sm text-gray-600 list-decimal list-inside space-y-1">
              <li>Click the three-line menu</li>
              <li>Select "Install" or "Add to Home Screen"</li>
            </ol>
          </div>
        </div>
        <button id="close-install-modal" class="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Got it
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('close-install-modal')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}
