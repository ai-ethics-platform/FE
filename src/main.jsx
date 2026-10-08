import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './core/router';
import { diagnosticError, startCreatorDiagnostics } from './utils/creatorDiagnostics';
import posthog from './utils/posthog';

startCreatorDiagnostics();
ReactDOM.createRoot(document.getElementById('root'), {
  onUncaughtError: (error, info) => {
    diagnosticError('react_error', error, info.componentStack);
    posthog.captureException(error);
  },
  onRecoverableError: error => diagnosticError('react_error', error),
}).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
