import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// StrictMode disabled: its double-mounting creates duplicate WebGL contexts
// (R3F city + MapLibre) and causes "WebGLRenderer: Context Lost" in dev.
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
