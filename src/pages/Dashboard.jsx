import React, { useState, useMemo, useEffect } from 'react';
import useAccountStore from '@/store/useAccountStore';
import { api } from '@/lib/api';
import useToast from '@/hooks/useToast';
import StatCards from '@/components/dashboard/StatCards';
import FilterRow from '@/components/dashboard/FilterRow';
import AccountsTable from '@/components/dashboard/AccountsTable';
import AddAccountModal from '@/modals/AddAccountModal';

export default function Dashboard() {
  const accounts      = useAccountStore((s) => s.accounts);
  const loading       = useAccountStore((s) => s.loading);
  const sortKey       = useAccountStore((s) => s.sortKey);
  const sortDir       = useAccountStore((s) => s.sortDir);
  const filters       = useAccountStore((s) => s.filters);
  const setSort       = useAccountStore((s) => s.setSort);
  const setFilter     = useAccountStore((s) => s.setFilter);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);

  const [modalOpen,    setModalOpen]    = useState(false);
  const [syncing,      setSyncing]      = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { showToast } = useToast();

  // Re-fetch when the show-archived toggle changes.
  useEffect(() => {
    fetchAccounts(showArchived);
  }, [showArchived]);

  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase();
    return accounts.filter((a) => {
      if (!showArchived && a.archived) return false;
      if (q && !a.name.toLowerCase().includes(q) && !a.location.toLowerCase().includes(q))
        return false;
      if (filters.stage && a.stage !== filters.stage) return false;
      if (filters.type  && a.type  !== filters.type)  return false;
      if (filters.rep   && a.rep   !== filters.rep)   return false;
      return true;
    });
  }, [accounts, filters, showArchived]);

  const handleSync = async () => {
    if (syncing) return;
    const dealId = window.prompt('Enter HubSpot deal ID:');
    if (!dealId || !dealId.trim()) return;
    setSyncing(true);
    try {
      await api.hubspot.sync(dealId.trim());
      showToast('Account synced from HubSpot');
      await fetchAccounts(showArchived);
    } catch (err) {
      showToast(err?.message || 'Sync failed — check the deal ID and try again');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <main className="max-w-[1240px] mx-auto px-7 py-[30px] max-[600px]:px-[14px] max-[600px]:py-[18px]">
      {/* Page header */}
      <div className="flex items-end justify-between mb-[26px]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-brand block mb-1">
            Customer success
          </span>
          <h1 className="text-[28px] font-bold tracking-[-0.5px] leading-[1.15]">
            <span className="text-brand">Track</span> your onboarding accounts
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="btn-secondary"
            onClick={handleSync}
            disabled={syncing}
            style={syncing ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          >
            {syncing ? 'Syncing…' : 'Sync from HubSpot'}
          </button>
          <button
            className="btn-primary"
            onClick={() => setModalOpen(true)}
          >
            + Add account
          </button>
        </div>
      </div>

      {loading && accounts.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-[3px] border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats always exclude archived accounts */}
          <StatCards accounts={accounts.filter((a) => !a.archived)} />
          <FilterRow
            accounts={accounts}
            filters={filters}
            onFilter={setFilter}
            filteredCount={filtered.length}
            showArchived={showArchived}
            onToggleArchived={() => setShowArchived((v) => !v)}
          />
          <AccountsTable
            accounts={filtered}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={setSort}
          />
        </>
      )}

      <AddAccountModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
