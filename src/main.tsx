
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './utils/pwa'

createRoot(document.getElementById("root")!).render(<App />);

// Register PWA service worker
registerServiceWorker();
