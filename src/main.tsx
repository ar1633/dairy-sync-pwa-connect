
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize PWA features conditionally
const initializePWA = async () => {
  try {
    const { PWAUtils } = await import('./utils/pwa');
    await PWAUtils.initialize();
    console.log('PWA initialized successfully');
  } catch (error) {
    console.error('PWA initialization failed:', error);
  }
};

// Initialize data service conditionally
const initializeDataService = async () => {
  try {
    const { DataService } = await import('./services/dataService');
    await DataService.initialize();
    console.log('Data service initialized successfully');
  } catch (error) {
    console.error('Data service initialization failed:', error);
  }
};

// Initialize services
initializePWA();
initializeDataService();

createRoot(document.getElementById("root")!).render(<App />);
