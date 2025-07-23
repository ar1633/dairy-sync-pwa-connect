import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { EIPParser, MilkRecord, USBFileProcessor } from '@/utils/eipParser';
import { User } from './authService';

// Configure PouchDB with proper plugin imports
PouchDB.plugin(PouchDBFind);

// LAN sync configuration
const LAN_SYNC_CONFIG = {
  serverUrl: window.location.protocol + '//' + window.location.hostname + ':5984',
  syncInterval: 30000, // 30 seconds
  retryDelay: 5000, // 5 seconds
  maxRetries: 3,
  syncTimeout: 60000
};

// Database interface
interface DatabaseSet {
  local: PouchDB.Database;
  remote: PouchDB.Database | null;
  sync: PouchDB.Replication.Sync<any> | null;
  isOnline: boolean;
}

// Initialize database with proper sync configuration
const createDatabase = (name: string): DatabaseSet => {
  const localDb = new PouchDB(name);
  let remoteDb: PouchDB.Database | null = null;
  let sync: PouchDB.Replication.Sync<any> | null = null;
  let isOnline = false;

  try {
    // Create remote database with proper authentication
    const remoteUrl = `${LAN_SYNC_CONFIG.serverUrl}/${name}`;
    remoteDb = new PouchDB(remoteUrl, {
      fetch: (url, opts) => {
        const credentials = btoa('admin:password'); // Use your actual credentials
        const headers = {
          ...opts?.headers,
          'Authorization': `Basic ${credentials}`
        };
        return fetch(url, { ...opts, headers });
      }
    });

    // Test connection before setting up sync
    remoteDb.info().then(() => {
      isOnline = true;
      console.log(`Remote database ${name} is available`);
      
      // Setup sync only if remote is available
      if (remoteDb) {
        sync = localDb.sync(remoteDb, {
          live: true,
          retry: true,
          heartbeat: 10000,
          timeout: LAN_SYNC_CONFIG.syncTimeout
        });

        // Handle sync events
        sync.on('change', (info) => {
          console.log(`Sync change for ${name}:`, info);
          window.dispatchEvent(new CustomEvent('dataSync', { 
            detail: { database: name, change: info } 
          }));
        }).on('paused', () => {
          console.log(`Sync paused for ${name}`);
        }).on('active', () => {
          console.log(`Sync resumed for ${name}`);
        }).on('error', (err) => {
          console.error(`Sync error for ${name}:`, err);
          isOnline = false;
          
          // Retry connection after delay
          setTimeout(() => {
            DataService.retryConnection(name);
          }, LAN_SYNC_CONFIG.retryDelay);
        });
      }
    }).catch((err) => {
      console.log(`Remote database ${name} not available, working offline:`, err);
      isOnline = false;
    });

  } catch (error) {
    console.error(`Error creating remote database ${name}:`, error);
    isOnline = false;
  }

  return { local: localDb, remote: remoteDb, sync, isOnline };
};

const databases: { [key: string]: DatabaseSet } = {
  milkData: createDatabase('milk_data'),
  farmers: createDatabase('farmers'),
  centers: createDatabase('centers'),
  payments: createDatabase('payments'),
  fodder: createDatabase('fodder'),
  settings: createDatabase('settings'),
  users: createDatabase('users')
};

export class DataService {
  private static syncStatus: { [key: string]: boolean } = {};
  private static databases = databases;
  private static syncCheckInterval: NodeJS.Timeout | null = null;
  private static isInitialized = false;
  
  // Initialize the data service with LAN sync
  static async initialize(): Promise<void> {
    console.log('[DataService] Inside initialize');
    if (this.isInitialized) {
      console.log('DataService already initialized');
      return;
    }

    console.log('Initializing DataService with enhanced LAN sync...');
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    // Start USB monitoring
    try {
      await USBFileProcessor.startUSBMonitoring();
    } catch (error) {
      console.error('Error starting USB monitoring:', error);
    }
    
    // Setup database indexes
    await this.setupDatabaseIndexes();
    
    // Setup LAN sync monitoring with debouncing
    this.setupLANSync();
    
    // Setup conflict resolution
    this.setupConflictResolution();
    
    this.isInitialized = true;
    console.log('DataService initialized successfully');
    console.log('[DataService] initialize result', this.isInitialized);
  }

  // Setup database indexes for better performance
  private static async setupDatabaseIndexes(): Promise<void> {
    console.log('[DataService] Inside setupDatabaseIndexes');
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
    console.log('[DataService] setupDatabaseIndexes result', 'Database indexes created');
  }
  
  // Setup LAN synchronization with proper debouncing
  private static setupLANSync(): void {
    console.log('[DataService] Inside setupLANSync');
    // Initialize sync status
    Object.keys(databases).forEach(dbName => {
      this.syncStatus[dbName] = databases[dbName].isOnline;
    });
    
    // Clear existing interval if any
    if (this.syncCheckInterval) {
      clearInterval(this.syncCheckInterval);
    }
    
    // Setup periodic sync status check with debouncing
    this.syncCheckInterval = setInterval(() => {
      this.checkAllSyncStatus();
    }, LAN_SYNC_CONFIG.syncInterval);
    console.log('[DataService] setupLANSync result', this.syncStatus);
  }
  
  // Check if CouchDB server is available for a specific database
  private static async checkServerAvailability(dbName: string): Promise<boolean> {
    console.log(`[DataService] Checking server availability for ${dbName}`);
    try {
      const db = databases[dbName];
      if (!db.remote) {
        this.syncStatus[dbName] = false;
        return false;
      }

      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });

      await Promise.race([db.remote.info(), timeoutPromise]);
      
      if (!this.syncStatus[dbName]) {
        this.syncStatus[dbName] = true;
        console.log(`LAN sync available for ${dbName}`);
        
        // Restart sync if it was offline
        this.restartSync(dbName);
      }
      
      return true;
    } catch (error) {
      if (this.syncStatus[dbName]) {
        this.syncStatus[dbName] = false;
        console.log(`LAN sync not available for ${dbName}, working offline`);
      }
      return false;
    }
    console.log('[DataService] checkServerAvailability result', this.syncStatus[dbName]);
  }
  
  // Restart sync for a specific database
  private static restartSync(dbName: string): void {
    console.log(`[DataService] Restarting sync for ${dbName}`);
    const db = databases[dbName];
    if (!db.remote || !db.local) return;

    // Cancel existing sync
    if (db.sync) {
      db.sync.cancel();
    }

    // Restart sync
    db.sync = db.local.sync(db.remote, {
      live: true,
      retry: true,
      heartbeat: 10000,
      timeout: LAN_SYNC_CONFIG.syncTimeout
    });

    // Re-setup event handlers
    db.sync.on('change', (info) => {
      console.log(`Sync change for ${dbName}:`, info);
      window.dispatchEvent(new CustomEvent('dataSync', { 
        detail: { database: dbName, change: info } 
      }));
    }).on('error', (err) => {
      console.error(`Sync error for ${dbName}:`, err);
      this.syncStatus[dbName] = false;
    });
    console.log('[DataService] restartSync result', dbName);
  }
  
  // Check sync status for all databases with throttling
  private static async checkAllSyncStatus(): Promise<void> {
    console.log('[DataService] Checking sync status for all databases');
    const promises = Object.keys(databases).map(dbName => 
      this.checkServerAvailability(dbName).catch(err => {
        console.error(`Error checking ${dbName}:`, err);
        return false;
      })
    );
    
    await Promise.all(promises);
    console.log('[DataService] checkAllSyncStatus result', this.syncStatus);
  }
  
  // Retry connection for a specific database
  static async retryConnection(dbName: string): Promise<void> {
    console.log(`[DataService] Retrying connection for ${dbName}`);
    await this.checkServerAvailability(dbName);
    console.log('[DataService] retryConnection result', dbName);
  }
  
  // Setup conflict resolution for multi-user environment
  private static setupConflictResolution(): void {
    console.log('[DataService] Setting up conflict resolution');
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
      }).on('error', (err) => {
        console.error(`Error in changes feed for ${name}:`, err);
      });
    });
    console.log('[DataService] setupConflictResolution result');
  }
  
  // Resolve conflicts automatically (latest timestamp wins)
  private static async resolveConflict(dbName: string, doc: any): Promise<void> {
    console.log(`[DataService] Resolving conflict for ${dbName} doc ${doc._id}`);
    try {
      const db = databases[dbName].local;
      const conflicts = doc._conflicts || [];
      
      // Get all conflicting versions
      const versions = await Promise.all(
        conflicts.map((rev: string) => 
          db.get(doc._id, { rev }).catch(() => null)
        )
      );
      
      // Add current version and filter out null values
      const validVersions = [doc, ...versions].filter(Boolean);
      
      // Find version with latest timestamp
      const latest = validVersions.reduce((prev, current) => {
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
    console.log('[DataService] resolveConflict result', dbName, doc._id);
  }
  
  // Milk Collection Data with real-time sync
  static async saveMilkCollection(data: Partial<MilkRecord>): Promise<string> {
    console.log('[DataService] Saving milk collection:', data);
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
      // Check if record already exists
      try {
        const existingRecord = await databases.milkData.local.get(record._id);
        record._rev = existingRecord._rev;
      } catch (error) {
        // Record doesn't exist, which is fine
      }

      const result = await databases.milkData.local.put(record);
      console.log('Milk collection saved:', result.id);
      
      // Notify other components
      this.broadcastChange('milkData', 'created', record);
      
      console.log('[DataService] saveMilkCollection result', result.id);
      return result.id;
    } catch (error) {
      console.error('Error saving milk collection:', error);
      throw error;
    }
  }
  
  // Get current employee ID
  private static getCurrentEmployeeId(): string {
    console.log('[DataService] Getting current employee ID');
    const id = localStorage.getItem('currentEmployeeId') || 'employee_unknown';
    console.log('[DataService] getCurrentEmployeeId result', id);
    return id;
  }
  
  // Get milk data for dashboard with real-time updates
  static async getMilkSummary(date: string, centerCode?: string) {
    console.log('[DataService] Getting milk summary:', date, centerCode);
    try {
      const result = await databases.milkData.local.find({
        selector: {
          date: date,
          ...(centerCode && { centerCode })
        }
      });
      
      const records = result.docs as MilkRecord[];
      
      const morningRecords = records.filter(r => r.session === 'M');
      const eveningRecords = records.filter(r => r.session === 'E');
      
      const summary = {
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
      
      console.log('[DataService] getMilkSummary result', { date, centerCode });
      return summary;
    } catch (error) {
      console.error('Error getting milk summary:', error);
      return null;
    }
  }
  
  // User Management Methods
  static async saveUser(user: User): Promise<string> {
    console.log('[DataService] Saving user:', user);
    try {
      const userData = {
        ...user,
        updatedAt: new Date()
      };

      const result = await databases.users.local.put(userData as any);
      console.log('User saved:', result.id);
      
      this.broadcastChange('users', 'upsert', userData);
      
      console.log('[DataService] saveUser result', result.id);
      return result.id;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    console.log('[DataService] Getting user by ID:', userId);
    try {
      const result = await databases.users.local.get(userId);
      console.log('[DataService] getUserById result', result);
      return result as unknown as User;
    } catch (error) {
      if ((error as any).status === 404) {
        return null;
      }
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    console.log('[DataService] Getting user by username:', username);
    try {
      const result = await databases.users.local.find({
        selector: { username: username },
        limit: 1
      });
      
      console.log('[DataService] getUserByUsername result', result.docs[0]);
      return result.docs.length > 0 ? result.docs[0] as unknown as User : null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    console.log('[DataService] Getting all users');
    try {
      const result = await databases.users.local.allDocs({ include_docs: true });
      console.log('[DataService] getAllUsers result', result.rows);
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('user_')) as unknown as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    console.log('[DataService] Getting user by email:', email);
    try {
      const result = await databases.users.local.find({
        selector: { email: email },
        limit: 1
      });
      console.log('[DataService] getUserByEmail result', result.docs[0]);
      return result.docs.length > 0 ? result.docs[0] as unknown as User : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Get database stats
  static async getDatabaseStats(): Promise<any> {
    console.log('[DataService] Getting database stats');
    try {
      const stats: any = {};
      for (const [name, db] of Object.entries(databases)) {
        const info = await db.local.info();
        stats[name] = {
          docCount: info.doc_count,
          updateSeq: info.update_seq
        };
      }
      console.log('[DataService] getDatabaseStats result', stats);
      return stats;
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {};
    }
  }

  // Get farmers
  static async getFarmers(): Promise<any[]> {
    console.log('[DataService] Getting farmers');
    try {
      const result = await databases.farmers.local.allDocs({ include_docs: true });
      console.log('[DataService] getFarmers result', result.rows);
      return result.rows.map(row => row.doc);
    } catch (error) {
      console.error('Error getting farmers:', error);
      return [];
    }
  }

  // Import data
  static async importData(data: any): Promise<boolean> {
    console.log('[DataService] Importing data:', data);
    try {
      // Implementation for importing data
      console.log('Importing data:', data);
      console.log('[DataService] importData result', true);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
  
  // Get sync status for all databases
  static getSyncStatus(): { [key: string]: boolean } {
    console.log('[DataService] Getting sync status');
    console.log('[DataService] getSyncStatus result', this.syncStatus);
    return { ...this.syncStatus };
  }
  
  // Force sync all databases
  static async forceSyncAll(): Promise<void> {
    console.log('[DataService] Forcing sync for all databases');
    try {
      for (const [name, db] of Object.entries(databases)) {
        if (db.sync) {
          await db.sync.cancel();
        }
        
        if (db.remote && db.local) {
          // Restart sync
          db.sync = db.local.sync(db.remote, {
            live: true,
            retry: true,
            heartbeat: 10000,
            timeout: LAN_SYNC_CONFIG.syncTimeout
          });
          
          console.log(`Forced sync restarted for ${name}`);
        }
      }
      console.log('[DataService] forceSyncAll result');
    } catch (error) {
      console.error('Error forcing sync for all databases:', error);
    }
  }
  
  // Cleanup method to prevent memory leaks
  static async cleanup(): Promise<void> {
    console.log('[DataService] Cleaning up');
    try {
      if (this.syncCheckInterval) {
        clearInterval(this.syncCheckInterval);
        this.syncCheckInterval = null;
      }
      
      // Cancel all sync operations
      for (const [name, db] of Object.entries(databases)) {
        if (db.sync) {
          try {
            await db.sync.cancel();
          } catch (error) {
            console.error(`Error canceling sync for ${name}:`, error);
          }
        }
      }
      
      this.isInitialized = false;
      console.log('DataService cleanup completed');
      console.log('[DataService] cleanup result');
    } catch (error) {
      console.error('Error during DataService cleanup:', error);
    }
  }
  
  // Enhanced export functionality
  static async exportData(): Promise<any> {
    console.log('[DataService] Exporting data');
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
      
      console.log('[DataService] exportData result', data);
      return {
        timestamp: new Date(),
        data,
        version: '2.0',
        syncStatus: this.getSyncStatus()
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
  
  // Broadcast changes to components
  private static broadcastChange(database: string, action: string, data: any): void {
    console.log(`[DataService] Broadcasting change: ${database}, ${action}`, data);
    window.dispatchEvent(new CustomEvent('dataChange', {
      detail: { database, action, data, timestamp: new Date() }
    }));
    
    if (database === 'users') {
      window.dispatchEvent(new CustomEvent('userChange', {
        detail: { action, data, timestamp: new Date() }
      }));
    }
    console.log('[DataService] broadcastChange result', database, action, data);
  }
}

// Initialize farmers database with direct CouchDB sync for testing
const localDb = new PouchDB('farmers');
const remoteDb = new PouchDB('http://localhost:5984/farmers', {
  auth: { username: 'admin', password: 'password' }
});
localDb.sync(remoteDb, {
  live: true,
  retry: true
});