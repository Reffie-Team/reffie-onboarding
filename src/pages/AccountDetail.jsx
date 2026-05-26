import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

import useAccountStore from '@/store/useAccountStore';
import { generateSteps } from '@/lib/stepsEngine';
import { fmtArr } from '@/lib/utils';
import { useToast } from '@/components/layout/Toast';

import StageStepper from '@/components/account/StageStepper';
import InfoCard from '@/components/account/InfoCard';
import TechStackForm from '@/components/account/TechStackForm';
import Checklist from '@/components/account/Checklist';

/**
 * AccountDetail — route: /accounts/:id
 *
 * Mirrors the prototype's detail page exactly:
 *  - Back button → /dashboard
 *  - Account name + meta (location, rep, type, step count)
 *  - StageStepper
 *  - 2-column grid: left (InfoCard + TechStackForm) | right (Checklist)
 *  - Stage auto-advance with toast
 *  - Onboarding complete toast on 60-day finish
 */
export default function AccountDetail() {
  const { id } = useParams();
  const { showToast } = useToast();

  // Subscribe to the specific account (re-renders on any account mutation)
  const account = useAccountStore((s) => s.accounts.find((a) => a.id === id) ?? null);
  const toggleStep = useAccountStore((s) => s.toggleStep);
  const saveNote   = useAccountStore((s) => s.saveNote);

  // Track the most-recently unlocked stage so Checklist can force it open
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);

  const handleToggleStep = useCallback(
    (stepId) => {
      const result = toggleStep(id, stepId);
      if (result?.advanced) {
        setNewlyUnlocked(result.newStage);
        showToast(`Stage advanced → ${result.newStage}`);
        // Clear after Checklist has consumed it
        setTimeout(() => setNewlyUnlocked(null), 100);
      } else if (result?.completed) {
        showToast('Onboarding complete! 🎉');
      }
    },
    [id, toggleStep, showToast]
  );

  const handleSaveNote = useCallback(
    (stepId, note) => saveNote(id, stepId, note),
    [id, saveNote]
  );

  if (!account) {
    return (
      <main className="max-w-[1240px] mx-auto px-7 py-8">
        <Link to="/dashboard" className="btn-secondary inline-flex mb-5">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to dashboard
        </Link>
        <p className="text-muted text-sm">Account not found.</p>
      </main>
    );
  }

  const allSteps  = generateSteps(account.ts);
  const totalDone = allSteps.filter((s) => account.cl[s.id]?.done).length;

  return (
    <main className="max-w-[1240px] mx-auto px-7 py-[30px] max-[600px]:px-[14px] max-[600px]:py-[18px]">
      {/* Back button */}
      <Link to="/dashboard" className="btn-secondary inline-flex mb-[18px]">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </Link>

      {/* Account header */}
      <div className="mb-5">
        <h1 className="text-[28px] font-bold tracking-[-0.6px] leading-tight">{account.name}</h1>
        <div className="flex items-center gap-2 flex-wrap mt-[5px] text-sm text-muted">
          <span>{account.location}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-hint flex-shrink-0" />
          <span>{account.rep}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-hint flex-shrink-0" />
          <span>{account.type}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-hint flex-shrink-0" />
          <span>{totalDone} of {allSteps.length} total steps complete</span>
        </div>
      </div>

      {/* Stage stepper */}
      <StageStepper currentStage={account.stage} />

      {/* Two-column grid */}
      <div className="detail-grid">
        {/* Left column: info + tech stack */}
        <div>
          <InfoCard account={account} />
          <TechStackForm account={account} />
        </div>

        {/* Right column: checklist */}
        <div>
          <Checklist
            account={account}
            onToggleStep={handleToggleStep}
            onSaveNote={handleSaveNote}
            newlyUnlocked={newlyUnlocked}
          />
        </div>
      </div>
    </main>
  );
}
