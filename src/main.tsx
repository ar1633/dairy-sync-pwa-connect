
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializePWA } from './utils/pwa'
import { DataService } from './services/dataService'

// Initialize PWA features
initializePWA();

// Initialize data service
DataService.initialize().then(() => {
  console.log('Data service initialized successfully');
}).catch(error => {
  console.error('Failed to initialize data service:', error);
});

createRoot(document.getElementById("root")!).render(<App />);
