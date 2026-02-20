import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Log build id so you can verify deployed version (e.g. in DevTools Console)
if (typeof __BUILD_ID__ !== 'undefined') {
  console.log('Monodify build:', __BUILD_ID__);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
