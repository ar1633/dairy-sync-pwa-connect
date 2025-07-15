
import PouchDB from 'pouchdb';

// Initialize PouchDB for local storage
const milkDataDB = new PouchDB('milk_data');
const centerDB = new PouchDB('center_data');

export interface MilkRecord {
  _id: string;
  date: string;
  month: string;
  year: string;
  centerCode: string;
  farmerCode: string;
  session: 'M' | 'E'; // Morning or Evening
  quantity: number;
  fat: number;
  snf: number;
  rate: number;
  amount: number;
  timestamp: Date;
}

export interface CenterInfo {
  _id: string;
  centerCode: string;
  centerName: string;
  isActive: boolean;
}

export class EIPParser {
  
  // Parse EIP file content
  static parseEIPData(fileContent: string): MilkRecord[] {
    const lines = fileContent.split('\n').filter(line => line.trim());
    const records: MilkRecord[] = [];
    
    let headerInfo: any = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip end markers
      if (trimmedLine.includes('ENDENDENDENDENDEND')) {
        break;
      }
      
      // Parse header line (date, month, year, center code)
      if (trimmedLine.length >= 23 && !headerInfo) {
        headerInfo = this.parseHeader(trimmedLine);
        continue;
      }
      
      // Parse data lines
      if (trimmedLine.length >= 45 && headerInfo) {
        const record = this.parseDataLine(trimmedLine, headerInfo);
        if (record) {
          records.push(record);
        }
      }
    }
    
    return records;
  }
  
  private static parseHeader(line: string) {
    // Format: 10072025094915000000000027
    // 10 - date, 07 - month, 2025 - year, 09:49:15 - time, rest - center info, 27 - center code
    const date = line.substring(0, 2);
    const month = line.substring(2, 4);
    const year = line.substring(4, 8);
    const centerCode = line.substring(line.length - 2);
    
    return {
      date,
      month,
      year,
      centerCode,
      fullDate: `${year}-${month}-${date}`
    };
  }
  
  private static parseDataLine(line: string, headerInfo: any): MilkRecord | null {
    try {
      // Format: 009M036079150035000106541720000
      // 009 - farmer code, M - session, 036 - quantity, 079 - fat, 150 - snf, etc.
      
      const farmerCode = line.substring(0, 3);
      const session = line.substring(3, 4) as 'M' | 'E';
      const quantity = parseFloat(line.substring(4, 7)) / 10; // Divide by 10 for decimal
      const fat = parseFloat(line.substring(7, 10)) / 10;
      const snf = parseFloat(line.substring(10, 13)) / 100; // Different scale for SNF
      const rate = parseFloat(line.substring(13, 18)) / 100;
      const amount = parseFloat(line.substring(18, 25)) / 100;
      
      const recordId = `${headerInfo.fullDate}_${headerInfo.centerCode}_${farmerCode}_${session}`;
      
      return {
        _id: recordId,
        date: headerInfo.date,
        month: headerInfo.month,
        year: headerInfo.year,
        centerCode: headerInfo.centerCode,
        farmerCode,
        session,
        quantity,
        fat,
        snf,
        rate,
        amount,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error parsing data line:', line, error);
      return null;
    }
  }
  
  // Store parsed records in PouchDB
  static async storeRecords(records: MilkRecord[]): Promise<void> {
    try {
      for (const record of records) {
        try {
          // Try to get existing record
          const existingRecord = await milkDataDB.get(record._id);
          // Update existing record
          await milkDataDB.put({
            ...record,
            _rev: existingRecord._rev
          });
          console.log(`Updated record: ${record._id}`);
        } catch (error) {
          // Record doesn't exist, create new one
          await milkDataDB.put(record);
          console.log(`Created record: ${record._id}`);
        }
      }
      console.log(`Successfully stored ${records.length} records`);
    } catch (error) {
      console.error('Error storing records:', error);
      throw error;
    }
  }
  
  // Get records by date range and center
  static async getRecords(startDate: string, endDate: string, centerCode?: string): Promise<MilkRecord[]> {
    try {
      const result = await milkDataDB.allDocs({
        include_docs: true,
        startkey: startDate,
        endkey: endDate + '\ufff0'
      });
      
      let records = result.rows.map(row => row.doc as MilkRecord);
      
      if (centerCode) {
        records = records.filter(record => record.centerCode === centerCode);
      }
      
      return records;
    } catch (error) {
      console.error('Error fetching records:', error);
      return [];
    }
  }
  
  // Get daily summary
  static async getDailySummary(date: string, centerCode: string): Promise<any> {
    const records = await this.getRecords(date, date, centerCode);
    
    const morningRecords = records.filter(r => r.session === 'M');
    const eveningRecords = records.filter(r => r.session === 'E');
    
    const calculateTotals = (recs: MilkRecord[]) => ({
      totalQuantity: recs.reduce((sum, r) => sum + r.quantity, 0),
      averageFat: recs.length ? recs.reduce((sum, r) => sum + r.fat, 0) / recs.length : 0,
      averageSnf: recs.length ? recs.reduce((sum, r) => sum + r.snf, 0) / recs.length : 0,
      totalAmount: recs.reduce((sum, r) => sum + r.amount, 0),
      farmerCount: recs.length
    });
    
    return {
      date,
      centerCode,
      morning: calculateTotals(morningRecords),
      evening: calculateTotals(eveningRecords),
      total: calculateTotals(records)
    };
  }
}

// USB detection and file processing
export class USBFileProcessor {
  private static fileWatcher: FileSystemWatcher | null = null;
  
  static async detectAndProcessEIPFiles(): Promise<void> {
    try {
      // Check if File System Access API is supported
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        await this.processDirectory(directoryHandle);
      } else {
        // Fallback to file input
        this.createFileInput();
      }
    } catch (error) {
      console.error('Error accessing files:', error);
      this.createFileInput();
    }
  }
  
  private static async processDirectory(directoryHandle: any): Promise<void> {
    for await (const [name, handle] of directoryHandle.entries()) {
      if (handle.kind === 'file' && name.toLowerCase().endsWith('.eip')) {
        const file = await handle.getFile();
        await this.processEIPFile(file);
      }
    }
  }
  
  private static createFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.eip,.txt';
    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          await this.processEIPFile(files[i]);
        }
      }
    };
    input.click();
  }
  
  private static async processEIPFile(file: File): Promise<void> {
    try {
      const content = await file.text();
      console.log(`Processing EIP file: ${file.name}`);
      
      const records = EIPParser.parseEIPData(content);
      console.log(`Parsed ${records.length} records`);
      
      await EIPParser.storeRecords(records);
      
      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('EIP File Processed', {
          body: `Successfully imported ${records.length} records from ${file.name}`,
          icon: '/icons/icon-96x96.png'
        });
      }
      
      console.log(`Successfully processed ${file.name}`);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }
  
  // Auto-detect USB drives (limited browser support)
  static async startUSBMonitoring(): Promise<void> {
    if ('usb' in navigator) {
      try {
        const devices = await (navigator as any).usb.getDevices();
        console.log('USB devices:', devices);
        
        (navigator as any).usb.addEventListener('connect', (event: any) => {
          console.log('USB device connected:', event.device);
          // Trigger file selection dialog
          this.detectAndProcessEIPFiles();
        });
      } catch (error) {
        console.error('USB monitoring not supported:', error);
      }
    }
  }
}
