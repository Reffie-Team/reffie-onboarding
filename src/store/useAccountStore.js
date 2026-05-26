/**
 * useAccountStore.js — Zustand store, persisted to localStorage.
 *
 * Key: 'reffie-onboarding-v1'
 * All business logic lives in lib/ — the store only manages state transitions.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { SEED_ACCOUNTS } from '@/lib/seedData';
import { STAGES } from '@/lib/constants';
import { generateSteps, syncChecklist } from '@/lib/stepsEngine';
import { generateId } from '@/lib/utils';

const useAccountStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────────
      accounts: SEED_ACCOUNTS,
      sortKey: 'name',
      sortDir: 1,           // 1 = asc, -1 = desc
      filters: { query: '', stage: '', type: '', rep: '' },

      // ── Sorting ──────────────────────────────────────────────────────────────
      setSort: (key) =>
        set((s) => ({
          sortKey: key,
          sortDir: s.sortKey === key ? -s.sortDir : 1,
        })),

      // ── Filtering ────────────────────────────────────────────────────────────
      setFilter: (field, value) =>
        set((s) => ({ filters: { ...s.filters, [field]: value } })),

      clearFilters: () =>
        set({ filters: { query: '', stage: '', type: '', rep: '' } }),

      // ── Account CRUD ─────────────────────────────────────────────────────────

      /**
       * addAccount — create a new account, return its generated id.
       * Caller provides everything except `id` and `cl`.
       */
      addAccount: (draft) => {
        const steps = generateSteps(draft.ts);
        const cl = syncChecklist({}, steps);
        const account = { ...draft, id: generateId(), cl };
        set((s) => ({ accounts: [...s.accounts, account] }));
        return account.id;
      },

      // ── Tech-stack mutations ─────────────────────────────────────────────────

      /**
       * updateTechStack — change one ts field, re-derive + sync checklist.
       * Returns true if the tech stack actually changed (steps may differ).
       */
      updateTechStack: (id, field, value) => {
        let changed = false;
        set((s) => {
          const account = s.accounts.find((a) => a.id === id);
          if (!account) return {};

          const newTs = { ...account.ts, [field]: value };
          if (JSON.stringify(newTs) === JSON.stringify(account.ts)) return {};

          changed = true;
          const newSteps = generateSteps(newTs);
          const newCl = syncChecklist(account.cl, newSteps);

          return {
            accounts: s.accounts.map((a) =>
              a.id === id ? { ...a, ts: newTs, cl: newCl } : a
            ),
          };
        });
        return changed;
      },

      // ── Checklist mutations ──────────────────────────────────────────────────

      /**
       * toggleStep — flip a step done/undone. Auto-advances stage when all
       * steps in the current stage are complete. Auto-reverses to the earliest
       * stage with incomplete steps when a previously-completed step is unchecked.
       *
       * Returns:
       *   { advanced: true,  newStage: string }  — stage moved forward
       *   { advanced: false, completed: true }    — 60-day stage fully done
       *   { advanced: false, completed: false }   — normal toggle
       */
      toggleStep: (id, stepId) => {
        let result = { advanced: false, completed: false };

        set((s) => {
          const account = s.accounts.find((a) => a.id === id);
          if (!account) return {};

          const existing = account.cl[stepId] ?? { done: false, note: '' };
          const newCl = {
            ...account.cl,
            [stepId]: { ...existing, done: !existing.done },
          };

          let updated = { ...account, cl: newCl };

          // Check if all steps in the current stage are now done
          const steps = generateSteps(account.ts);
          const stageSteps = steps.filter((s) => s.stage === account.stage);
          const allCurrentDone =
            stageSteps.length > 0 &&
            stageSteps.every((s) => newCl[s.id]?.done);

          if (allCurrentDone) {
            const idx = STAGES.indexOf(account.stage);
            if (idx < STAGES.length - 1) {
              // Advance to next stage
              const newStage = STAGES[idx + 1];
              const synced = syncChecklist(newCl, steps);
              updated = { ...updated, stage: newStage, cl: synced };
              result = { advanced: true, newStage };
            } else {
              // Last stage (60-day) — onboarding complete
              result = { advanced: false, completed: true };
            }
          } else {
            // ── Backward reversal ─────────────────────────────────────────────
            // If a step was unchecked and a stage earlier than the current one
            // now has at least one incomplete step, reverse to the earliest such
            // stage. This ensures the stage always reflects the earliest
            // outstanding work.
            const currentIdx = STAGES.indexOf(account.stage);
            const earliestIncompleteIdx = STAGES.findIndex((stage, i) => {
              if (i >= currentIdx) return false; // only look before current stage
              const ss = steps.filter((s) => s.stage === stage);
              return ss.length > 0 && ss.some((s) => !newCl[s.id]?.done);
            });

            if (earliestIncompleteIdx !== -1) {
              updated = { ...updated, stage: STAGES[earliestIncompleteIdx] };
            }
          }

          return {
            accounts: s.accounts.map((a) => (a.id === id ? updated : a)),
          };
        });

        return result;
      },

      /**
       * saveNote — persist a note string on a checklist step.
       */
      saveNote: (id, stepId, note) =>
        set((s) => {
          const account = s.accounts.find((a) => a.id === id);
          if (!account) return {};
          const existing = account.cl[stepId] ?? { done: false, note: '' };
          return {
            accounts: s.accounts.map((a) =>
              a.id === id
                ? { ...a, cl: { ...a.cl, [stepId]: { ...existing, note } } }
                : a
            ),
          };
        }),
    }),

    // ── Persist config ───────────────────────────────────────────────────────
    {
      name: 'reffie-onboarding-v1',
      storage: createJSONStorage(() => localStorage),
      // currentId excluded — resets on load (URL is source of truth)
      partialize: (s) => ({
        accounts: s.accounts,
        sortKey: s.sortKey,
        sortDir: s.sortDir,
      }),
    }
  )
);

export default useAccountStore;
