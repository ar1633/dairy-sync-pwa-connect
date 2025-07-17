
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize all services
const initializeApp = async () => {
  try {
    // Initialize PWA features
    const { initialize: initializePWA } = await import('./utils/pwa');
    await initializePWA();
    console.log('PWA initialized successfully');

    // Initialize PWA installer
    const { PWAInstaller } = await import('./utils/pwaInstaller');
    PWAInstaller.initialize();
    console.log('PWA installer initialized');

    // Initialize CouchDB service
    const { CouchDBService } = await import('./services/couchdbService');
    const couchdb = CouchDBService.getInstance();
    await couchdb.initialize();
    console.log('CouchDB service initialized');

    // Initialize data service
    const { DataService } = await import('./services/dataService');
    await DataService.initialize();
    console.log('Data service initialized successfully');

  } catch (error) {
    console.error('Service initialization failed:', error);
    // Continue with app initialization even if services fail
  }
};

// Initialize services in background
initializeApp().catch(console.error);

// Start the React app immediately
createRoot(document.getElementById("root")!).render(<App />);
