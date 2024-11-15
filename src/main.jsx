import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { UserProvider } from './context/userContext'; // Import UserProvider
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <UserProvider> {/* Wrap the app with UserProvider */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
