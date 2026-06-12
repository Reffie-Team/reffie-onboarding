import React from 'react';
import { useNavigate } from 'react-router-dom';
import { hasUnsupportedTech, UNSUPPORTED_TS } from '@/lib/stepsEngine';
import { DEAL_STAGE_LABELS } from '@/lib/constants';
import { fmtArr } from '@/lib/utils';

const COLS = [
  { key: 'companyName', label: 'Company Name' },
  { key: 'dealStage',   label: 'Deal Stage'   },
  { key: 'salesRep',    label: 'Sales Rep'    },
  { key: 'arr',         label: 'ARR'          },
  { key: 'closeDate',   label: 'Close Date'   },
  { key: 'tsIssues',    label: 'Tech Issues'  },
  { key: '_arrow',      label: ''             },
];

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function UpcomingDealsTable({ deals }) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-brand">
            {COLS.map((col) => (
              <th
                key={col.key}
                className={[
                  'px-[18px] py-[11px] text-left text-xs font-semibold',
                  'uppercase tracking-[0.5px] text-white whitespace-nowrap select-none',
                  col.key === '_arrow' ? 'w-7' : '',
                ].join(' ')}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {deals.length === 0 ? (
            <tr>
              <td colSpan={COLS.length} className="text-center py-12 text-hint text-sm">
                No upcoming deals
              </td>
            </tr>
          ) : (
            deals.map((deal) => {
              const hasIssues = hasUnsupportedTech(deal.ts);
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
                    {hasIssues ? (
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
