import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

/**
 * useToast()
 *
 * Returns a `showToast(message)` function.
 * Call from any component inside <ToastProvider>.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ─── Provider + UI ───────────────────────────────────────────────────────────

/**
 * Toast
 *
 * Renders the toast UI AND provides the ToastContext.
 * Mount once in App.jsx outside the route tree.
 *
 * Usage in any child:
 *   const { showToast } = useToast();
 *   showToast('Stage advanced → Kick-off call');
 */
export default function Toast({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Fixed toast at bottom-center */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className={[
            'bg-ink text-white px-4 py-2.5 rounded-pill text-sm font-medium',
            'flex items-center gap-2 whitespace-nowrap',
            'transition-all duration-[250ms]',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          ].join(' ')}
        >
          <span className="w-[7px] h-[7px] rounded-full bg-brand flex-shrink-0" aria-hidden />
          {message}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
