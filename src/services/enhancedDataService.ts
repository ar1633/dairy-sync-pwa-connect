
import { DataService } from './dataService';
import { User } from './authService';

// Extend DataService with user management capabilities
export class EnhancedDataService extends DataService {
  // User Management Methods
  static async saveUser(user: User): Promise<string> {
    try {
      const result = await this.getUserDatabase().put(user);
      console.log('User saved:', result.id);
      
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
      const result = await this.getUserDatabase().get(userId);
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
      const result = await this.getUserDatabase().find({
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
      const result = await this.getUserDatabase().find({
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
      const result = await this.getUserDatabase().allDocs({ include_docs: true });
      return result.rows
        .map(row => row.doc)
        .filter(doc => doc && doc._id.startsWith('user_')) as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return false;
      }

      await this.getUserDatabase().remove(user);
      
      // Broadcast change
      this.broadcastChange('users', 'delete', { _id: userId });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Get user database
  private static getUserDatabase() {
    return this.databases.users || this.createUserDatabase();
  }

  // Create user database if it doesn't exist
  private static createUserDatabase() {
    const PouchDB = require('pouchdb');
    PouchDB.plugin(require('pouchdb-find'));
    
    const userDb = new PouchDB('users', { adapter: 'idb' });
    
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
    const enhancedData = {
      ...data,
      employeeId: userId,
      timestamp: new Date()
    };
    
    return await this.saveMilkCollection(enhancedData);
  }

  // Get user activity logs
  static async getUserActivityLogs(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const result = await this.databases.milkData.local.find({
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

  // Get system statistics
  static async getSystemStats(): Promise<any> {
    try {
      const stats = await super.getDatabaseStats();
      const users = await this.getAllUsers();
      
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
    try {
      const baseData = await super.exportData();
      const users = await this.getAllUsers();
      
      // Remove passwords from exported users for security
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
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
      
      console.log('All data imported successfully');
    } catch (error) {
      console.error('Error importing all data:', error);
      throw error;
    }
  }
}
