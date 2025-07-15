
import PouchDB from 'pouchdb';
import { EIPParser, MilkRecord, USBFileProcessor } from '@/utils/eipParser';

// Initialize all databases
const databases = {
  milkData: new PouchDB('milk_data'),
  farmers: new PouchDB('farmers'),
  centers: new PouchDB('centers'),
  payments: new PouchDB('payments'),
  fodder: new PouchDB('fodder'),
  settings: new PouchDB('settings')
};

export class DataService {
  
  // Initialize the data service
  static async initialize(): Promise<void> {
    console.log('Initializing DataService...');
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    // Start USB monitoring
    await USBFileProcessor.startUSBMonitoring();
    
    // Setup periodic sync if online
    this.setupPeriodicSync();
    
    console.log('DataService initialized successfully');
  }
  
  // Milk Collection Data
  static async saveMilkCollection(data: Partial<MilkRecord>): Promise<string> {
    const record: MilkRecord = {
      _id: `${data.date}_${data.centerCode}_${data.farmerCode}_${data.session}`,
      date: data.date || '',
      month: data.month || '',
      year: data.year || '',
      centerCode: data.centerCode || '',
      farmerCode: data.farmerCode || '',
      session: data.session || 'M',
      quantity: data.quantity || 0,
      fat: data.fat || 0,
      snf: data.snf || 0,
      rate: data.rate || 0,
      amount: data.amount || 0,
      timestamp: new Date()
    };
    
    try {
      const result = await databases.milkData.put(record);
      console.log('Milk collection saved:', result.id);
      return result.id;
    } catch (error) {
      console.error('Error saving milk collection:', error);
      throw error;
    }
  }
  
  // Get milk data for dashboard
  static async getMilkSummary(date: string, centerCode?: string) {
    try {
      const startDate = date;
      const endDate = date;
      
      const result = await databases.milkData.allDocs({
        include_docs: true,
        startkey: startDate,
        endkey: endDate + '\ufff0'
      });
      
      let records = result.rows.map(row => row.doc as unknown as MilkRecord).filter(doc => doc);
      
      if (centerCode) {
        records = records.filter(record => record.centerCode === centerCode);
      }
      
      const morningRecords = records.filter(r => r.session === 'M');
      const eveningRecords = records.filter(r => r.session === 'E');
      
      return {
        date,
        centerCode,
        morning: {
          quantity: morningRecords.reduce((sum, r) => sum + r.quantity, 0),
          farmers: morningRecords.length,
          avgFat: morningRecords.length ? morningRecords.reduce((sum, r) => sum + r.fat, 0) / morningRecords.length : 0,
          amount: morningRecords.reduce((sum, r) => sum + r.amount, 0)
        },
        evening: {
          quantity: eveningRecords.reduce((sum, r) => sum + r.quantity, 0),
          farmers: eveningRecords.length,
          avgFat: eveningRecords.length ? eveningRecords.reduce((sum, r) => sum + r.fat, 0) / eveningRecords.length : 0,
          amount: eveningRecords.reduce((sum, r) => sum + r.amount, 0)
        },
        total: {
          quantity: records.reduce((sum, r) => sum + r.quantity, 0),
          farmers: records.length,
          amount: records.reduce((sum, r) => sum + r.amount, 0)
        }
      };
    } catch (error) {
      console.error('Error getting milk summary:', error);
      return null;
    }
  }
  
  // Farmer Management
  static async saveFarmer(farmer: any): Promise<string> {
    try {
      const farmerId = farmer._id || `farmer_${Date.now()}`;
      const farmerData = {
        _id: farmerId,
        ...farmer,
        updatedAt: new Date()
      };
      
      const result = await databases.farmers.put(farmerData);
      return result.id;
    } catch (error) {
      console.error('Error saving farmer:', error);
      throw error;
    }
  }
  
  static async getFarmers(centerCode?: string): Promise<any[]> {
    try {
      const result = await databases.farmers.allDocs({ include_docs: true });
      let farmers = result.rows.map(row => row.doc).filter(doc => doc);
      
      if (centerCode) {
        farmers = farmers.filter(farmer => farmer && (farmer as any).centerCode === centerCode);
      }
      
      return farmers;
    } catch (error) {
      console.error('Error getting farmers:', error);
      return [];
    }
  }
  
  // Center Management
  static async saveCenter(center: any): Promise<string> {
    try {
      const centerId = center._id || `center_${center.code}`;
      const centerData = {
        _id: centerId,
        ...center,
        updatedAt: new Date()
      };
      
      const result = await databases.centers.put(centerData);
      return result.id;
    } catch (error) {
      console.error('Error saving center:', error);
      throw error;
    }
  }
  
  static async getCenters(): Promise<any[]> {
    try {
      const result = await databases.centers.allDocs({ include_docs: true });
      return result.rows.map(row => row.doc).filter(doc => doc);
    } catch (error) {
      console.error('Error getting centers:', error);
      return [];
    }
  }
  
  // Payment Management
  static async savePayment(payment: any): Promise<string> {
    try {
      const paymentId = payment._id || `payment_${Date.now()}`;
      const paymentData = {
        _id: paymentId,
        ...payment,
        timestamp: new Date()
      };
      
      const result = await databases.payments.put(paymentData);
      return result.id;
    } catch (error) {
      console.error('Error saving payment:', error);
      throw error;
    }
  }
  
  // Export data for backup
  static async exportData(): Promise<any> {
    try {
      const data: any = {};
      
      for (const [name, db] of Object.entries(databases)) {
        const result = await db.allDocs({ include_docs: true });
        data[name] = result.rows.map(row => row.doc).filter(doc => doc);
      }
      
      return {
        timestamp: new Date(),
        data,
        version: '1.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
  
  // Import data from backup
  static async importData(backupData: any): Promise<void> {
    try {
      for (const [dbName, records] of Object.entries(backupData.data)) {
        if (databases[dbName as keyof typeof databases]) {
          const db = databases[dbName as keyof typeof databases];
          
          for (const record of records as any[]) {
            try {
              await db.put(record);
            } catch (error) {
              console.error(`Error importing record to ${dbName}:`, error);
            }
          }
        }
      }
      
      console.log('Data import completed');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
  
  // Setup periodic sync (for future cloud sync)
  private static setupPeriodicSync(): void {
    // This would be implemented when cloud sync is added
    console.log('Periodic sync setup (placeholder for future cloud integration)');
  }
  
  // Process EIP files from USB
  static async processEIPFiles(): Promise<void> {
    await USBFileProcessor.detectAndProcessEIPFiles();
  }
  
  // Get database statistics
  static async getDatabaseStats(): Promise<any> {
    const stats: any = {};
    
    for (const [name, db] of Object.entries(databases)) {
      try {
        const info = await db.info();
        stats[name] = {
          doc_count: info.doc_count,
          update_seq: info.update_seq,
          disk_size: (info as any).disk_size || 0
        };
      } catch (error) {
        stats[name] = { error: (error as Error).message };
      }
    }
    
    return stats;
  }
}
