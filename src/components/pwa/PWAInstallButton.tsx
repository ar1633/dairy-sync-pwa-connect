import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { PWAInstaller } from '@/utils/pwaInstaller';
import { toast } from 'sonner';

const PWAInstallButton = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Initialize PWA installer
    PWAInstaller.initialize();
    
    // Check if app is already installed as PWA
    setIsPWA(PWAInstaller.isPWA());
    
    // Listen for install prompt availability
    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true);
    };
    
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsPWA(true);
      toast.success('App installed successfully!');
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check initial state
    if (PWAInstaller.isInstallable()) {
      setIsInstallable(true);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    try {
      const installed = await PWAInstaller.installPWA();
      if (!installed) {
        // Show manual instructions if automatic install failed
        PWAInstaller.showManualInstallInstructions();
      }
    } catch (error) {
      console.error('Install failed:', error);
      toast.error('Installation failed. Please try again.');
    }
  };

  // Don't show button if already installed as PWA
  if (isPWA) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isInstallable ? (
        <Button
          onClick={handleInstall}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
          size="lg"
        >
          <Download className="h-5 w-5 mr-2" />
          Install App
        </Button>
      ) : (
        <Button
          onClick={() => PWAInstaller.showManualInstallInstructions()}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
          size="lg"
        >
          <Smartphone className="h-5 w-5 mr-2" />
          Install Guide
        </Button>
      )}
    </div>
  );
};

export default PWAInstallButton;