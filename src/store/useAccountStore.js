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
        const account = { ...draft, id: generateId(), cl, skippedStages: [], pocs: draft.pocs ?? [] };
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

          const existing = account.cl[stepId] ?? { done: false, note: '', first_touched_at: null, completed_at: null };
          const nowIso = new Date().toISOString();
          const becomingDone = !existing.done;
          const updatedStep = becomingDone
            ? {
                ...existing,
                done: true,
                first_touched_at: existing.first_touched_at ?? nowIso,
                completed_at: nowIso,
              }
            : {
                ...existing,
                done: false,
                completed_at: null,
              };
          const newCl = {
            ...account.cl,
            [stepId]: updatedStep,
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
            const skipped = account.skippedStages ?? [];
            let nextIdx = idx + 1;
            while (nextIdx < STAGES.length && skipped.includes(STAGES[nextIdx])) {
              nextIdx++;
            }
            if (nextIdx < STAGES.length) {
              // Advance to next non-skipped stage
              const newStage = STAGES[nextIdx];
              const synced = syncChecklist(newCl, steps);
              updated = { ...updated, stage: newStage, cl: synced };
              result = { advanced: true, newStage };
            } else {
              // Last stage (or all remaining are skipped) — onboarding complete
              result = { advanced: false, completed: true };
            }
          } else {
            // ── Backward reversal ─────────────────────────────────────────────
            // If a step was unchecked and a stage earlier than the current one
            // now has at least one incomplete step, reverse to the earliest such
            // stage. Skipped stages are ignored.
            const currentIdx = STAGES.indexOf(account.stage);
            const skippedBack = account.skippedStages ?? [];
            const earliestIncompleteIdx = STAGES.findIndex((stage, i) => {
              if (i >= currentIdx) return false; // only look before current stage
              if (skippedBack.includes(stage)) return false;
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

      /**
       * toggleSkipStage — mark/unmark a stage as not required for this account.
       * When skipping the current stage, auto-advances to the next non-skipped stage.
       * Skipped stages are ignored during auto-advance and backward reversal.
       */
      toggleSkipStage: (id, stageName) =>
        set((s) => {
          const account = s.accounts.find((a) => a.id === id);
          if (!account) return {};

          const skipped = account.skippedStages ?? [];
          const isCurrentlySkipped = skipped.includes(stageName);
          const newSkipped = isCurrentlySkipped
            ? skipped.filter((st) => st !== stageName)
            : [...skipped, stageName];

          let newStage = account.stage;
          if (!isCurrentlySkipped && account.stage === stageName) {
            const idx = STAGES.indexOf(stageName);
            let nextIdx = idx + 1;
            while (nextIdx < STAGES.length && newSkipped.includes(STAGES[nextIdx])) {
              nextIdx++;
            }
            if (nextIdx < STAGES.length) newStage = STAGES[nextIdx];
          }

          return {
            accounts: s.accounts.map((a) =>
              a.id === id
                ? { ...a, skippedStages: newSkipped, stage: newStage }
                : a
            ),
          };
        }),

      // ── POC mutations ────────────────────────────────────────────────────────

      addPoc: (accountId) =>
        set((s) => {
          const account = s.accounts.find((a) => a.id === accountId);
          if (!account) return {};
          const newPoc = { id: generateId(), name: '', role: '', inviteSent: false };
          return {
            accounts: s.accounts.map((a) =>
              a.id === accountId
                ? { ...a, pocs: [...(a.pocs ?? []), newPoc] }
                : a
            ),
          };
        }),

      updatePoc: (accountId, pocId, field, value) =>
        set((s) => {
          const account = s.accounts.find((a) => a.id === accountId);
          if (!account) return {};
          return {
            accounts: s.accounts.map((a) =>
              a.id === accountId
                ? {
                    ...a,
                    pocs: (a.pocs ?? []).map((p) =>
                      p.id === pocId ? { ...p, [field]: value } : p
                    ),
                  }
                : a
            ),
          };
        }),

      removePoc: (accountId, pocId) =>
        set((s) => {
          const account = s.accounts.find((a) => a.id === accountId);
          if (!account) return {};
          return {
            accounts: s.accounts.map((a) =>
              a.id === accountId
                ? { ...a, pocs: (a.pocs ?? []).filter((p) => p.id !== pocId) }
                : a
            ),
          };
        }),
    }),

    // ── Persist config ───────────────────────────────────────────────────────
    {
      name: 'reffie-onboarding-v2',
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
