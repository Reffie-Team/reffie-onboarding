import React from 'react';
import { fmtArr, stageBadgeVariant } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

function InfoRow({ label, children, column = false }) {
  return (
    <div
      className={`flex border-b border-[rgba(0,0,0,0.08)] last:border-b-0 gap-3
        ${column ? 'flex-col py-2 pb-0' : 'justify-between items-baseline py-2'}`}
    >
      <span className="text-xs font-medium text-muted flex-shrink-0">{label}</span>
      <span className="text-sm text-ink">{children}</span>
    </div>
  );
}

/**
 * InfoCard — read-only account meta card.
 * Matches prototype's info card with .ir rows.
 */
export default function InfoCard({ account }) {
  return (
    <div className="bg-surface border border-[rgba(0,0,0,0.08)] rounded-md p-[20px_22px] mb-3.5">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-brand">
          Customer info
        </span>
        <Badge variant="gray" className="text-[10px] py-0.5 px-[7px]">
          Read-only
        </Badge>
      </div>

      <InfoRow label="ARR">
        <span className="font-bold text-[15px] text-brand">{fmtArr(account.arr)}</span>
      </InfoRow>
      <InfoRow label="Contract">{account.months} months</InfoRow>
      <InfoRow label="Property type">{account.type}</InfoRow>
      <InfoRow label="Location">{account.location}</InfoRow>
      <InfoRow label="Stage">
        <Badge variant={stageBadgeVariant(account.stage)} className="text-[11px]">
          {account.stage}
        </Badge>
      </InfoRow>
      <InfoRow label="Success metrics" column>
        <span className="text-xs text-muted italic leading-[1.55]">{account.metrics}</span>
      </InfoRow>
    </div>
  );
}
