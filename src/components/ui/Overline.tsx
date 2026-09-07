import React from 'react';

export const Overline = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`overline decoration-current inline-block font-bold ${className}`} style={{ textDecoration: 'overline' }}>
    {children}
  </span>
);

export const SvgOverline = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <tspan style={{ textDecoration: 'overline' }} className={className}>
    {children}
  </tspan>
);

/**
 * Helper to add combining overlines (\u0305) to each character in a string
 * e.g., toOverline("CS") -> "C̅S̅"
 */
export const toOverline = (text: string): string => {
  return text.split('').map(c => c + '\u0305').join('');
};

export default Overline;
