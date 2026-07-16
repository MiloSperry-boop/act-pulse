import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import { App } from './App';

// iOS Safari can ignore user-scalable=no; block pinch-zoom gestures directly
// so the app pans vertically only, like a native screen. (Double-tap zoom is
// already disabled by touch-action: pan-y in CSS, without delaying taps.)
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
