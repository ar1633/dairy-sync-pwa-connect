console.log('[LOG] Loaded src/utils/eipParser.ts');

import * as PouchDB from 'pouchdb-browser';

export interface MilkRecord {
  _id: string;
  date: string;
  month: string;
  year: string;
  centerCode: string;
  farmerCode: string;
  session: string;
  quantity: number;
  fat: number;
  snf: number;
  rate: number;
  amount: number;
  timestamp: Date;
  employeeId: string;
}

export class USBFileProcessor {
  private static isMonitoring = false;
  private static usbDevices: USBDevice[] = [];
  
  // Start USB monitoring with proper error handling
  static async startUSBMonitoring(): Promise<void> {
    console.log('[USBFileProcessor] Inside startUSBMonitoring');
    if (!('usb' in navigator)) {
      console.warn('WebUSB not supported in this browser');
      return;
    }

    try {
      this.isMonitoring = true;
      
      // Get already connected devices
      const devices = await (navigator.usb as USB).getDevices();
      this.usbDevices = devices;
      
      // Listen for new connections
      (navigator.usb as USB).addEventListener('connect', this.handleUSBConnect.bind(this));
      (navigator.usb as USB).addEventListener('disconnect', this.handleUSBDisconnect.bind(this));
      
      console.log('USB monitoring started');
      
      // Show notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('USB Monitoring Active', {
          body: 'EIP files will be automatically processed when USB drives are connected',
          icon: '/favicon.ico'
        });
      }
      
    } catch (error) {
      console.error('Error starting USB monitoring:', error);
      this.isMonitoring = false;
    }
  }
  
  // Stop USB monitoring
  static stopUSBMonitoring(): void {
    console.log('[USBFileProcessor] Inside stopUSBMonitoring');
    if (!('usb' in navigator)) return;
    
    this.isMonitoring = false;
    
    try {
      (navigator.usb as USB).removeEventListener('connect', this.handleUSBConnect.bind(this));
      (navigator.usb as USB).removeEventListener('disconnect', this.handleUSBDisconnect.bind(this));
      console.log('USB monitoring stopped');
    } catch (error) {
      console.error('Error stopping USB monitoring:', error);
    }
  }
  
  // Handle USB device connection
  private static async handleUSBConnect(event: USBConnectionEvent): Promise<void> {
    console.log('[USBFileProcessor] Inside handleUSBConnect', event);
    console.log('USB device connected:', event.device);
    this.usbDevices.push(event.device);
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('USB Device Connected', {
        body: `${event.device.productName || 'Unknown device'} connected`,
        icon: '/favicon.ico'
      });
    }
    
    // Auto-scan for EIP files
    if (this.isMonitoring) {
      await this.scanDeviceForEIPFiles(event.device);
    }
  }
  
  // Handle USB device disconnection
  private static handleUSBDisconnect(event: USBConnectionEvent): void {
    console.log('[USBFileProcessor] Inside handleUSBDisconnect', event);
    console.log('USB device disconnected:', event.device);
    this.usbDevices = this.usbDevices.filter(device => device !== event.device);
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('USB Device Disconnected', {
        body: `${event.device.productName || 'Unknown device'} disconnected`,
        icon: '/favicon.ico'
      });
    }
  }
  
  // Scan USB device for EIP files
  private static async scanDeviceForEIPFiles(device: USBDevice): Promise<void> {
    console.log('[USBFileProcessor] Inside scanDeviceForEIPFiles', device);
    try {
      // Note: Direct file access from USB devices via WebUSB is limited
      // This is a placeholder for the scanning logic
      console.log('Scanning device for EIP files:', device.productName);
      
      // In a real implementation, you would need to:
      // 1. Check if the device is a mass storage device
      // 2. Access the file system (requires additional permissions)
      // 3. Scan for .eip files
      
      // For now, we'll show a notification that manual selection is needed
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('USB Drive Detected', {
          body: 'Click to select EIP files from the connected USB drive',
          icon: '/favicon.ico',
          tag: 'usb-eip-scan'
        });
      }
      
    } catch (error) {
      console.error('Error scanning USB device:', error);
    }
  }
  
  // Get monitoring status
  static getMonitoringStatus(): boolean {
    console.log('[USBFileProcessor] Inside getMonitoringStatus');
    return this.isMonitoring;
  }
  
  // Get connected USB devices
  static getConnectedDevices(): USBDevice[] {
    console.log('[USBFileProcessor] Inside getConnectedDevices');
    return [...this.usbDevices];
  }
  
  // Auto-process EIP directory using File System Access API
  static async autoProcessEIPDirectory(): Promise<void> {
    console.log('[USBFileProcessor] Inside autoProcessEIPDirectory');
    if (!('showDirectoryPicker' in window)) {
      throw new Error('File System Access API not supported');
    }
    
    try {
      // Request directory access
      console.log('[USBFileProcessor] Requesting directory access');
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'read'
      });
      
      console.log('Processing directory:', directoryHandle.name);
      
      // Scan for EIP files
      const eipFiles: File[] = [];
      
      for await (const [name, handle] of directoryHandle.entries()) {
        console.log('[USBFileProcessor] Checking file:', name);
        if (handle.kind === 'file' && name.toLowerCase().endsWith('.eip')) {
          const file = await handle.getFile();
          eipFiles.push(file);
        }
      }
      console.log('[USBFileProcessor] Found EIP files:', eipFiles.map(f => f.name));
      
      // Process each EIP file
      for (const file of eipFiles) {
        console.log('[USBFileProcessor] Processing file:', file.name);
        await this.processUploadedFile(file);
      }
      
      // Show completion notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('EIP Processing Complete', {
          body: `Processed ${eipFiles.length} EIP files automatically`,
          icon: '/favicon.ico'
        });
      }
      
    } catch (error) {
      console.error('[USBFileProcessor] Error auto-processing EIP directory:', error);
      throw error;
    }
  }
  
  // Detect and process EIP files (fallback method)
  static async detectAndProcessEIPFiles(): Promise<void> {
    console.log('[USBFileProcessor] Inside detectAndProcessEIPFiles');
    try {
      // Use File System Access API if available
      if ('showDirectoryPicker' in window) {
        await this.autoProcessEIPDirectory();
      } else {
        // Fallback: Show file picker for multiple files
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.eip,.txt';
        
        return new Promise((resolve, reject) => {
          input.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files) {
              try {
                for (let i = 0; i < files.length; i++) {
                  await this.processUploadedFile(files[i]);
                }
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          };
          
          input.click();
        });
      }
    } catch (error) {
      console.error('Error detecting EIP files:', error);
      throw error;
    }
  }
  
  // Process uploaded EIP file
  static async processUploadedFile(file: File): Promise<void> {
    console.log('[USBFileProcessor] Inside processUploadedFile', file.name);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        console.log('[USBFileProcessor] File read complete:', file.name);
        const fileContent = event.target?.result as string;
        
        try {
          const records = EIPParser.parse(fileContent);
          console.log('[USBFileProcessor] Parsed records:', records.length);
          
          // Save each record to PouchDB
          const milkDataDb = new PouchDB('milk_data', { adapter: 'idb' });
          
          for (const record of records) {
            try {
              console.log('[USBFileProcessor] Saving record to PouchDB:', record._id);
              await milkDataDb.put(record);
              console.log('[USBFileProcessor] Record saved:', record._id);
            } catch (dbError) {
              console.error('[USBFileProcessor] Error saving record to PouchDB:', dbError);
            }
          }
          
          console.log(`Processed file ${file.name} and saved ${records.length} records`);
          resolve();
          
        } catch (parseError) {
          console.error('[USBFileProcessor] Error parsing EIP file:', parseError);
          reject(parseError);
        }
      };
      
      reader.onerror = (error) => {
        console.error('[USBFileProcessor] Error reading EIP file:', error);
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }
}

export class EIPParser {
  static parse(fileContent: string): MilkRecord[] {
    console.log('[EIPParser] Inside parse');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    const headerLine = lines.shift();
    
    if (!headerLine) {
      throw new Error('Invalid EIP file: Missing header');
    }
    
    const header = this.parseHeader(headerLine);
    const records: MilkRecord[] = [];
    
    for (const line of lines) {
      if (line.startsWith('END')) continue;
      try {
        const record = this.parseRecord(line, header);
        records.push(record);
      } catch (error) {
        console.error('Error parsing record:', error);
      }
    }
    
    return records;
  }
  
  private static parseHeader(headerLine: string): any {
    console.log('[EIPParser] Inside parseHeader');
    const date = headerLine.substring(0, 2);
    const month = headerLine.substring(2, 4);
    const year = headerLine.substring(4, 8);
    const hour = headerLine.substring(8, 10);
    const minute = headerLine.substring(10, 12);
    const second = headerLine.substring(12, 14);
    const centerCode = headerLine.substring(14, 17);
    
    return {
      date,
      month,
      year,
      hour,
      minute,
      second,
      centerCode
    };
  }
  
  private static parseRecord(line: string, header: any): MilkRecord {
    console.log('[EIPParser] Inside parseRecord');
    const farmerCode = line.substring(0, 3);
    const session = line.substring(3, 4);
    const quantity = parseInt(line.substring(4, 8), 10) / 100;
    const fat = parseInt(line.substring(8, 11), 10) / 100;
    const snf = parseInt(line.substring(11, 14), 10) / 100;
    const rate = parseInt(line.substring(14, 17), 10) / 100;
    const amount = parseInt(line.substring(17, 22), 10) / 100;
    
    const recordId = `${header.year}-${header.month}-${header.date}_${header.centerCode}_${farmerCode}_${session}`;
    
    return {
      _id: recordId,
      date: `${header.year}-${header.month}-${header.date}`,
      month: header.month,
      year: header.year,
      centerCode: header.centerCode,
      farmerCode: farmerCode,
      session: session,
      quantity: quantity,
      fat: fat,
      snf: snf,
      rate: rate,
      amount: amount,
      timestamp: new Date(`${header.year}-${header.month}-${header.date}T${header.hour}:${header.minute}:${header.second}`),
      employeeId: 'employee_unknown'
    };
  }
}
