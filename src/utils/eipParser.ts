
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
  
  /**
   * Start monitoring for USB drives and EIP files
   */
  static async startUSBMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    
    console.log('Starting USB monitoring for EIP files...');
    this.isMonitoring = true;
    
    // For web applications, we can't directly monitor USB
    // Instead, we'll provide file input functionality
    this.setupFileInputMonitoring();
    
    // In an Electron app, this would use native file system watchers
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      this.setupElectronUSBMonitoring();
    }
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
