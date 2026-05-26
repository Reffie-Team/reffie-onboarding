import React from 'react';

const VARIANTS = {
  green: 'bg-brand-tint text-brand-dark',
  amber: 'bg-[#FEF7E0] text-[#8A5D04]',
  blue:  'bg-[#EEF3FF] text-[#3253C3]',
  gray:  'bg-[#F0EDE8] text-[#5A5650]',
};

const DOT_COLORS = {
  green: 'bg-brand',
  amber: 'bg-amber',
  blue:  'bg-[#3253C3]',
  gray:  'bg-[#9A9590]',
};

/**
 * Badge
 * @param {'green'|'amber'|'blue'|'gray'} variant
 * @param {string} [className] — extra Tailwind classes (e.g. for font-size override)
 */
export default function Badge({ variant = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-xs font-semibold whitespace-nowrap ${VARIANTS[variant]} ${className}`}
    >
      <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${DOT_COLORS[variant]}`} />
      {children}
    </span>
  );
}
