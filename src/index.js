import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'react-auth-kit';
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";

const engine = new Styletron();
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <StyletronProvider value={engine}>
        <AuthProvider
          authStorageType={"cookie"}
          authName={"_auth"}
          cookieDomain={window.location.hostname}
          cookieSecure={false}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
    </StyletronProvider>
  </React.StrictMode>
);

