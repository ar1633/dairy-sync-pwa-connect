import React, { useState, useEffect } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { PWAInstaller } from '@/utils/pwaInstaller';

const PWAInstallMenuItem = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(PWAInstaller.isPWA());
    setIsInstallable(PWAInstaller.isInstallable());

    const handleBeforeInstallPrompt = () => setIsInstallable(true);
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isPWA) return null;

  const handleInstall = async () => {
    const installed = await PWAInstaller.installPWA();
    if (!installed) {
      PWAInstaller.showManualInstallInstructions();
    }
  };

  return (
    <button
      className="flex items-center w-full px-4 py-2 text-sm hover:bg-green-50"
      onClick={isInstallable ? handleInstall : PWAInstaller.showManualInstallInstructions}
      type="button"
    >
      {isInstallable ? <Download className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
      {isInstallable ? 'Install App' : 'Install Guide'}
    </button>
  );
};

export default PWAInstallMenuItem;
