import { DataService } from './dataService';
import { User } from './authService';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

// Configure PouchDB with find plugin
PouchDB.plugin(PouchDBFind);

// Extend DataService with user management capabilities
export class EnhancedDataService extends DataService {
  // User Management Methods
  static async saveUser(user: User): Promise<string> {
    console.log('[EnhancedDataService] saveUser', user);
    try {
      const result = await this.getUserDatabase().put(user as any);
      console.log('User saved:', result.id);
      
      // Broadcast change to other components
      this.broadcastChange('users', 'upsert', user);
      
      console.log('[EnhancedDataService] saveUser result', result.id);
      return result.id;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    console.log('[EnhancedDataService] getUserById', userId);
    try {
      const result = await this.getUserDatabase().get(userId);
      console.log('[EnhancedDataService] getUserById result', result);
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
    console.log('[EnhancedDataService] getUserByUsername', username);
    try {
      const result = await this.getUserDatabase().find({
        selector: { username: username },
        limit: 1
      });
      
      console.log('[EnhancedDataService] getUserByUsername result', result.docs[0]);
      return result.docs.length > 0 ? result.docs[0] as unknown as User : null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    console.log('[EnhancedDataService] getUserByEmail', email);
    try {
      const result = await this.getUserDatabase().find({
        selector: { email: email },
        limit: 1
      });
      
      console.log('[EnhancedDataService] getUserByEmail result', result.docs[0]);
      return result.docs.length > 0 ? result.docs[0] as unknown as User : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    console.log('[EnhancedDataService] getAllUsers');
    try {
      const result = await this.getUserDatabase().allDocs({ include_docs: true });
      console.log('[EnhancedDataService] getAllUsers result', result.rows);
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('user_')) as unknown as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    console.log('[EnhancedDataService] deleteUser', userId);
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return false;
      }

      // Get the document with revision info for deletion
      const userDoc = await this.getUserDatabase().get(userId);
      await this.getUserDatabase().remove(userDoc);
      
      // Broadcast change
      this.broadcastChange('users', 'delete', { _id: userId });
      
      console.log('[EnhancedDataService] deleteUser result', true);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Get user database - access the local database instance
  private static getUserDatabase() {
    console.log('[EnhancedDataService] getUserDatabase');
    const userDbConfig = this.databases.users;
    if (userDbConfig && typeof userDbConfig === 'object' && 'local' in userDbConfig) {
      return userDbConfig.local;
    }
    return this.createUserDatabase();
  }

  // Create user database if it doesn't exist
  private static createUserDatabase() {
    console.log('[EnhancedDataService] createUserDatabase');
    const userDb = new PouchDB('users');
    
    // Create indexes for efficient querying
    userDb.createIndex({
      index: { fields: ['username'] }
    });
    
    userDb.createIndex({
      index: { fields: ['email'] }
    });
    
    userDb.createIndex({
      index: { fields: ['role'] }
    });

    // Setup sync if CouchDB is available
    const remoteDb = new PouchDB(`${this.LAN_SYNC_CONFIG.serverUrl}/users`);
    const sync = userDb.sync(remoteDb, {
      live: true,
      retry: true,
      heartbeat: 10000,
      timeout: 60000
    });

    this.databases.users = { local: userDb, remote: remoteDb, sync };
    return userDb;
  }

  // Enhanced milk collection with user tracking
  static async saveMilkCollectionWithUser(data: any, userId: string): Promise<string> {
    console.log('[EnhancedDataService] saveMilkCollectionWithUser', data, userId);
    const enhancedData = {
      ...data,
      employeeId: userId,
      timestamp: new Date()
    };
    
    const result = await this.saveMilkCollection(enhancedData);
    console.log('[EnhancedDataService] saveMilkCollectionWithUser result', result);
    return result;
  }

  // Get user activity logs
  static async getUserActivityLogs(userId: string, limit: number = 50): Promise<any[]> {
    console.log('[EnhancedDataService] getUserActivityLogs', userId, limit);
    try {
      const milkDataDb = this.databases.milkData;
      let db;
      
      if (milkDataDb && typeof milkDataDb === 'object' && 'local' in milkDataDb) {
        db = milkDataDb.local;
      } else {
        // Fallback to direct database access
        console.warn('Using fallback database access for milk data');
        return [];
      }
      
      const result = await db.find({
        selector: { employeeId: userId },
        sort: [{ timestamp: 'desc' }],
        limit: limit
      });
      
      console.log('[EnhancedDataService] getUserActivityLogs result', result.docs);
      return result.docs;
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      return [];
    }
  }

  // Get system statistics
  static async getSystemStats(): Promise<any> {
    console.log('[EnhancedDataService] getSystemStats');
    try {
      const stats = await super.getDatabaseStats();
      const users = await this.getAllUsers();
      
      console.log('[EnhancedDataService] getSystemStats result', {
        ...stats,
        users: {
          total: users.length,
          active: users.filter(u => u.isActive).length,
          admins: users.filter(u => u.role === 'admin').length,
          employees: users.filter(u => u.role === 'employee').length
        }
      });
      return {
        ...stats,
        users: {
          total: users.length,
          active: users.filter(u => u.isActive).length,
          admins: users.filter(u => u.role === 'admin').length,
          employees: users.filter(u => u.role === 'employee').length
        }
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {};
    }
  }

  // Broadcast method override to include user changes
  protected static broadcastChange(database: string, action: string, data: any): void {
    console.log('[EnhancedDataService] broadcastChange', database, action, data);
    super.broadcastChange(database, action, data);
    
    // Additional broadcasting for user-related changes
    if (database === 'users') {
      window.dispatchEvent(new CustomEvent('userChange', {
        detail: { action, data, timestamp: new Date() }
      }));
    }
  }

  // Enhanced export with user data
  static async exportAllData(): Promise<any> {
    console.log('[EnhancedDataService] exportAllData');
    try {
      const baseData = await super.exportData();
      const users = await this.getAllUsers();
      
      // Remove passwords from exported users for security
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      console.log('[EnhancedDataService] exportAllData result', {
        ...baseData,
        data: {
          ...baseData.data,
          users: sanitizedUsers
        }
      });
      return {
        ...baseData,
        data: {
          ...baseData.data,
          users: sanitizedUsers
        }
      };
    } catch (error) {
      console.error('Error exporting all data:', error);
      throw error;
    }
  }

  // Enhanced import with user data
  static async importAllData(backupData: any): Promise<void> {
    console.log('[EnhancedDataService] importAllData', backupData);
    try {
      await super.importData(backupData);
      
      // Import users if they exist in backup
      if (backupData.data.users) {
        const userDb = this.getUserDatabase();
        
        for (const user of backupData.data.users) {
          try {
            // Generate new ID to avoid conflicts
            const newUser = {
              ...user,
              _id: `user_imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              importedAt: new Date()
            };
            
            await userDb.put(newUser);
          } catch (error) {
            console.error('Error importing user:', user.username, error);
          }
        }
      }
      
      console.log('[EnhancedDataService] importAllData result', 'All data imported successfully');
    } catch (error) {
      console.error('Error importing all data:', error);
      throw error;
    }
  }
}
