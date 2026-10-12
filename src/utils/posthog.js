import axios from 'axios';
import posthog from 'posthog-js';
import { customGameStorage, isCustomGameReady } from './customGameStorage';

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
        } catch { /* Ignore malformed URLs during telemetry sanitization. */ }
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
  } catch { /* Telemetry failures must not interrupt API error handling. */ }
}

export async function captureGameContext(event, properties = {}, comparison = {}) {
  if (!projectToken) return;
  try {
    // Snapshot before hashing so later navigation cannot change the reported game.
    const code = customGameStorage.getItem('code') || '';
    const rawOpening = customGameStorage.getItem('opening') || '[]';
    let opening = [];
    let openingParseFailed = false;
    try { opening = JSON.parse(rawOpening); } catch { openingParseFailed = true; }
    const gameTitle = customGameStorage.getItem('creatorTitle') || '';
    const context = {
      diagnostic_version: 'story-v2',
      custom_mode: Boolean(code),
      custom_game_ready: isCustomGameReady(),
      role_id: Number(localStorage.getItem('myrole_id')) || null,
      opening_count: Array.isArray(opening) ? opening.length : 0,
      opening_parse_failed: openingParseFailed,
      build_asset: new URL(document.querySelector('script[type="module"][src]')?.src || location.origin).pathname,
      room_topic_matches_game_title: comparison.roomTopic == null ? null : comparison.roomTopic === gameTitle,
    };
    const values = {
      room_fingerprint: localStorage.getItem('room_code') || '',
      game_fingerprint: code,
      loaded_game_fingerprint: customGameStorage.getItem('loadedCode') || '',
      requested_game_fingerprint: comparison.expectedCode || '',
      opening_fingerprint: rawOpening,
      story_fingerprint: comparison.storyText || '',
    };
    const fingerprints = {};
    for (const [key, value] of Object.entries(values)) {
      const digest = value ? await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)) : null;
      fingerprints[key] = digest ? Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 16) : null;
    }
    posthog.capture(event, { ...properties, ...context, ...fingerprints });
  } catch {
    // Diagnostics must not affect game loading or navigation.
  }
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    captureApiError(error);
    return Promise.reject(error);
  }
);

export default posthog;
