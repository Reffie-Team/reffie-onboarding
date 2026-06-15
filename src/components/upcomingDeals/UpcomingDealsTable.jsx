import React from 'react';
import { useNavigate } from 'react-router-dom';
import { hasUnsupportedTech, UNSUPPORTED_TS } from '@/lib/stepsEngine';
import { DEAL_STAGE_LABELS } from '@/lib/constants';
import { fmtArr } from '@/lib/utils';

const COLS = [
  { key: 'companyName', label: 'Company Name', sortable: true  },
  { key: 'dealStage',   label: 'Deal Stage',   sortable: true  },
  { key: 'salesRep',    label: 'Sales Rep',    sortable: true  },
  { key: 'arr',         label: 'ARR',          sortable: true  },
  { key: 'closeDate',   label: 'Close Date',   sortable: true  },
  { key: 'tsIssues',    label: 'Tech Issues',  sortable: true  },
  { key: '_arrow',      label: '',             sortable: false },
];

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function countTsIssues(ts) {
  return [
    UNSUPPORTED_TS.pms.includes(ts.pms),
    UNSUPPORTED_TS.tour.includes(ts.tour),
    UNSUPPORTED_TS.applications.includes(ts.applications),
  ].filter(Boolean).length;
}

function compareDeals(a, b, sortKey) {
  switch (sortKey) {
    case 'companyName': return a.companyName.localeCompare(b.companyName);
    case 'dealStage': {
      const la = DEAL_STAGE_LABELS[a.dealStage] ?? a.dealStage;
      const lb = DEAL_STAGE_LABELS[b.dealStage] ?? b.dealStage;
      return la.localeCompare(lb);
    }
    case 'salesRep': {
      const ra = a.salesRep || 'zzz';
      const rb = b.salesRep || 'zzz';
      return ra.localeCompare(rb);
    }
    case 'arr':      return (a.arr ?? 0) - (b.arr ?? 0);
    case 'closeDate': return (a.closeDate ?? '').localeCompare(b.closeDate ?? '');
    case 'tsIssues': return countTsIssues(a.ts) - countTsIssues(b.ts);
    default:         return a.companyName.localeCompare(b.companyName);
  }
}

export default function UpcomingDealsTable({ deals, sortKey, sortDir, onSort }) {
  const navigate = useNavigate();

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <span className="opacity-50 ml-0.5">↕</span>;
    return <span className="opacity-70 ml-0.5">{sortDir === 1 ? '↑' : '↓'}</span>;
  };

  const sorted = [...deals].sort((a, b) => {
    if (sortKey === 'arr') {
      if (a.arr == null && b.arr == null) return 0;
      if (a.arr == null) return 1;
      if (b.arr == null) return -1;
    }
    if (sortKey === 'closeDate') {
      if (a.closeDate == null && b.closeDate == null) return 0;
      if (a.closeDate == null) return 1;
      if (b.closeDate == null) return -1;
    }
    return compareDeals(a, b, sortKey) * sortDir;
  });

  return (
    <div className="bg-surface border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {COLS.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort(col.key)}
                className={[
                  'px-[18px] py-[11px] text-left text-xs font-semibold',
                  'uppercase tracking-[0.5px] text-white whitespace-nowrap select-none',
                  col.key === '_arrow' ? 'w-7' : '',
                  col.sortable ? 'cursor-pointer' : '',
                  sortKey === col.key ? 'bg-brand-dark' : 'bg-brand',
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
              <td colSpan={COLS.length} className="text-center py-12 text-hint text-sm">
                No upcoming deals
              </td>
            </tr>
          ) : (
            sorted.map((deal) => {
              const issueFields = [];
              if (UNSUPPORTED_TS.pms.includes(deal.ts.pms))                  issueFields.push(`PMS: ${deal.ts.pms}`);
              if (UNSUPPORTED_TS.tour.includes(deal.ts.tour))                 issueFields.push(`Tour: ${deal.ts.tour}`);
              if (UNSUPPORTED_TS.applications.includes(deal.ts.applications)) issueFields.push(`Apps: ${deal.ts.applications}`);

              return (
                <tr
                  key={deal.id}
                  onClick={() => navigate(`/upcoming-deals/${deal.id}`)}
                  className="group border-b border-[rgba(0,0,0,0.08)] last:border-b-0
                    cursor-pointer transition-colors duration-[120ms] hover:bg-brand-tint"
                >
                  <td className="px-[18px] py-[14px] align-middle">
                    <div className="font-semibold text-base leading-snug">{deal.companyName}</div>
                  </td>

                  <td className="px-[18px] py-[14px] align-middle text-sm text-ink">
                    {DEAL_STAGE_LABELS[deal.dealStage] ?? deal.dealStage}
                  </td>

                  <td className="px-[18px] py-[14px] align-middle text-sm text-muted">
                    {deal.salesRep || '—'}
                  </td>

                  <td className="px-[18px] py-[14px] align-middle font-semibold text-base">
                    {deal.arr != null ? fmtArr(deal.arr) : '—'}
                  </td>

                  <td className="px-[18px] py-[14px] align-middle text-sm text-muted">
                    {fmtDate(deal.closeDate)}
                  </td>

                  <td className="px-[18px] py-[14px] align-middle">
                    {issueFields.length > 0 ? (
                      <span
                        className="text-xs text-red-600 font-medium"
                        title={issueFields.join(', ')}
                      >
                        {issueFields.length} issue{issueFields.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-hint">—</span>
                    )}
                  </td>

                  <td className="px-[18px] py-[14px] align-middle text-right">
                    <span className="text-brand text-base opacity-0 -translate-x-1
                      transition-all duration-150
                      group-hover:opacity-100 group-hover:translate-x-0">
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
