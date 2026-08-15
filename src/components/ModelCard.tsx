import { Link } from 'react-router-dom';
import { withBasePath } from '../config';
import { prettyModelName } from '../lib/prettyModelName';
import { splitPlus } from '../lib/splitPlus';
import { BrickLogo } from './BrickLogo';

export type ModelCardProps = {
  slug: string;
  file: string;
  color: string;
  isNew?: boolean;
  hasPreview?: boolean;
};

export function ModelCard({
  slug,
  file,
  color,
  isNew,
  hasPreview,
}: ModelCardProps) {
  const [num, ...rest] = splitPlus(prettyModelName(file), ' ', 2);
  const name = rest.join(' ');
  const previewSrc = hasPreview
    ? withBasePath(`previews/${file.replace(/\.ldr$/i, '.png')}`)
    : null;

  return (
    <Link
      to={`/model/${slug}`}
      className="hover-card block cursor-pointer overflow-hidden rounded-2xl border"
      style={
        {
          borderColor: 'var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
          '--card-color': color,
        } as React.CSSProperties
      }
    >
      <div
        className="relative flex h-[130px] items-center justify-center"
        style={{
          backgroundImage: previewSrc
            ? undefined
            : 'radial-gradient(circle, var(--stud) 2px, transparent 2.2px)',
          backgroundSize: '18px 18px',
          backgroundColor: `color-mix(in srgb, ${color} 22%, var(--surface-2))`,
        }}
      >
        {isNew && (
          <span
            className="code absolute top-2 right-2 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.08em]"
            style={{ background: 'var(--accent-yellow)', color: '#1c1812' }}
          >
            NEW
          </span>
        )}
        {previewSrc ? (
          <img
            src={previewSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <BrickLogo color={color} size={48} className="rounded-xl" />
        )}
      </div>
      <div className="px-3.5 pt-2.5 pb-3.5">
        <span
          className="code mb-0.5 block text-[10.5px]"
          style={{ color: 'var(--text-faint)' }}
        >
          #{num}
        </span>
        <div className="truncate text-[13.5px] font-semibold" title={name}>
          {name}
        </div>
      </div>
    </Link>
  );
}
