export type BrickLogoProps = {
  color?: string;
  size?: number;
  className?: string;
};

export function BrickLogo({
  color = 'var(--accent-red)',
  size = 34,
  className,
}: BrickLogoProps) {
  return (
    <div
      className={`grid flex-shrink-0 grid-cols-2 grid-rows-2 ${className ?? 'rounded-lg'}`}
      style={{
        width: size,
        height: size,
        padding: size * 0.147,
        gap: size * 0.088,
        background: `linear-gradient(155deg, ${color}, color-mix(in srgb, ${color} 65%, black))`,
        boxShadow: '0 2px 0 rgb(var(--shadow-color) / 0.25)',
      }}
    >
      <span className="rounded-full bg-white/55" />
      <span className="rounded-full bg-white/55" />
      <span className="rounded-full bg-white/55" />
      <span className="rounded-full bg-white/55" />
    </div>
  );
}
