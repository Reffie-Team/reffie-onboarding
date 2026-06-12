import React, { useEffect } from 'react';
import useUpcomingDealsStore from '@/store/useUpcomingDealsStore';
import UpcomingDealsTable from '@/components/upcomingDeals/UpcomingDealsTable';

const POLL_INTERVAL_MS = 60_000;

export default function UpcomingDeals() {
  const deals           = useUpcomingDealsStore((s) => s.deals);
  const loading         = useUpcomingDealsStore((s) => s.loading);
  const refreshAndFetch = useUpcomingDealsStore((s) => s.refreshAndFetch);
  const fetchDeals      = useUpcomingDealsStore((s) => s.fetchDeals);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshAndFetch();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshAndFetch]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') fetchDeals();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchDeals]);

  return (
    <main className="max-w-[1240px] mx-auto px-7 py-[30px] max-[600px]:px-[14px] max-[600px]:py-[18px]">
      <div className="mb-[26px]">
        <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-brand block mb-1">
          Sales pipeline
        </span>
        <h1 className="text-[28px] font-bold tracking-[-0.5px] leading-[1.15]">
          <span className="text-brand">Upcoming</span>{' '}
          <span className="text-ink">deals</span>
        </h1>
      </div>

      {loading && deals.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-[3px] border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <UpcomingDealsTable deals={deals} />
      )}
    </main>
  );
}
