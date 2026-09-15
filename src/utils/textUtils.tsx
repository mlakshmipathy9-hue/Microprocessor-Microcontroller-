import React from 'react';

/**
 * Parses a string and renders active-low signals with a clean overbar (line above the signal name),
 * replacing any '#' suffixes or combining overlines with standard CSS overbar formatting.
 *
 * Supports:
 * - Direct Unicode combining overbars (e.g., B̅H̅E̅, R̅D̅, W̅R̅, M/I̅O̅)
 * - Hash notation (e.g., RD#, WR#, INT0#, INT1#, EA#, PSEN#, PROG#, BHE#, CS#, OE#, CE#, WE#, DEN#, INTR#, MRDC#, MWTC#, IORC#, IOWC#, RTS#, CTS#, DTR#, DSR#, EOP#)
 * - Compound signals with slash (e.g., M/IO# -> M/ + IO with overbar, DT/R# -> DT/ + R with overbar, MN/MX# -> MN/ + MX with overbar, C/D# -> C/ + D with overbar, C/T# -> C/ + T with overbar)
 */
export function renderWithOverbars(str: string): React.ReactNode {
  if (!str) return str;

  const hasOverbarChar = str.includes('\u0305');
  const hasHashSignal = /\b[A-Za-z0-9_]+#/.test(str) || /\b[A-Za-z0-9]+\/[A-Za-z0-9]+#/.test(str);

  if (!hasOverbarChar && !hasHashSignal) return str;

  // Convert compound signals like M/IO# -> M/ + I\u0305O\u0305, DT/R# -> DT/ + R\u0305, MN/MX# -> MN/ + M\u0305X\u0305, C/D# -> C/ + D\u0305, C/T# -> C/ + T\u0305
  let transformed = str.replace(/\b([A-Z][A-Za-z0-9]*)\/([A-Z][A-Za-z0-9]*)#/g, (_m, high, low) => {
    return high + '/' + low.split('').map((c: string) => c + '\u0305').join('');
  });

  // Convert single active-low signals like RD# -> R\u0305D\u0305, INT0# -> I\u0305N\u0305T\u03050\u0305, etc.
  transformed = transformed.replace(/\b([A-Z][A-Za-z0-9_]*)#/g, (_m, sig) => {
    return sig.split('').map((c: string) => c + '\u0305').join('');
  });

  // Split string into normal text and overbarred character sequences
  const parts = transformed.split(/((?:[A-Za-z0-9_]\u0305)+)/g);
  return parts.map((part, i) => {
    if (part.includes('\u0305')) {
      return (
        <span
          key={i}
          className="overline decoration-current inline-block font-semibold"
          style={{ textDecoration: 'overline' }}
        >
          {part.replace(/\u0305/g, '')}
        </span>
      );
    }
    return part;
  });
}

/**
 * Helper to convert signal string with '#' or plain text into Unicode combining overbar string.
 */
export function toOverbarString(str: string): string {
  if (!str) return str;
  let res = str.replace(/\b([A-Z][A-Za-z0-9]*)\/([A-Z][A-Za-z0-9]*)#/g, (_m, high, low) => {
    return high + '/' + low.split('').map((c: string) => c + '\u0305').join('');
  });
  res = res.replace(/\b([A-Z][A-Za-z0-9_]*)#/g, (_m, sig) => {
    return sig.split('').map((c: string) => c + '\u0305').join('');
  });
  return res;
}
