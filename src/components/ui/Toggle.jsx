import React, { useId } from 'react';

/**
 * Toggle — brand-green toggle switch.
 * Matches prototype's .tgg / .toggle / .tslider layout.
 *
 * @param {boolean}         checked
 * @param {function}        onChange(boolean)
 * @param {string}          label
 */
export default function Toggle({ checked, onChange, label }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between py-[9px] border-t border-[rgba(0,0,0,0.08)]">
      <span className="text-xs font-semibold text-ink">{label}</span>
      <label htmlFor={id} className="relative w-9 h-5 flex-shrink-0 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          className="absolute opacity-0 w-0 h-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {/* Track */}
        <span
          className={`absolute inset-0 rounded-full transition-colors duration-200 ${
            checked ? 'bg-brand' : 'bg-[#D8D4CE]'
          }`}
        />
        {/* Thumb */}
        <span
          className={`absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] left-[3px]
            shadow-[0_1px_3px_rgba(0,0,0,0.18)]
            transition-transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.2,0.64,1)' }}
        />
      </label>
    </div>
  );
}
