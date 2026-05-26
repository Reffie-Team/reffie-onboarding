import React from 'react';
import { Link, useMatch } from 'react-router-dom';
import useAccountStore from '@/store/useAccountStore';

/**
 * TopBar — sticky header.
 * Breadcrumb: "Onboarding" on dashboard, "Onboarding › Account Name" on detail.
 */
export default function TopBar() {
  // useMatch works anywhere inside <BrowserRouter>, no route context needed
  const match = useMatch('/accounts/:id');
  const accountId = match?.params?.id ?? null;

  const accounts = useAccountStore((s) => s.accounts);
  const account = accountId ? accounts.find((a) => a.id === accountId) : null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[rgba(0,0,0,0.08)] h-14 px-7 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-[17px] font-extrabold tracking-[-0.3px] text-brand no-underline leading-none"
        >
          REFFIE
        </Link>

        <span className="w-px h-[18px] bg-[rgba(0,0,0,0.08)]" aria-hidden />

        <nav className="flex items-center gap-[5px] text-sm" aria-label="Breadcrumb">
          {account ? (
            <>
              <Link
                to="/dashboard"
                className="text-muted hover:text-ink transition-colors cursor-pointer"
              >
                Onboarding
              </Link>
              <span className="text-hint" aria-hidden>›</span>
              <span className="text-ink font-semibold">{account.name}</span>
            </>
          ) : (
            <span className="text-ink font-semibold">Onboarding</span>
          )}
        </nav>
      </div>

      {/* Right — avatar (static Phase 1) */}
      <div
        className="w-[30px] h-[30px] rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0"
        title="Jamie Torres"
      >
        JT
      </div>
    </header>
  );
}
