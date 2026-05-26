import React from 'react';
import { STAGES, STAGE_SHORT } from '@/lib/constants';

/**
 * StageStepper — 8-node horizontal progress stepper.
 * Matches prototype's .stepper / .sttrack / .stnode layout exactly.
 * Connector lines drawn with an absolutely-positioned <span> per node.
 */
export default function StageStepper({ currentStage }) {
  const si = STAGES.indexOf(currentStage);

  return (
    <div className="bg-surface border border-[rgba(0,0,0,0.08)] rounded-md px-[22px] py-[18px] mb-[22px] overflow-x-auto">
      <div className="text-[11px] font-semibold uppercase tracking-[1px] text-muted mb-[13px]">
        Onboarding progress — {STAGES.length} stages
      </div>

      <div className="flex items-start" style={{ minWidth: 600 }}>
        {STAGES.map((stage, i) => {
          const isDone    = i < si;
          const isCurrent = i === si;

          return (
            <React.Fragment key={stage}>
              {/* Node */}
              <div className="flex flex-col items-center flex-1 gap-[6px] relative">
                {/* Connector line to next node (drawn inside current node's space) */}
                {i < STAGES.length - 1 && (
                  <span
                    aria-hidden
                    className={`absolute h-0.5 z-0 ${isDone ? 'bg-brand' : 'bg-[#E8E5E0]'}`}
                    style={{
                      top: 10,
                      left: 'calc(50% + 11px)',
                      right: 'calc(-50% + 11px)',
                    }}
                  />
                )}

                {/* Circle */}
                <div
                  className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    'text-[9px] font-bold z-10 relative flex-shrink-0',
                    'transition-all duration-200',
                    isDone
                      ? 'bg-brand border-brand text-white'
                      : isCurrent
                      ? 'bg-brand border-brand text-white'
                      : 'bg-white border-[#E8E5E0] text-hint',
                  ].join(' ')}
                  style={
                    isCurrent
                      ? { boxShadow: '0 0 0 4px rgba(16,189,145,0.18)' }
                      : undefined
                  }
                >
                  {isDone ? '✓' : i + 1}
                </div>

                {/* Label */}
                <div
                  className={[
                    'text-[10px] font-medium text-center leading-snug',
                    isDone    ? 'text-brand-dark font-semibold' :
                    isCurrent ? 'text-brand font-bold' :
                                'text-hint',
                  ].join(' ')}
                >
                  {STAGE_SHORT[i]}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
