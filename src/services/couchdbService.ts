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
    this.serverUrl = `${COUCHDB_CONFIG.protocol}//${COUCHDB_CONFIG.host}:${COUCHDB_CONFIG.port}`;
    
    // Setup authentication headers
    const credentials = btoa(`${COUCHDB_CONFIG.username}:${COUCHDB_CONFIG.password}`);
    this.authHeaders = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  static getInstance(): CouchDBService {
    if (!CouchDBService.instance) {
      CouchDBService.instance = new CouchDBService();
    }
    return CouchDBService.instance;
  }

  // Check if CouchDB server is available
  async checkServerAvailability(): Promise<boolean> {
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
      console.log('CouchDB server not available, running in offline mode');
      this.isServerAvailable = false;
    }
    
    return false;
  }

  // Setup CouchDB databases
  async setupDatabases(): Promise<void> {
    if (!this.isServerAvailable) {
      console.log('CouchDB not available, skipping database setup');
      return;
    }

    const databases = [
      'milk_data',
      'farmers',
      'centers',
      'payments',
      'fodder',
      'settings',
      'users'
    ];

    for (const dbName of databases) {
      try {
        // Check if database exists
        const response = await fetch(`${this.serverUrl}/${dbName}`, {
          headers: this.authHeaders,
          mode: 'cors'
        });
        
        if (response.status === 404) {
          // Create database
          const createResponse = await fetch(`${this.serverUrl}/${dbName}`, {
            method: 'PUT',
            headers: this.authHeaders,
            mode: 'cors'
          });
          
          if (createResponse.ok) {
            console.log(`Created database: ${dbName}`);
          } else {
            console.error(`Failed to create database ${dbName}:`, createResponse.status);
          }
        } else if (response.ok) {
          console.log(`Database ${dbName} already exists`);
        }
      } catch (error) {
        console.error(`Error setting up database ${dbName}:`, error);
      }
    }
  }

  // Setup CORS for web access
  async setupCORS(): Promise<void> {
    if (!this.isServerAvailable) return;

    try {
      const corsSettings = [
        {
          path: '_node/_local/_config/httpd/enable_cors',
          value: 'true'
        },
        {
          path: '_node/_local/_config/cors/origins',
          value: '*'
        },
        {
          path: '_node/_local/_config/cors/credentials',
          value: 'true'
        },
        {
          path: '_node/_local/_config/cors/methods',
          value: 'GET, PUT, POST, HEAD, DELETE'
        },
        {
          path: '_node/_local/_config/cors/headers',
          value: 'accept, authorization, content-type, origin, referer, x-requested-with'
        }
      ];

      for (const setting of corsSettings) {
        try {
          const response = await fetch(`${this.serverUrl}/${setting.path}`, {
            method: 'PUT',
            headers: this.authHeaders,
            body: JSON.stringify(setting.value),
            mode: 'cors'
          });

          if (response.ok) {
            console.log(`CORS setting configured: ${setting.path}`);
          } else {
            console.warn(`Failed to configure CORS setting ${setting.path}:`, response.status);
          }
        } catch (error) {
          console.error(`Error configuring CORS setting ${setting.path}:`, error);
        }
      }

      console.log('CORS configuration completed');
    } catch (error) {
      console.error('Error setting up CORS:', error);
    }
  }

  // Get database URL for PouchDB sync with authentication
  getDatabaseUrl(dbName: string): string {
    const url = new URL(`${this.serverUrl}/${dbName}`);
    url.username = COUCHDB_CONFIG.username;
    url.password = COUCHDB_CONFIG.password;
    return url.toString();
  }

  // Get PouchDB instance with proper configuration
  getPouchDB(dbName: string): PouchDB.Database | null {
    if (!this.isServerAvailable) {
      return null;
    }

    return new PouchDB(this.getDatabaseUrl(dbName), {
      ajax: {
        timeout: 10000,
        headers: {
          'Authorization': `Basic ${btoa(`${COUCHDB_CONFIG.username}:${COUCHDB_CONFIG.password}`)}`
        }
      }
    });
  }

  // Test connection to a specific database
  async testDatabaseConnection(dbName: string): Promise<boolean> {
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

  // Initialize CouchDB service
  async initialize(): Promise<void> {
    console.log('Initializing CouchDB service...');
    
    await this.checkServerAvailability();
    
    if (this.isServerAvailable) {
      await this.setupCORS();
      await this.setupDatabases();
      console.log('CouchDB service initialized successfully');
    } else {
      console.log('CouchDB service running in offline mode');
    }
  }

  // Get server status and configuration
  getServerStatus(): {
    available: boolean;
    serverUrl: string;
    config: typeof COUCHDB_CONFIG;
  } {
    return {
      available: this.isServerAvailable,
      serverUrl: this.serverUrl,
      config: COUCHDB_CONFIG
    };
  }

  // Restart CouchDB connection
  async restart(): Promise<void> {
    console.log('Restarting CouchDB service...');
    this.isServerAvailable = false;
    await this.initialize();
  }
}

// Export singleton instance
export const couchDBService = CouchDBService.getInstance();