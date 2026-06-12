import { create } from 'zustand';
import { api } from '@/lib/api';

const useUpcomingDealsStore = create((set, get) => ({
  deals:   [],
  loading: false,
  error:   null,

  clearError: () => set({ error: null }),

  fetchDeals: async () => {
    set({ loading: true, error: null });
    try {
      const deals = await api.upcomingDeals.list();
      set({ deals, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message ?? 'Failed to load upcoming deals.' });
    }
  },

  refreshAndFetch: async () => {
    api.upcomingDeals.refresh();
    return get().fetchDeals();
  },

  fetchDeal: async (id) => {
    try {
      const deal = await api.upcomingDeals.get(id);
      set((s) => ({
        deals: s.deals.some((d) => d.id === id)
          ? s.deals.map((d) => (d.id === id ? deal : d))
          : [...s.deals, deal],
      }));
    } catch (err) {
      set({ error: err.message ?? 'Failed to load deal.' });
    }
  },
}));

export default useUpcomingDealsStore;
