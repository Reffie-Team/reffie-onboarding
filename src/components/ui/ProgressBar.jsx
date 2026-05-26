import React from 'react';

/**
 * ProgressBar — horizontal bar + "done/total" label.
 * Matches prototype's .pw / .pb / .pf / .pl layout.
 *
 * @param {number} done   - steps completed
 * @param {number} total  - total steps
 * @param {number} pct    - 0–1 fraction (computed externally so no re-derive here)
 */
export default function ProgressBar({ done, total, pct }) {
  const allDone = done === total && total > 0;
  return (
    <div className="flex items-center gap-[9px]">
      <div className="flex-1 h-[5px] bg-[#EAE7E2] rounded-full min-w-[70px]">
        <div
          className={`h-full rounded-full ${allDone ? 'bg-brand-dark' : 'bg-brand'}`}
          style={{
            width: `${pct * 100}%`,
            transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </div>
      <span className="text-xs font-medium text-muted min-w-[30px]">
        {done}/{total}
      </span>
    </div>
  );
}
