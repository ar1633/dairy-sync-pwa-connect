
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Usb, HardDrive, FileText, CheckCircle, AlertCircle, Play, Square } from 'lucide-react';
import { USBFileProcessor } from '@/utils/eipParser';
import { useToast } from '@/hooks/use-toast';

const USBMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial monitoring status
    setIsMonitoring(USBFileProcessor.getMonitoringStatus());
    
    // Setup USB device listeners if WebUSB is supported
    if ('usb' in navigator && navigator.usb) {
      const handleConnect = (event: any) => {
        const device = event.device;
        setConnectedDevices(prev => [...prev, device]);
        toast({
          title: "USB Device Connected",
          description: `${device.productName || 'Unknown device'} connected`,
        });
      };

      const handleDisconnect = (event: any) => {
        const device = event.device;
        setConnectedDevices(prev => prev.filter(d => d !== device));
        toast({
          title: "USB Device Disconnected",
          description: `${device.productName || 'Unknown device'} disconnected`,
        });
      };

      const usb = navigator.usb as any;
      usb.addEventListener('connect', handleConnect);
      usb.addEventListener('disconnect', handleDisconnect);

      return () => {
        usb.removeEventListener('connect', handleConnect);
        usb.removeEventListener('disconnect', handleDisconnect);
      };
    }
  }, [toast]);

  const toggleMonitoring = async () => {
    if (isMonitoring) {
      USBFileProcessor.stopUSBMonitoring();
      setIsMonitoring(false);
      toast({
        title: "USB Monitoring Stopped",
        description: "USB monitoring has been disabled",
      });
    } else {
      await USBFileProcessor.startUSBMonitoring();
      setIsMonitoring(true);
      toast({
        title: "USB Monitoring Started",
        description: "Now monitoring for USB devices and EIP files",
      });
    }
  };

  const handleAutoProcess = async () => {
    try {
      await USBFileProcessor.autoProcessEIPDirectory();
      toast({
        title: "Auto-Processing Initiated",
        description: "Select the USB drive directory to auto-process EIP files",
      });
    } catch (error) {
      toast({
        title: "Auto-Processing Failed",
        description: "Could not initiate auto-processing",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Usb className="h-5 w-5" />
            USB Drive Monitor
          </CardTitle>
          <CardDescription>
            Automatic detection and processing of EIP files from USB drives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="usb-monitoring">USB Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect USB drives and scan for EIP files
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="usb-monitoring"
                checked={isMonitoring}
                onCheckedChange={toggleMonitoring}
              />
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleAutoProcess}
              disabled={!isMonitoring}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Auto-Process Directory
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setProcessedFiles([])}
              className="w-full"
            >
              <Square className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </CardContent>
      </Card>

      {!('usb' in navigator) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">WebUSB Not Supported</p>
                <p className="text-sm text-yellow-700">
                  Your browser doesn't support WebUSB. Please use Chrome or Edge for automatic USB detection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Connected USB Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectedDevices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Usb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No USB devices detected</p>
              <p className="text-sm">Connect a USB drive to begin monitoring</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connectedDevices.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{device.productName || 'Unknown Device'}</p>
                      <p className="text-sm text-muted-foreground">
                        {device.manufacturerName || 'Unknown Manufacturer'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Connected</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {processedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Auto-Processed Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{fileName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>PWA Features & Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Offline Capability:</strong> Works without internet connection
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Auto-Install:</strong> Can be installed directly from browser
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>LAN Sync:</strong> Real-time data sync across devices
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <strong>Browser Requirement:</strong> Chrome/Edge needed for USB features
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default USBMonitor;
