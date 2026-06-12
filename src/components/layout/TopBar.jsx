import React, { useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-router-dom';
import useAccountStore from '@/store/useAccountStore';
import useAuthStore from '@/store/useAuthStore';
import useUpcomingDealsStore from '@/store/useUpcomingDealsStore';
import { hasUnsupportedTech } from '@/lib/stepsEngine';

export default function TopBar() {
  const match = useMatch('/accounts/:id');
  const accountId = match?.params?.id ?? null;
  const isTasksRoute       = !!useMatch('/tasks');
  const isDealsRoute       = !!useMatch('/upcoming-deals');
  const isDealsDetailRoute = !!useMatch('/upcoming-deals/:id');
  const onDealsSection     = isDealsRoute || isDealsDetailRoute;

  const badgeCount = useUpcomingDealsStore(
    (s) => s.deals.filter((d) => hasUnsupportedTech(d.ts)).length
  );

  const accounts = useAccountStore((s) => s.accounts);
  const account = accountId ? accounts.find((a) => a.id === accountId) : null;

  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  const [imgError, setImgError] = useState(false);

  const handleSignOut = () => {
    clearUser();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

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
            <span className={isTasksRoute ? 'text-muted' : 'text-ink font-semibold'}>
              {isTasksRoute ? (
                <Link to="/dashboard" className="text-muted hover:text-ink transition-colors cursor-pointer">
                  Onboarding
                </Link>
              ) : 'Onboarding'}
            </span>
          )}
        </nav>

        <span className="w-px h-[18px] bg-[rgba(0,0,0,0.08)]" aria-hidden />

        <Link
          to="/tasks"
          className={`text-sm transition-colors ${isTasksRoute ? 'text-ink font-semibold' : 'text-muted hover:text-ink'}`}
        >
          My tasks
        </Link>

        <span className="w-px h-[18px] bg-[rgba(0,0,0,0.08)]" aria-hidden />

        <Link
          to="/upcoming-deals"
          className={`text-sm transition-colors relative ${onDealsSection ? 'text-ink font-semibold' : 'text-muted hover:text-ink'}`}
        >
          Upcoming deals
          {badgeCount > 0 && (
            <span
              className="absolute -top-[6px] -right-[14px] min-w-[16px] h-4
                bg-red-600 text-white text-[10px] font-bold leading-none
                rounded-full flex items-center justify-center px-[4px]"
              aria-label={`${badgeCount} deal${badgeCount !== 1 ? 's' : ''} with unsupported tech`}
            >
              {badgeCount}
            </span>
          )}
        </Link>
      </div>

      {/* Right — avatar + sign out */}
      <div className="flex items-center gap-3">
        {user?.picture && !imgError ? (
          <img
            src={user.picture}
            alt={user.name ?? 'User'}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-[30px] h-[30px] rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-[30px] h-[30px] rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0"
            title={user?.name ?? ''}
          >
            {initials}
          </div>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className="text-[13px] text-muted bg-transparent border-none cursor-pointer hover:text-ink transition-colors p-0"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
