import { STAGES } from './constants';
import { getProgress } from './stepsEngine';

// ─── Formatters ───────────────────────────────────────────────────────────────

/** Format a dollar amount. e.g. 24000 → "$24,000" */
export function fmtArr(n) {
  return '$' + Number(n).toLocaleString();
}

/** Format a percentage 0–1 as "42%" */
export function fmtPct(pct) {
  return Math.round(pct * 100) + '%';
}

// ─── Stage helpers ────────────────────────────────────────────────────────────

/**
 * Returns the Tailwind badge variant for a stage.
 * Matches the prototype's stageBadge() colour logic.
 *
 * Variants: 'green' | 'blue' | 'amber' | 'gray'
 */
export function stageBadgeVariant(stage) {
  const i = STAGES.indexOf(stage);
  if (i === 0) return 'gray';   // Pre-kick off
  if (i <= 2)  return 'blue';   // Kick-off, Validation
  if (i <= 5)  return 'amber';  // Training, 1-wk, 3-wk
  return 'green';               // 30-day, 60-day
}

// ─── ID generation ────────────────────────────────────────────────────────────

/** Generate a unique account ID. */
export function generateId() {
  return 'acc-' + Math.random().toString(36).slice(2, 9);
}

// ─── Comparison helpers for sorting ──────────────────────────────────────────

/**
 * Sort comparator factory.
 * Returns -1 | 0 | 1 for two accounts given a sort key and direction.
 */
export function makeAccountComparator(sortKey, sortDir) {
  return (a, b) => {
    let va, vb;
    switch (sortKey) {
      case 'name':     va = a.name; vb = b.name; break;
      case 'stage':    va = STAGES.indexOf(a.stage); vb = STAGES.indexOf(b.stage); break;
      case 'arr':      va = a.arr; vb = b.arr; break;
      case 'type':     va = a.type; vb = b.type; break;
      case 'rep':      va = a.rep; vb = b.rep; break;
      case 'progress': {
        va = getProgress(a).pct;
        vb = getProgress(b).pct;
        break;
      }
      default:         va = a.name; vb = b.name;
    }
    if (va < vb) return -sortDir;
    if (va > vb) return sortDir;
    return 0;
  };
}
