import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Database, CheckCircle, Usb } from 'lucide-react';
import { DataService } from '@/services/dataService';
import { USBFileProcessor } from '@/utils/eipParser';
import USBMonitor from './USBMonitor';

const EIPFileProcessor = () => {
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setProcessing(true);
    const newProcessedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await USBFileProcessor.processUploadedFile(file);
        newProcessedFiles.push(file.name);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    setProcessedFiles(prev => [...prev, ...newProcessedFiles]);
    setProcessing(false);
    
    // Update stats
    const dbStats = await DataService.getDatabaseStats();
    setStats(dbStats);
  };

  const handleUSBDetection = async () => {
    setProcessing(true);
    try {
      await USBFileProcessor.detectAndProcessEIPFiles();
      const dbStats = await DataService.getDatabaseStats();
      setStats(dbStats);
    } catch (error) {
      console.error('USB detection error:', error);
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Processing</TabsTrigger>
          <TabsTrigger value="auto">Auto USB Monitor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                EIP File Processor
              </CardTitle>
              <CardDescription>
                Import milk collection data from EIP files (Ekomilk format)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eip-files">Upload EIP Files</Label>
                  <Input
                    id="eip-files"
                    type="file"
                    multiple
                    accept=".eip,.txt"
                    onChange={handleFileUpload}
                    disabled={processing}
                  />
                  <p className="text-sm text-gray-500">
                    Select multiple .eip files from your pendrive
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>USB Auto-Detection</Label>
                  <Button 
                    onClick={handleUSBDetection}
                    disabled={processing}
                    className="w-full"
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Detect & Process USB Files
                  </Button>
                  <p className="text-sm text-gray-500">
                    Automatically detect and process EIP files from USB drive
                  </p>
                </div>
              </div>

              {processing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Processing files...
                </div>
              )}

              {processedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Recently Processed Files</Label>
                  <div className="space-y-1">
                    {processedFiles.map((fileName, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="auto">
          <USBMonitor />
        </TabsContent>
      </Tabs>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats).map(([dbName, dbStats]: [string, any]) => (
                <div key={dbName} className="space-y-1">
                  <Label className="text-sm font-medium capitalize">
                    {dbName.replace(/([A-Z])/g, ' $1')}
                  </Label>
                  <div className="text-2xl font-bold">
                    {dbStats.doc_count || 0}
                  </div>
                  <p className="text-xs text-gray-500">records</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>EIP File Format Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>File Format:</strong> EIP files contain milk collection data in a specific format
            </div>
            <div>
              <strong>Header Format:</strong> DDMMYYYYHHMMSS...CC (Date, Month, Year, Time, Center Code)
            </div>
            <div>
              <strong>Data Format:</strong> FFFMQQQFFFSSSSRRRRRAAAAAAA (Farmer, Session, Quantity, Fat, SNF, Rate, Amount)
            </div>
            <div>
              <strong>Example:</strong>
              <code className="block bg-gray-100 p-2 mt-1 rounded">
                10072025094915000000000027<br/>
                009M036079150035000106541720000<br/>
                021M045088060015000053402020000<br/>
                ENDENDENDENDENDEND011
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EIPFileProcessor;
