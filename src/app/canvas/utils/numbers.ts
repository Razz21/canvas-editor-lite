export function parseIntValue(value: string | number): number {
  if (!value) return 0;

  return typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);
}

/**
 * Clamp value between an upper and lower bound.
 * @param {number} value input value
 * @param {number} min mininum value
 * @param {number} max maximum allowed value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
