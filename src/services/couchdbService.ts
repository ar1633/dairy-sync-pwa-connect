
import PouchDB from 'pouchdb';

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

  constructor() {
    this.serverUrl = `${COUCHDB_CONFIG.protocol}//${COUCHDB_CONFIG.host}:${COUCHDB_CONFIG.port}`;
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
      const response = await fetch(`${this.serverUrl}/`);
      const data = await response.json();
      
      if (data.couchdb === 'Welcome') {
        this.isServerAvailable = true;
        console.log('CouchDB server is available');
        return true;
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
      'settings'
    ];

    for (const dbName of databases) {
      try {
        // Check if database exists
        const response = await fetch(`${this.serverUrl}/${dbName}`);
        
        if (response.status === 404) {
          // Create database
          await fetch(`${this.serverUrl}/${dbName}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log(`Created database: ${dbName}`);
        }
      } catch (error) {
        console.error(`Error setting up database ${dbName}:`, error);
      }
    }
  }

  // Get database URL for PouchDB sync
  getDatabaseUrl(dbName: string): string {
    return `${this.serverUrl}/${dbName}`;
  }

  // Setup CORS for web access
  async setupCORS(): Promise<void> {
    if (!this.isServerAvailable) return;

    try {
      const corsConfig = {
        enable_cors: true,
        origins: ['*'],
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE'],
        headers: ['accept', 'authorization', 'content-type', 'origin', 'referer', 'x-csrf-token']
      };

      await fetch(`${this.serverUrl}/_node/_local/_config/httpd/enable_cors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corsConfig.enable_cors)
      });

      await fetch(`${this.serverUrl}/_node/_local/_config/cors/origins`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify('*')
      });

      console.log('CORS configured for CouchDB');
    } catch (error) {
      console.error('Error setting up CORS:', error);
    }
  }

  // Initialize CouchDB service
  async initialize(): Promise<void> {
    await this.checkServerAvailability();
    
    if (this.isServerAvailable) {
      await this.setupCORS();
      await this.setupDatabases();
    }
  }

  getServerStatus(): boolean {
    return this.isServerAvailable;
  }
}
