import axios from 'axios';
import posthog from 'posthog-js';

const projectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;

if (projectToken) {
  posthog.init(projectToken, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    tracing_headers: ['dilemmai-idl.com'],
    defaults: '2026-05-30',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    person_profiles: 'never',
    before_send: (event) => {
      for (const key of ['$current_url', '$referrer']) {
        if (typeof event?.properties?.[key] !== 'string') continue;
        try {
          const url = new URL(event.properties[key]);
          url.search = '';
          url.hash = '';
          event.properties[key] = url.toString();
        } catch {}
      }
      return event;
    },
  });
}

function safeEndpoint(config) {
  try {
    return new URL(config?.url || '', config?.baseURL || location.origin).pathname
      .replace(/(\/custom-games\/)[^/]+/i, '$1:code')
      .replace(/(\/rooms\/(?:code|join)\/)[^/]+/i, '$1:code')
      .replace(/(\/chat\/session\/)[^/]+/i, '$1:session')
      .replace(/\/(?:\d{4,}|[0-9a-f]{8}-[0-9a-f-]{27,})(?=\/|$)/gi, '/:id');
  } catch {
    return '/unknown';
  }
}

export function captureApiError(error, service = 'api') {
  if (!projectToken || !error || error.code === 'ERR_CANCELED') return;

  const config = error.config;
  const method = String(config?.method || 'GET').toUpperCase();
  const endpoint = safeEndpoint(config);
  const status = error.response?.status;
  const reason = status ? `HTTP ${status}` : (error.code || 'network_error');
  const capturedError = new Error(`${method} ${endpoint} failed: ${reason}`);
  capturedError.name = 'ApiRequestError';

  try {
    posthog.captureException(capturedError, {
      service,
      method,
      endpoint,
      status_code: status || 0,
      error_code: error.code || null,
      request_id: error.response?.headers?.['x-request-id'] || null,
    });
  } catch {}
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    captureApiError(error);
    return Promise.reject(error);
  }
);

export default posthog;
