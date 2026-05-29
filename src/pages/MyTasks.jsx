import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAccountStore from '@/store/useAccountStore';
import useAuthStore from '@/store/useAuthStore';
import { generateSteps } from '@/lib/stepsEngine';
import { STAGES } from '@/lib/constants';
import { stageBadgeVariant } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

function timeAgo(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function MyTasks() {
  const navigate = useNavigate();
  const accounts = useAccountStore((s) => s.accounts);
  const user = useAuthStore((s) => s.user);

  const [scope, setScope] = useState('my');
  const [sort, setSort] = useState('open_longest');

  const rows = useMemo(() => {
    const scopedAccounts =
      scope === 'my'
        ? accounts.filter(
            (a) => a.rep.toLowerCase() === (user?.name ?? '').toLowerCase()
          )
        : accounts;

    const result = [];
    scopedAccounts.forEach((account) => {
      const steps = generateSteps(account.ts);
      steps
        .filter((s) => s.stage === account.stage)
        .forEach((step) => {
          const state = account.cl[step.id] ?? {};
          if (!state.done) {
            result.push({
              key: `${account.id}-${step.id}`,
              stepText: step.text,
              accountId: account.id,
              accountName: account.name,
              stage: account.stage,
              first_touched_at: state.first_touched_at ?? null,
            });
          }
        });
    });

    result.sort((a, b) => {
      if (sort === 'open_longest') {
        if (a.first_touched_at === null && b.first_touched_at === null) return 0;
        if (a.first_touched_at === null) return 1;
        if (b.first_touched_at === null) return -1;
        return new Date(a.first_touched_at) - new Date(b.first_touched_at);
      }
      if (sort === 'account') return a.accountName.localeCompare(b.accountName);
      if (sort === 'stage') return STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage);
      return 0;
    });

    return result;
  }, [accounts, scope, sort, user]);

  return (
    <main className="max-w-[1240px] mx-auto px-7 py-[30px] max-[600px]:px-[14px] max-[600px]:py-[18px]">
      {/* Page header */}
      <div className="mb-[26px]">
        <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-brand block mb-1">
          Customer success
        </span>
        <h1 className="text-[28px] font-bold tracking-[-0.5px] leading-[1.15]">
          <span className="text-brand">My</span>{' '}
          <span className="text-ink">tasks</span>
        </h1>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Scope pill toggle */}
        <div className="inline-flex rounded-pill border border-[rgba(0,0,0,0.14)] overflow-hidden">
          <button
            type="button"
            onClick={() => setScope('my')}
            className={`px-[14px] py-[5px] text-sm font-medium transition-colors ${
              scope === 'my' ? 'bg-brand text-white' : 'bg-white text-muted hover:text-ink'
            }`}
          >
            My accounts
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            className={`px-[14px] py-[5px] text-sm font-medium transition-colors border-l border-[rgba(0,0,0,0.14)] ${
              scope === 'all' ? 'bg-brand text-white' : 'bg-white text-muted hover:text-ink'
            }`}
          >
            All accounts
          </button>
        </div>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-[34px] px-[10px] border border-[rgba(0,0,0,0.14)] rounded-sm
            bg-white font-[family:inherit] text-sm font-medium text-ink outline-none cursor-pointer
            hover:border-[rgba(0,0,0,0.25)] focus:border-brand focus:shadow-focus transition-all"
        >
          <option value="open_longest">Open longest</option>
          <option value="account">By account (A–Z)</option>
          <option value="stage">By stage</option>
        </select>

        {/* Task count */}
        <span className="ml-auto text-xs font-medium text-hint bg-white border border-[rgba(0,0,0,0.08)] rounded-pill px-[10px] py-[3px] whitespace-nowrap">
          {rows.length} open {rows.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Empty state */}
      {rows.length === 0 ? (
        <div className="text-center py-16 text-hint text-sm">
          No open tasks — all caught up!
        </div>
      ) : (
        <div className="bg-surface border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-brand">
                {['Step', 'Account', 'Stage', 'Open since'].map((col) => (
                  <th
                    key={col}
                    className="px-[18px] py-[11px] text-left text-xs font-semibold uppercase tracking-[0.5px] text-white whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isPlaceholder =
                  row.stepText.startsWith('[') && row.stepText.endsWith(']');
                return (
                  <tr
                    key={row.key}
                    onClick={() => navigate(`/accounts/${row.accountId}`)}
                    className="group border-b border-[rgba(0,0,0,0.08)] last:border-b-0 cursor-pointer transition-colors duration-[120ms] hover:bg-brand-tint"
                  >
                    {/* Step */}
                    <td className="px-[18px] py-[13px] align-middle max-w-[400px]">
                      <span
                        className={`text-sm leading-snug ${
                          isPlaceholder ? 'italic text-hint' : 'text-ink'
                        }`}
                      >
                        {row.stepText}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="px-[18px] py-[13px] align-middle whitespace-nowrap">
                      <Link
                        to={`/accounts/${row.accountId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-sm text-ink hover:text-brand transition-colors"
                      >
                        {row.accountName}
                      </Link>
                    </td>

                    {/* Stage */}
                    <td className="px-[18px] py-[13px] align-middle whitespace-nowrap">
                      <Badge variant={stageBadgeVariant(row.stage)}>{row.stage}</Badge>
                    </td>

                    {/* Open since */}
                    <td className="px-[18px] py-[13px] align-middle whitespace-nowrap text-sm text-muted">
                      {timeAgo(row.first_touched_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
