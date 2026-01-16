import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suppress harmless service worker communication errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Could not establish connection')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
