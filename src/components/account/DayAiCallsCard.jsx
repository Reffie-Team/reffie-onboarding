import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtDate } from '@/lib/utils';

export default function DayAiCallsCard({ accountId }) {
  const [calls, setCalls]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.dayAiCalls.list(accountId)
      .then((data) => {
        if (!cancelled) {
          setCalls(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [accountId]);

  return (
    <div className="card mt-5">
      <div className="mb-[14px]">
        <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-brand">
          Day AI calls
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-[3px] border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-muted">Day AI unavailable.</p>
      )}

      {!loading && !error && calls.length === 0 && (
        <p className="text-sm text-muted">No calls found.</p>
      )}

      {!loading && !error && calls.length > 0 && (
        <div>
          {calls.map((call, i) => (
            <div
              key={call.objectId}
              className={[
                'py-3',
                i === 0 ? 'pt-0' : '',
                i === calls.length - 1 ? 'pb-0' : 'border-b border-[rgba(0,0,0,0.08)]',
              ].filter(Boolean).join(' ')}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm font-semibold text-ink">
                  {call.callUrl ? (
                    <a
                      href={call.callUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline"
                    >
                      {call.title ?? 'Untitled call'}
                    </a>
                  ) : (
                    call.title ?? 'Untitled call'
                  )}
                </span>
                <span className="text-xs text-muted flex-shrink-0">
                  {fmtDate(call.startedAt)}
                </span>
              </div>

              {call.summary && (
                <p className="text-sm text-muted leading-relaxed">{call.summary}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
