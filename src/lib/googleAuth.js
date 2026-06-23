/**
 * googleAuth.js — Google Identity Services silent re-authentication helpers.
 *
 * Wraps window.google.accounts.id.prompt() in a Promise so apiFetch and the
 * background timer can await a new credential without showing a login page.
 *
 * Works because GoogleOAuthProvider (main.jsx) loads the GIS script globally.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const TIMEOUT_MS = 8_000;
const NEAR_EXPIRY_BUFFER_MS = 10 * 60 * 1000;
const INTERVAL_MS = 5 * 60 * 1000;

let pendingRefresh = null;

/**
 * Attempt silent re-authentication via Google Identity Services One Tap.
 *
 * Uses a singleton Promise so concurrent callers (e.g. multiple parallel API
 * calls that all fire with an expired token) share one GIS prompt.
 *
 * Resolves with a new ID token string on success.
 * Rejects if GIS is unavailable, the user is signed out of Google, the browser
 * blocks third-party cookies, or the attempt times out after 8 seconds.
 */
export function silentRefresh() {
  if (pendingRefresh) return pendingRefresh;

  pendingRefresh = new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      pendingRefresh = null;
      reject(new Error('GIS not available'));
      return;
    }

    let settled = false;
    const done = (err, token) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      pendingRefresh = null;
      err ? reject(err) : resolve(token);
    };

    const timeoutId = setTimeout(
      () => done(new Error('Silent re-auth timed out')),
      TIMEOUT_MS
    );

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      auto_select: true,
      callback: (res) => {
        res.credential
          ? done(null, res.credential)
          : done(new Error('No credential in response'));
      },
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        done(new Error(
          notification.getNotDisplayedReason?.() ??
          notification.getSkippedReason?.() ??
          'Silent re-auth unavailable'
        ));
      }
      // If One Tap is displayed, wait — user may click it.
    });
  });

  return pendingRefresh;
}

/**
 * Returns true if the token will expire within the next 10 minutes.
 * Used by the background timer to decide when to proactively refresh.
 */
export function isTokenNearExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 - Date.now() < NEAR_EXPIRY_BUFFER_MS;
  } catch {
    return true;
  }
}

/**
 * Start a background interval that proactively refreshes the token before it
 * expires, so users never hit an expired-token error during normal use.
 *
 * @param {() => string | null} getToken  - reads the current token from the store
 * @param {(token: string) => void} onNewToken - called with the new token on success
 * @returns {() => void} cleanup function — pass directly as useEffect return value
 */
export function startRefreshTimer(getToken, onNewToken) {
  const id = setInterval(async () => {
    const token = getToken();
    if (!token || !isTokenNearExpiry(token)) return;
    try {
      const newToken = await silentRefresh();
      onNewToken(newToken);
    } catch {
      // Swallow — apiFetch's expiry check will handle it on the next API call.
    }
  }, INTERVAL_MS);
  return () => clearInterval(id);
}
