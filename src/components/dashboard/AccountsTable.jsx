import React from 'react';
import { useNavigate } from 'react-router-dom';

import { STAGES } from '@/lib/constants';
import { getProgress } from '@/lib/stepsEngine';
import { fmtArr, stageBadgeVariant } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

const COLS = [
  { key: 'name',     label: 'Customer',  sortable: true  },
  { key: 'stage',    label: 'Stage',     sortable: true  },
  { key: 'progress', label: 'Progress',  sortable: true  },
  { key: 'arr',      label: 'ARR',       sortable: true  },
  { key: 'type',     label: 'Type',      sortable: true  },
  { key: 'rep',      label: 'CS rep',    sortable: true  },
  { key: '_arrow',   label: '',          sortable: false },
];

function compare(a, b, sortKey) {
  switch (sortKey) {
    case 'name':     return a.name.localeCompare(b.name);
    case 'stage':    return STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage);
    case 'arr':      return a.arr - b.arr;
    case 'type':     return a.type.localeCompare(b.type);
    case 'rep':      return a.rep.localeCompare(b.rep);
    case 'progress': return getProgress(a).pct - getProgress(b).pct;
    default:         return a.name.localeCompare(b.name);
  }
}

/**
 * AccountsTable — sortable table.
 * Green thead, hover-reveal arrow, progress bar column.
 * Matches prototype's table exactly.
 */
export default function AccountsTable({ accounts, sortKey, sortDir, onSort }) {
  const navigate = useNavigate();

  const sorted = [...accounts].sort((a, b) => compare(a, b, sortKey) * sortDir);

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <span className="opacity-50 ml-0.5">↕</span>;
    return <span className="opacity-70 ml-0.5">{sortDir === 1 ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-surface border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-brand">
            {COLS.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort(col.key)}
                className={[
                  'px-[18px] py-[11px] text-left text-xs font-semibold',
                  'uppercase tracking-[0.5px] text-white whitespace-nowrap',
                  'select-none transition-colors duration-150',
                  col.sortable ? 'cursor-pointer hover:bg-brand-dark' : '',
                  sortKey === col.key ? 'bg-brand-dark' : '',
                  col.key === '_arrow' ? 'w-7' : '',
                ].join(' ')}
              >
                {col.label}
                <SortIcon col={col} />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-hint text-sm">
                No accounts match your filters
              </td>
            </tr>
          ) : (
            sorted.map((acc) => {
              const p = getProgress(acc);
              return (
                <tr
                  key={acc.id}
                  onClick={() => navigate(`/accounts/${acc.id}`)}
                  className="group border-b border-[rgba(0,0,0,0.08)] last:border-b-0
                    cursor-pointer transition-colors duration-[120ms]
                    hover:bg-brand-tint"
                >
                  {/* Customer */}
                  <td className="px-[18px] py-[14px] align-middle">
                    <div className="font-semibold text-base leading-snug">{acc.name}</div>
                    <div className="text-xs text-muted mt-px">{acc.location}</div>
                  </td>

                  {/* Stage */}
                  <td className="px-[18px] py-[14px] align-middle">
                    <Badge variant={stageBadgeVariant(acc.stage)}>{acc.stage}</Badge>
                  </td>

                  {/* Progress */}
                  <td className="px-[18px] py-[14px] align-middle">
                    <ProgressBar done={p.done} total={p.total} pct={p.pct} />
                  </td>

                  {/* ARR */}
                  <td className="px-[18px] py-[14px] align-middle font-semibold text-base">
                    {fmtArr(acc.arr)}
                  </td>

                  {/* Type */}
                  <td className="px-[18px] py-[14px] align-middle">
                    <Badge variant="gray">{acc.type}</Badge>
                  </td>

                  {/* Rep */}
                  <td className="px-[18px] py-[14px] align-middle text-muted text-sm">
                    {acc.rep}
                  </td>

                  {/* Arrow — hidden until hover via group */}
                  <td className="px-[18px] py-[14px] align-middle text-right">
                    <span
                      className="text-brand text-base
                        opacity-0 -translate-x-1
                        transition-all duration-150
                        group-hover:opacity-100 group-hover:translate-x-0"
                    >
                      ›
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
