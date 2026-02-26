import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { UserTeamProvider } from './context/UserTeamContext';
import { ToastProvider } from './context/ToastContext';
import { SeasonProvider } from './context/SeasonContext';
import ToastStack from './components/Toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <UserTeamProvider>
          <SeasonProvider>
            <App />
            <ToastStack />
          </SeasonProvider>
        </UserTeamProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
