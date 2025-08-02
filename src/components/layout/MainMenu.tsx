import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import { PWAInstaller } from "@/utils/pwaInstaller";
import { toast } from "sonner";

const PWAInstallMenuItem = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Initialize PWA installer
    PWAInstaller.initialize();

    // Remove duplicate initialization
    setIsPWA(PWAInstaller.isPWA());

    // Listen for install prompt availability
    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsPWA(true);
      toast.success("App installed successfully!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Always check installable state on mount
    setIsInstallable(PWAInstaller.isInstallable());

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
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
      console.error("Install failed:", error);
      toast.error("Installation failed. Please try again.");
    }
  };

  // Don't show button if already installed as PWA
  if (isPWA) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isInstallable ? (
        <Button
          onClick={handleInstall}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      ) : (
        <Button
          onClick={() => PWAInstaller.showManualInstallInstructions()}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm"
          size="sm"
        >
          <Smartphone className="h-4 w-4 mr-2" />
          Install Guide
        </Button>
      )}
    </div>
  );
};

export default PWAInstallMenuItem;