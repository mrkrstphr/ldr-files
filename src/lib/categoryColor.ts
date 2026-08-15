const COLORS = [
  'var(--accent-red)',
  'var(--accent-yellow)',
  'var(--accent-blue)',
  'var(--accent-green)',
  'var(--accent-purple)',
];

export function categoryColor(index: number) {
  return COLORS[((index % COLORS.length) + COLORS.length) % COLORS.length];
}
