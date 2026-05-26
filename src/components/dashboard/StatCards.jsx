import React from 'react';
import { fmtArr } from '@/lib/utils';

/**
 * StatCards — 4-tile summary grid at the top of the dashboard.
 * Matches prototype's .stats-grid exactly.
 */
export default function StatCards({ accounts }) {
  const totalArr = accounts.reduce((s, a) => s + a.arr, 0);
  const active = accounts.filter((a) => a.stage !== '60-day check-in').length;
  const reps = new Set(accounts.map((a) => a.rep)).size;

  const tiles = [
    {
      label: 'Accounts in onboarding',
      value: accounts.length,
      sub: `${active} active`,
      green: false,
    },
    {
      label: 'Total ARR in onboarding',
      value: fmtArr(totalArr),
      sub: `across ${accounts.length} accounts`,
      green: true,
    },
    {
      label: 'Active (not complete)',
      value: active,
      sub: `${accounts.length - active} at 60-day`,
      green: false,
    },
    {
      label: 'CS reps assigned',
      value: reps,
      sub: 'across all accounts',
      green: false,
    },
  ];

  return (
    <div className="stats-grid">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="bg-surface border border-[rgba(0,0,0,0.08)] rounded-md px-5 py-[18px] transition-colors hover:bg-[#FDFCFA]"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.8px] text-hint mb-[7px]">
            {t.label}
          </div>
          <div
            className={`text-[28px] font-bold tracking-[-0.8px] leading-none ${
              t.green ? 'text-brand' : 'text-ink'
            }`}
          >
            {t.value}
          </div>
          <div className="text-xs text-hint mt-1">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}
