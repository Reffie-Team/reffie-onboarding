import React from 'react';
import StepItem from './StepItem';

/**
 * StageBlock — one accordion stage section in the checklist.
 *
 * States:
 *  current  → bg-brand-tint header, "Current" badge, green label
 *  past     → bg-page header, muted label, ✓ if all done
 *  future   → bg-page header, locked notice instead of steps
 *
 * Matches prototype's .sblock / .srow / .ssteps layout exactly.
 */
export default function StageBlock({
  stage,
  stageIndex,
  currentStageIndex,
  steps,
  checklist,
  isOpen,
  onToggle,
  onToggleStep,
  onSaveNote,
  isSkipped,
  onToggleSkip,
}) {
  const isPast    = stageIndex < currentStageIndex;
  const isCurrent = stageIndex === currentStageIndex;
  const isFuture  = stageIndex > currentStageIndex;

  const doneCnt = steps.filter((s) => checklist[s.id]?.done).length;
  const allDone = doneCnt === steps.length && steps.length > 0;

  return (
    <div className={['border border-[rgba(0,0,0,0.08)] rounded-md overflow-hidden', isSkipped ? 'opacity-50' : ''].join(' ')}>
      {/* Header row */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        className={[
          'flex items-center justify-between px-[14px] py-[11px]',
          'cursor-pointer select-none transition-colors duration-[120ms]',
          isCurrent
            ? 'bg-brand-tint hover:bg-[#D8F2EA]'
            : 'bg-page hover:bg-[#EDECE8]',
        ].join(' ')}
      >
        {/* Left: chevron + name + badges */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[11px] text-hint flex-shrink-0 transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ›
          </span>
          <span
            className={[
              'text-sm font-bold',
              isCurrent ? 'text-brand-dark' : isPast ? 'text-muted' : 'text-ink',
            ].join(' ')}
          >
            {stage}
          </span>
          {isCurrent && (
            <span className="inline-flex items-center gap-1 bg-brand-tint text-brand-dark border border-[rgba(16,189,145,0.28)] rounded-pill text-[10px] font-semibold px-[7px] py-[2px] ml-0.5 flex-shrink-0">
              <span className="w-[5px] h-[5px] rounded-full bg-brand flex-shrink-0" />
              Current
            </span>
          )}
          {allDone && isPast && (
            <span className="text-xs text-brand font-bold ml-0.5 flex-shrink-0">✓</span>
          )}
        </div>

        {/* Right: validation skip checkbox + progress count or skipped badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {stage === 'Validation call' && (
            <label
              className="flex items-center gap-[5px] cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={!!isSkipped}
                onChange={() => onToggleSkip && onToggleSkip()}
                className="w-[11px] h-[11px] cursor-pointer accent-[#10BD91]"
              />
              <span className="text-[10px] font-medium text-muted whitespace-nowrap">
                Not required for this onboarding
              </span>
            </label>
          )}
          {isSkipped ? (
            <span className="inline-flex items-center bg-[#F0EDE8] text-[#5A5650] rounded-pill text-[10px] font-semibold px-[7px] py-[2px] whitespace-nowrap">
              Skipped
            </span>
          ) : (
            <span className={`text-[11px] font-semibold ${allDone ? 'text-brand-dark' : 'text-muted'}`}>
              {doneCnt}/{steps.length}
            </span>
          )}
        </div>
      </div>

      {/* Collapsible body */}
      {isOpen && (
        <div className="border-t border-[rgba(0,0,0,0.08)]">
          {isFuture ? (
            <div className="px-4 py-3 text-xs text-hint italic bg-page">
              Complete the current stage to unlock these steps
            </div>
          ) : steps.length === 0 ? (
            <div className="px-4 py-3 text-xs text-hint italic bg-page">
              No steps for this stage with the current tech stack.
            </div>
          ) : (
            <div className="flex flex-col">
              {steps.map((step) => (
                <StepItem
                  key={step.id}
                  step={step}
                  state={checklist[step.id] ?? { done: false, note: '' }}
                  onToggle={() => onToggleStep(step.id)}
                  onSaveNote={(note) => onSaveNote(step.id, note)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
