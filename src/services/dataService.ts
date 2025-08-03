import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { EIPParser, MilkRecord, USBFileProcessor } from '@/utils/eipParser';
import { User } from './authService';
import { AuthService } from './authService';

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
  static databases = databases; // Made public for enhanced service
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
    const record: MilkRecord & { _rev?: string } = {
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
      
      const records = result.docs as any[];
      
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

  static async getAllUsers(): Promise<User[]> {
    console.log('[DataService] Getting all users');
    try {
      const result = await databases.users.local.allDocs({ include_docs: true });
      const users = result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('user_'));
      
      console.log('[DataService] getAllUsers result', users);
      return users as unknown as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Farmer Management Methods
  static async saveFarmer(farmer: any): Promise<string> {
    console.log('[DataService] Saving farmer:', farmer);
    try {
      const farmerData = {
        ...farmer,
        updatedAt: new Date()
      };

      const result = await databases.farmers.local.put(farmerData);
      console.log('Farmer saved:', result.id);
      
      this.broadcastChange('farmers', 'upsert', farmerData);
      
      console.log('[DataService] saveFarmer result', result.id);
      return result.id;
    } catch (error) {
      console.error('Error saving farmer:', error);
      throw error;
    }
  }

  static async getFarmers(): Promise<any[]> {
    console.log('[DataService] Getting farmers');
    try {
      const result = await databases.farmers.local.allDocs({ include_docs: true });
      const farmers = result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('farmer_'));
      
      console.log('[DataService] getFarmers result', farmers);
      return farmers;
    } catch (error) {
      console.error('Error getting farmers:', error);
      return [];
    }
  }

  static async deleteFarmer(farmerId: string): Promise<boolean> {
    console.log('[DataService] Deleting farmer:', farmerId);
    try {
      const farmer = await databases.farmers.local.get(farmerId);
      await databases.farmers.local.remove(farmer);
      
      this.broadcastChange('farmers', 'delete', { _id: farmerId });
      
      console.log('[DataService] deleteFarmer result', true);
      return true;
    } catch (error) {
      console.error('Error deleting farmer:', error);
      return false;
    }
  }

  static async getCentres(): Promise<any[]> {
    console.log('[DataService] Getting centres');
    try {
      const result = await databases.centers.local.allDocs({ include_docs: true });
      const centres = result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('centre_'));
      
      console.log('[DataService] getCentres result', centres);
      return centres;
    } catch (error) {
      console.error('Error getting centres:', error);
      return [];
    }
  }
  
  // Get system statistics
  static async getDatabaseStats(): Promise<any> {
    console.log('[DataService] Getting database stats');
    try {
      const stats = {
        milkData: { count: 0, size: 0 },
        farmers: { count: 0, size: 0 },
        centers: { count: 0, size: 0 },
        users: { count: 0, size: 0 },
        sync: this.syncStatus
      };

      for (const [name, db] of Object.entries(databases)) {
        try {
          const info = await db.local.info();
          stats[name] = {
            count: info.doc_count,
            size: (info as any).data_size || 0
          };
        } catch (error) {
          console.error(`Error getting stats for ${name}:`, error);
        }
      }

      console.log('[DataService] getDatabaseStats result', stats);
      return stats;
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {};
    }
  }


  // Broadcast method for change notifications
  static broadcastChange(database: string, action: string, data: any): void {
    console.log('[DataService] Broadcasting change:', database, action, data);
    window.dispatchEvent(new CustomEvent('dataChange', {
      detail: { database, action, data, timestamp: new Date() }
    }));
  }
  
  // Data export functionality
  static async exportData(): Promise<any> {
    console.log('[DataService] Exporting all data');
    try {
      const data = {
        timestamp: new Date(),
        version: '1.0',
        data: {}
      };

      // Export each database
      for (const [name, db] of Object.entries(databases)) {
        try {
          const result = await db.local.allDocs({ include_docs: true });
          data.data[name] = result.rows.map(row => row.doc);
        } catch (error) {
          console.error(`Error exporting ${name}:`, error);
          data.data[name] = [];
        }
      }

      console.log('[DataService] exportData result', data);
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Data import functionality
  static async importData(backupData: any): Promise<void> {
    console.log('[DataService] Importing data:', backupData);
    try {
      if (!backupData.data) {
        throw new Error('Invalid backup data format');
      }

      for (const [dbName, docs] of Object.entries(backupData.data)) {
        if (databases[dbName] && Array.isArray(docs)) {
          const db = databases[dbName].local;
          
          for (const doc of docs as any[]) {
            try {
              // Remove revision to avoid conflicts
              const cleanDoc = { ...doc };
              delete cleanDoc._rev;
              
              await db.put(cleanDoc);
            } catch (error) {
              console.error(`Error importing doc ${doc._id} to ${dbName}:`, error);
            }
          }
        }
      }

      console.log('[DataService] importData completed');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Centre Management Methods
  static async saveCentre(centre: any): Promise<string> {
    // Permission check
    const user = AuthService.getInstance().getCurrentUser();
    if (!AuthService.hasPermission(user, 'master')) {
      throw new Error('You do not have permission to add or edit centres.');
    }
    try {
      const centreData = {
        ...centre,
        updatedAt: new Date()
      };
      const result = await databases.centers.local.put(centreData);
      this.broadcastChange('centers', 'upsert', centreData);
      return result.id;
    } catch (error) {
      console.error('Error saving centre:', error);
      throw error;
    }
  }

  static async deleteCentre(centreId: string): Promise<boolean> {
    // Permission check
    const user = AuthService.getInstance().getCurrentUser();
    if (!AuthService.hasPermission(user, 'master')) {
      throw new Error('You do not have permission to delete centres.');
    }
    try {
      const centre = await databases.centers.local.get(centreId);
      await databases.centers.local.remove(centre);
      this.broadcastChange('centers', 'delete', { _id: centreId });
      return true;
    } catch (error) {
      console.error('Error deleting centre:', error);
      return false;
    }
  }

  // Milk Price Management Methods
  static async saveMilkPrice(price: any): Promise<string> {
    // Permission check
    const user = AuthService.getInstance().getCurrentUser();
    if (!AuthService.hasPermission(user, 'system')) {
      throw new Error('You do not have permission to add or edit milk prices.');
    }
    try {
      const priceData = {
        ...price,
        updatedAt: new Date()
      };
      const result = await databases.settings.local.put(priceData);
      this.broadcastChange('settings', 'upsert', priceData);
      return result.id;
    } catch (error) {
      console.error('Error saving milk price:', error);
      throw error;
    }
  }

  static async getMilkPrices(): Promise<any[]> {
    try {
      const result = await databases.settings.local.allDocs({ include_docs: true });
      const prices = result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('milkprice_'));
      return prices;
    } catch (error) {
      console.error('Error getting milk prices:', error);
      return [];
    }
  }

  static async deleteMilkPrice(priceId: string): Promise<boolean> {
    // Permission check
    const user = AuthService.getInstance().getCurrentUser();
    if (!AuthService.hasPermission(user, 'system')) {
      throw new Error('You do not have permission to delete milk prices.');
    }
    try {
      const price = await databases.settings.local.get(priceId);
      await databases.settings.local.remove(price);
      this.broadcastChange('settings', 'delete', { _id: priceId });
      return true;
    } catch (error) {
      console.error('Error deleting milk price:', error);
      return false;
    }
  }

  // Get profit loss report data
  static async getProfitLossReport() {
    console.log('[DataService] getProfitLossReport');
    try {
      const milkCollections = await this.getMilkCollections();
      const totalRevenue = milkCollections.reduce((sum, collection: any) => sum + (collection.amount || 0), 0);
      const totalExpenses = 50000; // Mock data - replace with actual expense calculation
      
      return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses,
        period: 'Current Month'
      };
    } catch (error) {
      console.error('[DataService] getProfitLossReport error:', error);
      return { revenue: 0, expenses: 0, profit: 0, period: 'Current Month' };
    }
  }

  // Get employee salaries
  static async getEmployeeSalaries() {
    console.log('[DataService] getEmployeeSalaries');
    try {
      const employees = await this.getEmployees();
      return employees.map((emp: any) => ({
        name: emp.username,
        position: emp.role,
        salary: 25000, // Mock data
        deductions: 2500
      }));
    } catch (error) {
      console.error('[DataService] getEmployeeSalaries error:', error);
      return [];
    }
  }

  // Get payment summary
  static async getPaymentSummary() {
    console.log('[DataService] getPaymentSummary');
    try {
      const milkCollections = await this.getMilkCollections();
      const farmers = await this.getFarmers();
      
      const summary = farmers.map((farmer: any) => {
        const farmerCollections = milkCollections.filter((c: any) => c.farmerId === farmer.farmerId);
        const totalAmount = farmerCollections.reduce((sum, c: any) => sum + (c.amount || 0), 0);
        
        return {
          farmerId: farmer.farmerId,
          farmerName: farmer.name,
          totalAmount,
          totalQuantity: farmerCollections.reduce((sum, c: any) => sum + (c.quantity || 0), 0),
          collections: farmerCollections.length
        };
      });
      
      return summary;
    } catch (error) {
      console.error('[DataService] getPaymentSummary error:', error);
      return [];
    }
  }

  // Milk Buyers Management
  static async getMilkBuyers() {
    console.log('[DataService] getMilkBuyers');
    try {
      const result = await databases.settings.local.allDocs({ include_docs: true });
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('milkbuyer_') && !doc._id.startsWith('_design'));
    } catch (error) {
      console.error('[DataService] getMilkBuyers error:', error);
      return [];
    }
  }

  static async saveMilkBuyer(buyer: any) {
    console.log('[DataService] saveMilkBuyer', buyer);
    try {
      const doc = {
        _id: buyer.id ? `milkbuyer_${buyer.id}` : `milkbuyer_${Date.now()}`,
        type: 'milkBuyer',
        ...buyer,
        updatedAt: new Date().toISOString()
      };
      
      if (buyer.id) {
        try {
          const existing = await databases.settings.local.get(doc._id);
          doc._rev = existing._rev;
        } catch (e) {
          // Document doesn't exist, create new
        }
      }
      
      const result = await databases.settings.local.put(doc);
      this.broadcastChange('settings', 'upsert', doc);
      return { ...doc, _rev: result.rev };
    } catch (error) {
      console.error('[DataService] saveMilkBuyer error:', error);
      throw error;
    }
  }

  static async deleteMilkBuyer(id: string) {
    console.log('[DataService] deleteMilkBuyer', id);
    try {
      const docId = id.startsWith('milkbuyer_') ? id : `milkbuyer_${id}`;
      const doc = await databases.settings.local.get(docId);
      await databases.settings.local.remove(doc);
      this.broadcastChange('settings', 'delete', { _id: docId });
      return true;
    } catch (error) {
      console.error('[DataService] deleteMilkBuyer error:', error);
      throw error;
    }
  }

  // Fodder Providers Management
  static async getFodderProviders() {
    console.log('[DataService] getFodderProviders');
    try {
      const result = await databases.settings.local.allDocs({ include_docs: true });
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('fodderprovider_') && !doc._id.startsWith('_design'));
    } catch (error) {
      console.error('[DataService] getFodderProviders error:', error);
      return [];
    }
  }

  static async saveFodderProvider(provider: any) {
    console.log('[DataService] saveFodderProvider', provider);
    try {
      const doc = {
        _id: provider.id ? `fodderprovider_${provider.id}` : `fodderprovider_${Date.now()}`,
        type: 'fodderProvider',
        ...provider,
        updatedAt: new Date().toISOString()
      };
      
      if (provider.id) {
        try {
          const existing = await databases.settings.local.get(doc._id);
          doc._rev = existing._rev;
        } catch (e) {
          // Document doesn't exist, create new
        }
      }
      
      const result = await databases.settings.local.put(doc);
      this.broadcastChange('settings', 'upsert', doc);
      return { ...doc, _rev: result.rev };
    } catch (error) {
      console.error('[DataService] saveFodderProvider error:', error);
      throw error;
    }
  }

  static async deleteFodderProvider(id: string) {
    console.log('[DataService] deleteFodderProvider', id);
    try {
      const docId = id.startsWith('fodderprovider_') ? id : `fodderprovider_${id}`;
      const doc = await databases.settings.local.get(docId);
      await databases.settings.local.remove(doc);
      this.broadcastChange('settings', 'delete', { _id: docId });
      return true;
    } catch (error) {
      console.error('[DataService] deleteFodderProvider error:', error);
      throw error;
    }
  }

  // Get milk collections (modified to remove duplicate)
  static async getMilkCollections() {
    console.log('[DataService] getMilkCollections');
    try {
      const result = await databases.milkData.local.allDocs({ include_docs: true });
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc && !doc._id.startsWith('_design'));
    } catch (error) {
      console.error('[DataService] getMilkCollections error:', error);
      return [];
    }
  }

  // Get employees
  static async getEmployees() {
    console.log('[DataService] getEmployees');
    try {
      const result = await databases.users.local.allDocs({ include_docs: true });
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('user_') && !doc._id.startsWith('_design'));
    } catch (error) {
      console.error('[DataService] getEmployees error:', error);
      return [];
    }
  }
}
