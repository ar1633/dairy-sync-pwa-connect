import PouchDB from 'pouchdb-browser';

// CouchDB configuration for LAN deployment
const COUCHDB_CONFIG = {
  host: window.location.hostname,
  port: 5984,
  protocol: window.location.protocol === 'https:' ? 'https' : 'http',
  username: 'admin',
  password: 'password', // This should be configured during setup
};

export class CouchDBService {
  private static instance: CouchDBService;
  private serverUrl: string;
  private isServerAvailable: boolean = false;
  private authHeaders: HeadersInit;

  constructor() {
    console.log('[CouchDBService] constructor');
    this.serverUrl = `${COUCHDB_CONFIG.protocol}//${COUCHDB_CONFIG.host}:${COUCHDB_CONFIG.port}`;
    
    // Setup authentication headers
    const credentials = btoa(`${COUCHDB_CONFIG.username}:${COUCHDB_CONFIG.password}`);
    this.authHeaders = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  static getInstance(): CouchDBService {
    console.log('[CouchDBService] getInstance');
    if (!CouchDBService.instance) {
      CouchDBService.instance = new CouchDBService();
    }
    return CouchDBService.instance;
  }

  // Check if CouchDB server is available
  async checkServerAvailability(): Promise<boolean> {
    console.log('[CouchDBService] checkServerAvailability');
    try {
      const response = await fetch(`${this.serverUrl}/`, {
        headers: this.authHeaders,
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.couchdb === 'Welcome') {
          this.isServerAvailable = true;
          console.log('CouchDB server is available');
          return true;
        }
      }
    } catch (error) {
      console.log('CouchDB server not available, running in offline mode', error);
      this.isServerAvailable = false;
    }
    
    console.log('[CouchDBService] checkServerAvailability result', this.isServerAvailable);
    return this.isServerAvailable;
  }

  // Setup CORS for web access - improved version
  async setupCORS(): Promise<void> {
    console.log('[CouchDBService] setupCORS');
    if (!this.isServerAvailable) return;

    const corsConfig = [
      { path: 'httpd/enable_cors', value: 'true' },
      { path: 'cors/origins', value: '*' },
      { path: 'cors/credentials', value: 'true' },
      { path: 'cors/methods', value: 'GET, PUT, POST, HEAD, DELETE, OPTIONS' },
      { path: 'cors/headers', value: 'accept, authorization, content-type, origin, referer, x-requested-with' }
    ];

    try {
      for (const config of corsConfig) {
        const response = await fetch(`${this.serverUrl}/_node/_local/_config/${config.path}`, {
          method: 'PUT',
          headers: this.authHeaders,
          body: JSON.stringify(config.value),
          mode: 'cors'
        });
        
        if (response.ok) {
          console.log(`✓ CORS config set: ${config.path} = ${config.value}`);
        } else {
          console.error(`✗ Failed to set CORS config: ${config.path}`, response.status);
        }
      }
      console.log('CORS configuration completed');
    } catch (error) {
      console.error('Error setting up CORS:', error);
    }
  }

  // Create a database if it does not exist - improved version
  async createDatabaseIfMissing(dbName: string): Promise<boolean> {
    console.log(`[CouchDBService] createDatabaseIfMissing: ${dbName}`);
    
    if (!this.isServerAvailable) {
      console.log('CouchDB not available, skipping database creation');
      return false;
    }

    try {
      // Check if database exists
      const checkResponse = await fetch(`${this.serverUrl}/${dbName}`, {
        headers: this.authHeaders,
        mode: 'cors'
      });
      
      if (checkResponse.status === 404) {
        // Database doesn't exist, create it
        const createResponse = await fetch(`${this.serverUrl}/${dbName}`, {
          method: 'PUT',
          headers: this.authHeaders,
          mode: 'cors'
        });
        
        if (createResponse.ok) {
          console.log(`✓ Created database: ${dbName}`);
          return true;
        } else {
          console.error(`✗ Failed to create database ${dbName}:`, createResponse.status);
          const errorText = await createResponse.text();
          console.error('Error details:', errorText);
          return false;
        }
      } else if (checkResponse.ok) {
        console.log(`✓ Database ${dbName} already exists`);
        return true;
      } else {
        console.error(`✗ Error checking database ${dbName}:`, checkResponse.status);
        return false;
      }
    } catch (error) {
      console.error(`✗ Error with database ${dbName}:`, error);
      return false;
    }
  }

  // Setup CouchDB databases - simplified version
  async setupDatabases(): Promise<void> {
    console.log('[CouchDBService] setupDatabases');
    if (!this.isServerAvailable) {
      console.log('CouchDB not available, skipping database setup');
      return;
    }

    await this.ensureAllDatabasesExist();
  }

  // Ensure all required databases exist
  async ensureAllDatabasesExist(): Promise<void> {
    console.log('[CouchDBService] ensureAllDatabasesExist');
    const databases = [
      'milk_data',
      'farmers',
      'centers',
      'payments',
      'fodder',
      'settings',
      'users'
    ];
    
    const results = await Promise.all(
      databases.map(dbName => this.createDatabaseIfMissing(dbName))
    );
    
    const successCount = results.filter(result => result).length;
    console.log(`Database setup complete: ${successCount}/${databases.length} databases ready`);
  }

  // Get database URL for PouchDB sync with authentication
  getDatabaseUrl(dbName: string): string {
    console.log('[CouchDBService] getDatabaseUrl', dbName);
    const url = new URL(`${this.serverUrl}/${dbName}`);
    url.username = COUCHDB_CONFIG.username;
    url.password = COUCHDB_CONFIG.password;
    const urlStr = url.toString();
    console.log('[CouchDBService] getDatabaseUrl result', urlStr);
    return urlStr;
  }

  // Get PouchDB instance with proper configuration
  getPouchDB(dbName: string): PouchDB.Database | null {
    console.log('[CouchDBService] getPouchDB', dbName);
    if (!this.isServerAvailable) {
      console.log('CouchDB not available, returning null');
      return null;
    }

    const db = new PouchDB(this.getDatabaseUrl(dbName), {
      ajax: {
        timeout: 10000,
        headers: {
          'Authorization': `Basic ${btoa(`${COUCHDB_CONFIG.username}:${COUCHDB_CONFIG.password}`)}`
        }
      }
    });
    console.log('[CouchDBService] getPouchDB result', db);
    return db;
  }

  // Test connection to a specific database
  async testDatabaseConnection(dbName: string): Promise<boolean> {
    console.log('[CouchDBService] testDatabaseConnection', dbName);
    try {
      const response = await fetch(`${this.serverUrl}/${dbName}`, {
        headers: this.authHeaders,
        mode: 'cors'
      });
      console.log('[CouchDBService] testDatabaseConnection result', response.ok);
      return response.ok;
    } catch (error) {
      console.error('[CouchDBService] testDatabaseConnection error', error);
      return false;
    }
  }

  // Initialize CouchDB service with better error handling
  async initialize(): Promise<void> {
    console.log('🚀 Initializing CouchDB service...');
    
    const serverAvailable = await this.checkServerAvailability();
    
    if (serverAvailable) {
      console.log('📡 CouchDB server is available');
      await this.setupCORS();
      await this.setupDatabases();
      console.log('✅ CouchDB service initialized successfully');
    } else {
      console.log('⚠️ CouchDB service running in offline mode');
    }
  }

  // Get server status and configuration
  getServerStatus(): {
    available: boolean;
    serverUrl: string;
    config: typeof COUCHDB_CONFIG;
  } {
    console.log('[CouchDBService] getServerStatus');
    const status = {
      available: this.isServerAvailable,
      serverUrl: this.serverUrl,
      config: COUCHDB_CONFIG
    };
    console.log('[CouchDBService] getServerStatus result', status);
    return status;
  }

  // Restart CouchDB connection
  async restart(): Promise<void> {
    console.log('[CouchDBService] restart');
    console.log('🔄 Restarting CouchDB service...');
    this.isServerAvailable = false;
    await this.initialize();
  }

  // Helper method to check if a specific database exists
  async databaseExists(dbName: string): Promise<boolean> {
    if (!this.isServerAvailable) return false;
    
    try {
      const response = await fetch(`${this.serverUrl}/${dbName}`, {
        headers: this.authHeaders,
        mode: 'cors'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Legacy methods for backward compatibility
  async ensureDatabaseExists(dbName: string): Promise<void> {
    await this.createDatabaseIfMissing(dbName);
  }
}

// Export singleton instance
export const couchDBService = CouchDBService.getInstance();