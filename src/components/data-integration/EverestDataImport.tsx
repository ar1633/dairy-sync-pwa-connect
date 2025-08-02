import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Database, Wifi, WifiOff, RefreshCw } from "lucide-react";

interface MilkReading {
  id: string;
  farmerId: string;
  farmerName: string;
  centreId: string;
  dateTime: string;
  shift: "morning" | "evening";
  quantity: number;
  fat: number;
  snf: number;
  degree: number;
  rate: number;
  amount: number;
  status: "pending" | "processed" | "synced";
}

const EverestDataImport = () => {
  const [language, setLanguage] = useState<"english" | "marathi">("english");
  const [isConnected, setIsConnected] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [connectionSettings, setConnectionSettings] = useState({
    deviceId: "",
    portNumber: "COM3",
    baudRate: "9600"
  });

  const [milkReadings, setMilkReadings] = useState<MilkReading[]>([
    {
      id: "1",
      farmerId: "F001",
      farmerName: "राम पाटील",
      centreId: "C001",
      dateTime: "2025-01-13 06:30:00",
      shift: "morning",
      quantity: 5.2,
      fat: 4.1,
      snf: 8.6,
      degree: 28.5,
      rate: 32.50,
      amount: 169.00,
      status: "pending"
    },
    {
      id: "2",
      farmerId: "F002",
      farmerName: "सुनिता शर्मा",
      centreId: "C001",
      dateTime: "2025-01-13 06:35:00",
      shift: "morning",
      quantity: 3.8,
      fat: 3.9,
      snf: 8.4,
      degree: 27.8,
      rate: 31.25,
      amount: 118.75,
      status: "processed"
    }
  ]);

  const connectToDevice = () => {
    setIsImporting(true);
    setImportProgress(0);
    
    // Simulate connection process
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          setIsConnected(true);
          toast({
            title: language === "english" ? "Device Connected" : "डिव्हाइस जोडले",
            description: language === "english" ? "Successfully connected to Everest Ekomilk device" : "एव्हरेस्ट इकॉमिल्क डिव्हाइसशी यशस्वीरित्या जोडले"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const importData = async () => {
    setIsImporting(true);
    setImportProgress(0);
    // Simulate data import progress
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          // Fetch new readings from backend
          fetch("/api/everest-data")
            .then(res => res.ok ? res.json() : [])
            .then(newReadings => setMilkReadings(prev => [...newReadings, ...prev]));
          toast({
            title: language === "english" ? "Data Imported" : "डेटा आयात केला",
            description: language === "english" ? "New milk readings imported successfully" : "नवीन दूध रीडिंग यशस्वीरित्या आयात केले"
          });
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const processReading = (id: string) => {
    setMilkReadings(readings => 
      readings.map(reading => 
        reading.id === id 
          ? { ...reading, status: "processed" as const }
          : reading
      )
    );
    
    toast({
      title: language === "english" ? "Reading Processed" : "रीडिंग प्रक्रिया केली",
      description: language === "english" ? "Milk reading processed and payment calculated" : "दूध रीडिंग प्रक्रिया केली आणि पेमेंट मोजले"
    });
  };

  const downloadReport = () => {
    toast({
      title: language === "english" ? "Download Started" : "डाउनलोड सुरू झाले",
      description: language === "english" ? "Milk collection report download started" : "दूध संकलन अहवाल डाउनलोड सुरू झाले"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            {language === "english" ? "Everest Ekomilk Integration" : "एव्हरेस्ट इकॉमिल्क एकीकरण"}
          </h2>
          <p className="text-gray-600">
            {language === "english" ? "Import milk quality data from Everest Ekomilk machine" : "एव्हरेस्ट इकॉमिल्क मशीनमधून दूध गुणवत्ता डेटा आयात करा"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "english" ? "marathi" : "english")}
          >
            {language === "english" ? "मराठी" : "English"}
          </Button>
          <Button onClick={downloadReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {language === "english" ? "Download Report" : "अहवाल डाउनलोड"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
              {language === "english" ? "Device Connection" : "डिव्हाइस कनेक्शन"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{language === "english" ? "Device ID" : "डिव्हाइस आयडी"}</Label>
              <Input
                value={connectionSettings.deviceId}
                onChange={(e) => setConnectionSettings(prev => ({ ...prev, deviceId: e.target.value }))}
                placeholder={language === "english" ? "Enter device ID" : "डिव्हाइस आयडी प्रविष्ट करा"}
              />
            </div>
            
            <div>
              <Label>{language === "english" ? "COM Port" : "COM पोर्ट"}</Label>
              <Input
                value={connectionSettings.portNumber}
                onChange={(e) => setConnectionSettings(prev => ({ ...prev, portNumber: e.target.value }))}
                placeholder="COM3"
              />
            </div>
            
            <div>
              <Label>{language === "english" ? "Baud Rate" : "बॉड रेट"}</Label>
              <Input
                value={connectionSettings.baudRate}
                onChange={(e) => setConnectionSettings(prev => ({ ...prev, baudRate: e.target.value }))}
                placeholder="9600"
              />
            </div>

            <div className="space-y-2">
              <Badge variant={isConnected ? "default" : "destructive"} className="w-full justify-center">
                {isConnected 
                  ? (language === "english" ? "Connected" : "जोडले")
                  : (language === "english" ? "Disconnected" : "डिस्कनेक्ट")
                }
              </Badge>
              
              {isImporting && (
                <div className="space-y-2">
                  <Progress value={importProgress} className="w-full" />
                  <p className="text-sm text-center text-gray-600">
                    {language === "english" ? "Connecting..." : "जोडत आहे..."} {importProgress}%
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button 
                onClick={connectToDevice} 
                disabled={isImporting}
                className="w-full"
                variant={isConnected ? "outline" : "default"}
              >
                {isImporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="h-4 w-4 mr-2" />
                )}
                {language === "english" ? "Connect Device" : "डिव्हाइस जोडा"}
              </Button>
              
              <Button 
                onClick={importData}
                disabled={!isConnected || isImporting}
                className="w-full"
                variant="secondary"
              >
                <Upload className="h-4 w-4 mr-2" />
                {language === "english" ? "Import Data" : "डेटा आयात करा"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Milk Readings Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{language === "english" ? "Recent Milk Readings" : "अलीकडील दूध रीडिंग"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "english" ? "Farmer" : "शेतकरी"}</TableHead>
                    <TableHead>{language === "english" ? "Time" : "वेळ"}</TableHead>
                    <TableHead>{language === "english" ? "Qty (L)" : "प्रमाण (ली)"}</TableHead>
                    <TableHead>{language === "english" ? "Fat%" : "चरबी%"}</TableHead>
                    <TableHead>{language === "english" ? "SNF%" : "एसएनएफ%"}</TableHead>
                    <TableHead>{language === "english" ? "Rate" : "दर"}</TableHead>
                    <TableHead>{language === "english" ? "Amount" : "रक्कम"}</TableHead>
                    <TableHead>{language === "english" ? "Status" : "स्थिती"}</TableHead>
                    <TableHead>{language === "english" ? "Action" : "क्रिया"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milkReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell className="font-medium">{reading.farmerName}</TableCell>
                      <TableCell>{reading.dateTime.split(' ')[1]}</TableCell>
                      <TableCell>{reading.quantity}</TableCell>
                      <TableCell>{reading.fat}%</TableCell>
                      <TableCell>{reading.snf}%</TableCell>
                      <TableCell>₹{reading.rate}</TableCell>
                      <TableCell>₹{reading.amount}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            reading.status === "synced" ? "default" :
                            reading.status === "processed" ? "secondary" : "destructive"
                          }
                        >
                          {language === "english" 
                            ? reading.status.charAt(0).toUpperCase() + reading.status.slice(1)
                            : reading.status === "synced" ? "समक्रमित" :
                              reading.status === "processed" ? "प्रक्रिया केली" : "प्रलंबित"
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {reading.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => processReading(reading.id)}
                          >
                            {language === "english" ? "Process" : "प्रक्रिया"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default EverestDataImport;
