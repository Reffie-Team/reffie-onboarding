// ─── Onboarding Stages ──────────────────────────────────────────────────────

export const STAGES = [
  'Pre-kick off',
  'Kick-off call',
  'Validation call',
  'Training call',
  'Check-in (1 week post training)',
  'Check-in (3 weeks post training)',
  '30-day check-in',
  '60-day check-in',
];

export const STAGE_SHORT = [
  'Pre-KO',
  'Kick-off',
  'Validation',
  'Training',
  '1-wk',
  '3-wk',
  '30-day',
  '60-day ✓',
];

// ─── Tech-stack option lists ─────────────────────────────────────────────────

export const PMS_OPTIONS = [
  'Yardi',
  'AppFolio',
  'RentManager',
  'Entrata',
  'Buildium',
  'Rentvine',
  'RealPage',
  'Resman',
  'Other',
];

export const TOUR_OPTIONS = [
  'None',
  'Showmojo',
  'TenantTurner',
  'Rently',
  'Calendly',
  'Showdigs',
  'Showing Hero',
];

export const APPLICATIONS_OPTIONS = [
  'None',
  'PMS system',
  'Findigs',
  'Boomscreen',
  'Other',
];

export const ZILLOW_OPTIONS = ['None', 'Paid', 'Free'];

// ─── Dashboard table columns ─────────────────────────────────────────────────

export const TABLE_COLS = [
  { key: 'name',     label: 'Customer',   sortable: true  },
  { key: 'stage',    label: 'Stage',      sortable: true  },
  { key: 'progress', label: 'Progress',   sortable: true  },
  { key: 'arr',      label: 'ARR',        sortable: true  },
  { key: 'type',     label: 'Type',       sortable: true  },
  { key: 'rep',      label: 'CS rep',     sortable: true  },
  { key: '_arrow',   label: '',           sortable: false },
];
