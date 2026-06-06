import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { HashRouter } from 'react-router-dom';
import { RealtimeProvider } from './context/RealtimeContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <RealtimeProvider>
        <App />
      </RealtimeProvider>
    </HashRouter>
  </React.StrictMode>,
);
