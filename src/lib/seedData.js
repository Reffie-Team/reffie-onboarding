/**
 * seedData.js
 *
 * Initial demo accounts — mirrors the prototype's hard-coded dataset.
 * The Zustand store seeds itself from this on first load (when localStorage
 * is empty).  All checklist state is derived from generateSteps + seedChecklist.
 */

import { STAGES } from './constants';
import { generateSteps, syncChecklist } from './stepsEngine';

/**
 * Seed the checklist for a given account:
 * - Steps whose stage comes BEFORE the current stage → done: true
 * - Steps in the current stage → done: false (unless overridden)
 * - Future stages → not yet created (syncChecklist handles defaults)
 */
const SEED_PAST_TS = new Date('2026-05-01').toISOString();

function seedChecklist(account) {
  const steps = generateSteps(account.ts);
  const stageIdx = STAGES.indexOf(account.stage);
  const cl = {};

  steps.forEach((s) => {
    const sIdx = STAGES.indexOf(s.stage);
    const isDone = sIdx < stageIdx;
    cl[s.id] = {
      done: isDone,
      note: '',
      first_touched_at: isDone ? SEED_PAST_TS : null,
      completed_at: isDone ? SEED_PAST_TS : null,
    };
  });

  return cl;
}

const RAW_ACCOUNTS = [
  {
    id: 'acc-1',
    name: 'Maple Property Group',
    location: 'Austin, TX',
    type: 'SFR',
    arr: 24000,
    months: 12,
    metrics: 'Reduce lead response time; increase contact rate from 40% to 65%',
    rep: 'Angelina LaPerla',
    stage: 'Kick-off call',
    ts: {
      pms: 'AppFolio',
      tour: 'Showmojo',
      lockboxes: true,
      applications: 'Findigs',
      zillow: 'Paid',
      facebook: true,
      sharedEmail: true,
      sharedEmailAddr: 'leasing@mapleproperties.com',
      sharedEmailAddrs: [],
      other: '',
    },
  },
  {
    id: 'acc-2',
    name: 'Verdant Realty Partners',
    location: 'Denver, CO',
    type: 'Multifamily',
    arr: 41500,
    months: 24,
    metrics: 'Automate 60% of initial lead responses; reduce vacancy days by 15%',
    rep: 'Angelina LaPerla',
    stage: 'Training call',
    ts: {
      pms: 'Yardi',
      tour: 'TenantTurner',
      lockboxes: false,
      applications: 'Boomscreen',
      zillow: 'Free',
      facebook: false,
      sharedEmail: false,
      sharedEmailAddr: '',
      sharedEmailAddrs: [],
      other: 'Rent Café',
    },
  },
  {
    id: 'acc-3',
    name: 'Clearview Homes LLC',
    location: 'Phoenix, AZ',
    type: 'SFR',
    arr: 18000,
    months: 12,
    metrics: 'Improve lead-to-showing conversion from 22% to 40%',
    rep: 'Angelina LaPerla',
    stage: 'Pre-kick off',
    ts: {
      pms: 'Buildium',
      tour: 'Rently',
      lockboxes: true,
      applications: 'PMS system',
      zillow: 'Paid',
      facebook: true,
      sharedEmail: false,
      sharedEmailAddr: '',
      sharedEmailAddrs: [],
      other: '',
    },
  },
  {
    id: 'acc-4',
    name: 'Sunrise Urban Living',
    location: 'Nashville, TN',
    type: 'Multifamily',
    arr: 62000,
    months: 24,
    metrics: 'Centralize 8 properties into one leasing workflow; hit 80% contact rate',
    rep: 'Angelina LaPerla',
    stage: 'Check-in (1 week post training)',
    ts: {
      pms: 'Entrata',
      tour: 'Showdigs',
      lockboxes: false,
      applications: 'Findigs',
      zillow: 'None',
      facebook: true,
      sharedEmail: true,
      sharedEmailAddr: 'leasing@sunriseurban.com',
      sharedEmailAddrs: [],
      other: 'Knock CRM',
    },
  },
];

// Attach seeded checklist state to every account
export const SEED_ACCOUNTS = RAW_ACCOUNTS.map((acc) => {
  const cl = seedChecklist(acc);
  return { ...acc, cl, skippedStages: [], pocs: [] };
});

// Special override for acc-1: partial kick-off progress (mirrors prototype)
const acc1 = SEED_ACCOUNTS.find((a) => a.id === 'acc-1');
if (acc1) {
  const steps = generateSteps(acc1.ts);
  const koSteps = steps.filter((s) => s.stage === 'Kick-off call');
  koSteps.forEach((s, i) => {
    const isDone = i < 4;
    acc1.cl[s.id] = {
      done: isDone,
      note: '',
      first_touched_at: isDone ? SEED_PAST_TS : null,
      completed_at: isDone ? SEED_PAST_TS : null,
    };
  });
}
