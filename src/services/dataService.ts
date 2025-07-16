import PouchDB from 'pouchdb';
import { EIPParser, MilkRecord, USBFileProcessor } from '@/utils/eipParser';
import { User } from './authService';

// Configure PouchDB for better performance and LAN sync
PouchDB.plugin(require('pouchdb-adapter-idb'));
PouchDB.plugin(require('pouchdb-find'));

// LAN sync configuration
const LAN_SYNC_CONFIG = {
  serverUrl: window.location.protocol + '//' + window.location.hostname + ':5984', // CouchDB server
  syncInterval: 30000, // 30 seconds
  retryDelay: 5000 // 5 seconds
};

// Initialize all databases with sync configuration
const createDatabase = (name: string) => {
  const localDb = new PouchDB(name, { adapter: 'idb' });
  
  // Setup automatic sync with CouchDB server if available
  const remoteDb = new PouchDB(`${LAN_SYNC_CONFIG.serverUrl}/${name}`);
  
  // Bidirectional sync for real-time updates across devices
  const sync = localDb.sync(remoteDb, {
    live: true,
    retry: true,
    heartbeat: 10000,
    timeout: 60000
  }).on('change', (info) => {
    console.log(`Sync change for ${name}:`, info);
    // Broadcast change to other components
    window.dispatchEvent(new CustomEvent('dataSync', { 
      detail: { database: name, change: info } 
    }));
  }).on('paused', () => {
    console.log(`Sync paused for ${name}`);
  }).on('active', () => {
    console.log(`Sync resumed for ${name}`);
  }).on('error', (err) => {
    console.error(`Sync error for ${name}:`, err);
  });

  return { local: localDb, remote: remoteDb, sync };
};

const databases = {
  milkData: createDatabase('milk_data'),
  farmers: createDatabase('farmers'),
  centers: createDatabase('centers'),
  payments: createDatabase('payments'),
  fodder: createDatabase('fodder'),
  settings: createDatabase('settings'),
  users: createDatabase('users')
};

export class DataService {
  protected static syncStatus: { [key: string]: boolean } = {};
  protected static databases = databases;
  protected static LAN_SYNC_CONFIG = LAN_SYNC_CONFIG;
  
  // Initialize the data service with LAN sync
  static async initialize(): Promise<void> {
    console.log('Initializing DataService with enhanced LAN sync...');
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    // Start USB monitoring
    await USBFileProcessor.startUSBMonitoring();
    
    // Setup LAN sync monitoring
    this.setupLANSync();
    
    // Setup conflict resolution
    this.setupConflictResolution();
    
    // Setup database indexes
    await this.setupDatabaseIndexes();
    
    console.log('DataService initialized successfully with enhanced LAN sync');
  }

  // Setup database indexes for better performance
  private static async setupDatabaseIndexes(): Promise<void> {
    try {
      // Create indexes for milk data
      await databases.milkData.local.createIndex({
        index: { fields: ['date', 'centerCode', 'farmerCode'] }
      });
      
      await databases.milkData.local.createIndex({
        index: { fields: ['employeeId', 'timestamp'] }
      });

      // Create indexes for farmers
      await databases.farmers.local.createIndex({
        index: { fields: ['centerCode'] }
      });

      // Create indexes for users
      await databases.users.local.createIndex({
        index: { fields: ['username'] }
      });
      
      await databases.users.local.createIndex({
        index: { fields: ['email'] }
      });
      
      await databases.users.local.createIndex({
        index: { fields: ['role'] }
      });

      console.log('Database indexes created successfully');
    } catch (error) {
      console.error('Error creating database indexes:', error);
    }
  }
  
  // Setup LAN synchronization
  private static setupLANSync(): void {
    // Monitor sync status for all databases
    Object.keys(databases).forEach(dbName => {
      const db = databases[dbName as keyof typeof databases];
      this.syncStatus[dbName] = false;
      
      // Check if remote server is available
      this.checkServerAvailability(dbName);
    });
    
    // Setup periodic sync status check
    setInterval(() => {
      this.checkAllSyncStatus();
    }, LAN_SYNC_CONFIG.syncInterval);
  }
  
  // Check if CouchDB server is available
  private static async checkServerAvailability(dbName: string): Promise<void> {
    try {
      const db = databases[dbName as keyof typeof databases];
      await db.remote.info();
      this.syncStatus[dbName] = true;
      console.log(`LAN sync available for ${dbName}`);
    } catch (error) {
      this.syncStatus[dbName] = false;
      console.log(`LAN sync not available for ${dbName}, working offline`);
    }
  }
  
  // Check sync status for all databases
  private static async checkAllSyncStatus(): Promise<void> {
    for (const dbName of Object.keys(databases)) {
      await this.checkServerAvailability(dbName);
    }
  }
  
  // Setup conflict resolution for multi-user environment
  private static setupConflictResolution(): void {
    Object.entries(databases).forEach(([name, db]) => {
      db.local.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', (change) => {
        if (change.doc && change.doc._conflicts) {
          console.log(`Conflict detected in ${name}:`, change.doc._id);
          this.resolveConflict(name, change.doc);
        }
      });
    });
  }
  
  // Resolve conflicts automatically (latest timestamp wins)
  private static async resolveConflict(dbName: string, doc: any): Promise<void> {
    try {
      const db = databases[dbName as keyof typeof databases].local;
      const conflicts = doc._conflicts || [];
      
      // Get all conflicting versions
      const versions = await Promise.all(
        conflicts.map((rev: string) => db.get(doc._id, { rev }))
      );
      
      // Add current version
      versions.push(doc);
      
      // Find version with latest timestamp
      const latest = versions.reduce((prev, current) => {
        const prevTime = new Date(prev.timestamp || prev.updatedAt || 0);
        const currentTime = new Date(current.timestamp || current.updatedAt || 0);
        return currentTime > prevTime ? current : prev;
      });
      
      // Remove conflicts and keep latest
      const resolved = { ...latest };
      delete resolved._conflicts;
      
      await db.put(resolved);
      console.log(`Conflict resolved for ${doc._id} in ${dbName}`);
      
    } catch (error) {
      console.error(`Error resolving conflict in ${dbName}:`, error);
    }
  }
  
  // Milk Collection Data with real-time sync
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
      timestamp: new Date(),
      employeeId: this.getCurrentEmployeeId()
    };
    
    try {
      const result = await databases.milkData.local.put(record);
      console.log('Milk collection saved and syncing:', result.id);
      
      // Notify other devices of the change
      this.broadcastChange('milkData', 'created', record);
      
      return result.id;
    } catch (error) {
      console.error('Error saving milk collection:', error);
      throw error;
    }
  }
  
  // Get current employee ID (implement your authentication logic)
  private static getCurrentEmployeeId(): string {
    // This should return the current logged-in employee ID
    return localStorage.getItem('currentEmployeeId') || 'employee_unknown';
  }
  
  // Get milk data for dashboard with real-time updates
  static async getMilkSummary(date: string, centerCode?: string) {
    try {
      const startDate = date;
      const endDate = date;
      
      const result = await databases.milkData.local.allDocs({
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
        },
        syncStatus: this.syncStatus.milkData
      };
    } catch (error) {
      console.error('Error getting milk summary:', error);
      return null;
    }
  }
  
  // Farmer Management with sync
  static async saveFarmer(farmer: any): Promise<string> {
    try {
      const farmerId = farmer._id || `farmer_${Date.now()}`;
      const farmerData = {
        _id: farmerId,
        ...farmer,
        updatedAt: new Date(),
        employeeId: this.getCurrentEmployeeId()
      };
      
      const result = await databases.farmers.local.put(farmerData);
      this.broadcastChange('farmers', 'created', farmerData);
      return result.id;
    } catch (error) {
      console.error('Error saving farmer:', error);
      throw error;
    }
  }
  
  static async getFarmers(centerCode?: string): Promise<any[]> {
    try {
      const result = await databases.farmers.local.allDocs({ include_docs: true });
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

  // User Management Methods
  static async saveUser(user: User): Promise<string> {
    try {
      const result = await databases.users.local.put(user);
      console.log('User saved and syncing:', result.id);
      
      // Broadcast change to other components
      this.broadcastChange('users', 'upsert', user);
      
      return result.id;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await databases.users.local.get(userId);
      return result as User;
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await databases.users.local.find({
        selector: { username: username },
        limit: 1
      });
      
      return result.docs.length > 0 ? result.docs[0] as User : null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await databases.users.local.find({
        selector: { email: email },
        limit: 1
      });
      
      return result.docs.length > 0 ? result.docs[0] as User : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const result = await databases.users.local.allDocs({ include_docs: true });
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('user_')) as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
  
  // Get sync status for all databases
  static getSyncStatus(): { [key: string]: boolean } {
    return { ...this.syncStatus };
  }
  
  // Force sync all databases
  static async forceSyncAll(): Promise<void> {
    console.log('Forcing sync for all databases...');
    
    for (const [name, db] of Object.entries(databases)) {
      try {
        await db.sync.cancel();
        // Restart sync
        const newSync = db.local.sync(db.remote, {
          live: true,
          retry: true
        });
        (db as any).sync = newSync;
        
        console.log(`Forced sync completed for ${name}`);
      } catch (error) {
        console.error(`Error forcing sync for ${name}:`, error);
      }
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
      
      const result = await databases.centers.local.put(centerData);
      return result.id;
    } catch (error) {
      console.error('Error saving center:', error);
      throw error;
    }
  }
  
  static async getCenters(): Promise<any[]> {
    try {
      const result = await databases.centers.local.allDocs({ include_docs: true });
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
      
      const result = await databases.payments.local.put(paymentData);
      return result.id;
    } catch (error) {
      console.error('Error saving payment:', error);
      throw error;
    }
  }
  
  // Enhanced export with user data
  static async exportData(): Promise<any> {
    try {
      const data: any = {};
      
      for (const [name, db] of Object.entries(databases)) {
        const result = await db.local.allDocs({ include_docs: true });
        let docs = result.rows.map(row => row.doc).filter(doc => doc);
        
        // Remove passwords from user data for security
        if (name === 'users') {
          docs = docs.map((user: any) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          });
        }
        
        data[name] = docs;
      }
      
      return {
        timestamp: new Date(),
        data,
        version: '2.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
  
  // Enhanced import with user data
  static async importData(backupData: any): Promise<void> {
    try {
      for (const [dbName, records] of Object.entries(backupData.data)) {
        if (databases[dbName as keyof typeof databases]) {
          const db = databases[dbName as keyof typeof databases].local;
          
          for (const record of records as any[]) {
            try {
              // For users, generate new IDs to avoid conflicts
              if (dbName === 'users') {
                const newRecord = {
                  ...record,
                  _id: `user_imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  importedAt: new Date()
                };
                await db.put(newRecord);
              } else {
                await db.put(record);
              }
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

  // Get user activity logs
  static async getUserActivityLogs(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const result = await databases.milkData.local.find({
        selector: { employeeId: userId },
        sort: [{ timestamp: 'desc' }],
        limit: limit
      });
      
      return result.docs;
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      return [];
    }
  }
  
  // Enhanced system statistics
  static async getDatabaseStats(): Promise<any> {
    const stats: any = {};
    
    for (const [name, db] of Object.entries(databases)) {
      try {
        const info = await db.local.info();
        stats[name] = {
          doc_count: info.doc_count,
          update_seq: info.update_seq,
          disk_size: (info as any).disk_size || 0
        };
      } catch (error) {
        stats[name] = { error: (error as Error).message };
      }
    }

    // Add user statistics
    try {
      const users = await this.getAllUsers();
      stats.users.active = users.filter(u => u.isActive).length;
      stats.users.admins = users.filter(u => u.role === 'admin').length;
      stats.users.employees = users.filter(u => u.role === 'employee').length;
    } catch (error) {
      console.error('Error getting user stats:', error);
    }
    
    return stats;
  }
  
  // Process EIP files from USB
  static async processEIPFiles(): Promise<void> {
    await USBFileProcessor.detectAndProcessEIPFiles();
  }

  // Broadcast method to include user changes
  protected static broadcastChange(database: string, action: string, data: any): void {
    window.dispatchEvent(new CustomEvent('dataChange', {
      detail: { database, action, data, timestamp: new Date() }
    }));
    
    // Additional broadcasting for user-related changes
    if (database === 'users') {
      window.dispatchEvent(new CustomEvent('userChange', {
        detail: { action, data, timestamp: new Date() }
      }));
    }
  }
}
