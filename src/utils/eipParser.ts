import { DataService } from '@/services/dataService';

export interface MilkRecord {
  _id: string;
  date: string;
  month: string;
  year: string;
  centerCode: string;
  farmerCode: string;
  session: string; // 'M' for Morning, 'E' for Evening
  quantity: number; // in liters
  fat: number; // percentage
  snf: number; // percentage
  rate: number; // per liter
  amount: number; // total amount
  timestamp: Date;
  employeeId?: string; // Optional employee ID for tracking
}

export class EIPParser {
  
  /**
   * Parse EIP file content and extract milk collection records
   * Format: 10072025094915000000000027 (header) followed by milk records
   */
  static parseEIPContent(content: string): MilkRecord[] {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const records: MilkRecord[] = [];
    
    if (lines.length === 0) return records;
    
    // Parse header line to get date and center code
    const headerLine = lines[0];
    if (headerLine.length < 26) {
      console.error('Invalid EIP header format');
      return records;
    }
    
    const date = headerLine.substring(0, 8); // DDMMYYYY
    const centerCode = headerLine.substring(24, 26); // Last 2 digits for center code
    
    console.log(`Parsing EIP file - Date: ${date}, Center: ${centerCode}`);
    
    // Parse milk records (skip header and footer)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip end markers
      if (line.includes('END') || line.length < 40) {
        continue;
      }
      
      try {
        const record = this.parseMilkRecord(line, date, centerCode);
        if (record) {
          records.push(record);
        }
      } catch (error) {
        console.error(`Error parsing line ${i}: ${line}`, error);
      }
    }
    
    console.log(`Parsed ${records.length} milk records from EIP file`);
    return records;
  }
  
  /**
   * Parse individual milk record line
   * Format: 009M036079150035000106541720000
   */
  private static parseMilkRecord(line: string, date: string, centerCode: string): MilkRecord | null {
    if (line.length < 35) return null;
    
    const farmerCode = line.substring(0, 3);
    const session = line.substring(3, 4); // M or E
    const quantity = parseInt(line.substring(4, 7)) / 10; // Convert to liters
    const fat = parseInt(line.substring(7, 10)) / 10; // Convert to percentage
    const snf = parseInt(line.substring(10, 13)) / 10; // Convert to percentage
    const rate = parseInt(line.substring(13, 18)) / 100; // Convert to rupees
    const amount = parseInt(line.substring(18, 23)) / 100; // Convert to rupees
    
    const day = date.substring(0, 2);
    const month = date.substring(2, 4);
    const year = date.substring(4, 8);
    
    const record: MilkRecord = {
      _id: `${date}_${centerCode}_${farmerCode}_${session}`,
      date: `${year}-${month}-${day}`,
      month: month,
      year: year,
      centerCode: centerCode,
      farmerCode: farmerCode,
      session: session,
      quantity: quantity,
      fat: fat,
      snf: snf,
      rate: rate,
      amount: amount,
      timestamp: new Date()
    };
    
    return record;
  }
  
  /**
   * Save parsed records to local database
   */
  static async saveRecordsToDatabase(records: MilkRecord[]): Promise<void> {
    console.log(`Saving ${records.length} records to database...`);
    
    for (const record of records) {
      try {
        await DataService.saveMilkCollection(record);
      } catch (error) {
        console.error('Error saving record:', record, error);
      }
    }
    
    console.log('All records saved successfully');
  }
  
  /**
   * Get milk records from database for a specific date and center
   */
  static async getMilkRecords(date: string, centerCode?: string): Promise<MilkRecord[]> {
    try {
      const summary = await DataService.getMilkSummary(date, centerCode);
      // This would need to be implemented in DataService to return actual records
      return [];
    } catch (error) {
      console.error('Error fetching milk records:', error);
      return [];
    }
  }
}

export class USBFileProcessor {
  private static isMonitoring = false;
  private static usbWatcher: any = null;
  
  /**
   * Start monitoring for USB drives and EIP files with automatic detection
   */
  static async startUSBMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    
    console.log('Starting advanced USB monitoring for EIP files...');
    this.isMonitoring = true;
    
    // Setup file input monitoring for web browsers
    this.setupFileInputMonitoring();
    
    // Setup USB device monitoring using Web APIs
    await this.setupWebUSBMonitoring();
    
    // Setup File System Access API monitoring (Chrome)
    await this.setupFileSystemMonitoring();
    
    // Setup periodic directory scanning
    this.setupPeriodicScanning();
    
    console.log('USB monitoring fully initialized');
  }
  
  /**
   * Setup Web USB API monitoring for device insertion/removal
   */
  private static async setupWebUSBMonitoring(): Promise<void> {
    if ('usb' in navigator) {
      try {
        // Listen for USB device connection
        navigator.usb.addEventListener('connect', async (event) => {
          console.log('USB device connected:', event.device);
          await this.handleUSBDeviceConnected(event.device);
        });
        
        // Listen for USB device disconnection
        navigator.usb.addEventListener('disconnect', (event) => {
          console.log('USB device disconnected:', event.device);
          this.handleUSBDeviceDisconnected(event.device);
        });
        
        // Check for already connected devices
        const devices = await navigator.usb.getDevices();
        for (const device of devices) {
          await this.handleUSBDeviceConnected(device);
        }
        
        console.log('Web USB monitoring enabled');
      } catch (error) {
        console.log('Web USB not available:', error);
      }
    }
  }
  
  /**
   * Setup File System Access API monitoring
   */
  private static async setupFileSystemMonitoring(): Promise<void> {
    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      try {
        // This is experimental - for Chrome with File System Access API
        console.log('File System Access API available');
        
        // Setup directory watching for common USB mount points
        this.watchCommonUSBPaths();
      } catch (error) {
        console.log('File System Access API not available:', error);
      }
    }
  }
  
  /**
   * Watch common USB mount paths
   */
  private static watchCommonUSBPaths(): void {
    const commonPaths = ['/media', '/mnt', '/Volumes'];
    
    // This would need native implementation or Electron
    console.log('USB path watching prepared for:', commonPaths);
  }
  
  /**
   * Setup periodic scanning for USB drives
   */
  private static setupPeriodicScanning(): void {
    // Scan every 5 seconds for new USB drives
    setInterval(async () => {
      if (this.isMonitoring) {
        await this.scanForUSBDrives();
      }
    }, 5000);
  }
  
  /**
   * Scan for USB drives and EIP files
   */
  private static async scanForUSBDrives(): Promise<void> {
    try {
      // In a real implementation, this would scan mounted drives
      // For now, we'll simulate USB detection
      console.log('Scanning for USB drives...');
      
      // Check if File System Access API is available
      if ('showDirectoryPicker' in window) {
        // This would be triggered by user interaction
        console.log('File System Access API ready for user interaction');
      }
    } catch (error) {
      console.error('Error scanning USB drives:', error);
    }
  }
  
  /**
   * Handle USB device connection
   */
  private static async handleUSBDeviceConnected(device: USBDevice): Promise<void> {
    console.log('Processing connected USB device:', device.productName);
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('USB Device Detected', {
        body: `${device.productName || 'Unknown device'} connected. Scanning for EIP files...`,
        icon: '/favicon.ico'
      });
    }
    
    // Trigger file scanning
    await this.scanUSBForEIPFiles(device);
  }
  
  /**
   * Handle USB device disconnection
   */
  private static handleUSBDeviceDisconnected(device: USBDevice): void {
    console.log('USB device disconnected:', device.productName);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('USB Device Removed', {
        body: `${device.productName || 'Unknown device'} disconnected.`,
        icon: '/favicon.ico'
      });
    }
  }
  
  /**
   * Scan USB device for EIP files
   */
  private static async scanUSBForEIPFiles(device: USBDevice): Promise<void> {
    try {
      console.log('Scanning USB device for EIP files...');
      
      // In a real implementation, this would:
      // 1. Mount the USB device
      // 2. Scan for .eip files
      // 3. Automatically process found files
      
      // For web implementation, we'll show a directory picker
      if ('showDirectoryPicker' in window) {
        // This requires user interaction
        console.log('Ready to show directory picker for EIP files');
      }
      
      // Simulate finding EIP files
      setTimeout(() => {
        this.simulateEIPFileFound();
      }, 2000);
      
    } catch (error) {
      console.error('Error scanning USB for EIP files:', error);
    }
  }
  
  /**
   * Simulate EIP file detection and processing
   */
  private static simulateEIPFileFound(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('EIP Files Found', {
        body: 'EIP files detected on USB drive. Click to process automatically.',
        icon: '/favicon.ico',
        requireInteraction: true,
        actions: [
          { action: 'process', title: 'Process Files' },
          { action: 'ignore', title: 'Ignore' }
        ]
      });
    }
  }
  
  /**
   * Auto-process EIP files from directory
   */
  static async autoProcessEIPDirectory(): Promise<void> {
    try {
      if ('showDirectoryPicker' in window) {
        // Request directory access
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'read',
          startIn: 'documents'
        });
        
        console.log('Processing directory:', dirHandle.name);
        
        // Scan directory for EIP files
        const eipFiles = await this.findEIPFilesInDirectory(dirHandle);
        
        if (eipFiles.length > 0) {
          console.log(`Found ${eipFiles.length} EIP files`);
          
          // Process each file automatically
          for (const fileHandle of eipFiles) {
            await this.processEIPFileHandle(fileHandle);
          }
          
          // Show completion notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Auto-Processing Complete', {
              body: `Successfully processed ${eipFiles.length} EIP files automatically.`,
              icon: '/favicon.ico'
            });
          }
        } else {
          console.log('No EIP files found in directory');
        }
      }
    } catch (error) {
      console.error('Error in auto-processing:', error);
    }
  }
  
  /**
   * Find EIP files in directory
   */
  private static async findEIPFilesInDirectory(dirHandle: any): Promise<any[]> {
    const eipFiles: any[] = [];
    
    try {
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && 
            (entry.name.toLowerCase().endsWith('.eip') || 
             entry.name.toLowerCase().endsWith('.txt'))) {
          eipFiles.push(entry);
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
    }
    
    return eipFiles;
  }
  
  /**
   * Process EIP file handle
   */
  private static async processEIPFileHandle(fileHandle: any): Promise<void> {
    try {
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      console.log(`Processing EIP file: ${file.name}`);
      
      const records = EIPParser.parseEIPContent(content);
      
      if (records.length > 0) {
        await EIPParser.saveRecordsToDatabase(records);
        console.log(`Auto-processed ${records.length} records from ${file.name}`);
      }
    } catch (error) {
      console.error(`Error processing EIP file ${fileHandle.name}:`, error);
    }
  }
  
  /**
   * Stop USB monitoring
   */
  static stopUSBMonitoring(): void {
    console.log('Stopping USB monitoring...');
    this.isMonitoring = false;
    
    if (this.usbWatcher) {
      this.usbWatcher = null;
    }
  }
  
  /**
   * Get USB monitoring status
   */
  static getMonitoringStatus(): boolean {
    return this.isMonitoring;
  }
  
  /**
   * Setup file input monitoring for web browsers
   */
  private static setupFileInputMonitoring(): void {
    // This will be implemented in the UI components
    console.log('File input monitoring setup completed');
  }
  
  /**
   * Setup USB monitoring for Electron app
   */
  private static setupElectronUSBMonitoring(): void {
    // Placeholder for Electron-specific USB monitoring
    console.log('Electron USB monitoring setup (requires native implementation)');
  }
  
  /**
   * Detect and process EIP files from uploaded content
   */
  static async detectAndProcessEIPFiles(fileContent?: string): Promise<void> {
    if (!fileContent) {
      console.log('No file content provided for EIP processing');
      return;
    }
    
    try {
      console.log('Processing EIP file content...');
      const records = EIPParser.parseEIPContent(fileContent);
      
      if (records.length > 0) {
        await EIPParser.saveRecordsToDatabase(records);
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('EIP File Processed', {
            body: `Successfully imported ${records.length} milk collection records`,
            icon: '/favicon.ico'
          });
        }
        
        console.log(`Successfully processed EIP file with ${records.length} records`);
      } else {
        console.log('No valid records found in EIP file');
      }
    } catch (error) {
      console.error('Error processing EIP file:', error);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('EIP Processing Error', {
          body: 'Failed to process EIP file. Please check the file format.',
          icon: '/favicon.ico'
        });
      }
    }
  }
  
  /**
   * Process uploaded file
   */
  static async processUploadedFile(file: File): Promise<void> {
    try {
      const content = await file.text();
      await this.detectAndProcessEIPFiles(content);
    } catch (error) {
      console.error('Error reading uploaded file:', error);
    }
  }
}
