import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './core/router';
import { diagnosticError, startCreatorDiagnostics } from './utils/creatorDiagnostics';

startCreatorDiagnostics();
ReactDOM.createRoot(document.getElementById('root'), {
  onUncaughtError: (error, info) => diagnosticError('react_error', error, info.componentStack),
  onRecoverableError: error => diagnosticError('react_error', error),
}).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
