import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle dynamic module import fetch failures (Vite chunk expiration or network drops)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite dynamic module preload error encountered, reloading to sync chunks...', event);
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
