import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BrickLogo } from '../../components/BrickLogo';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ModelCard } from '../../components/ModelCard';
import { useModels } from '../../hooks/useModels';
import { categoryColor } from '../../lib/categoryColor';

export function Category() {
  const { categoryName } = useParams();
  const name = categoryName ? decodeURIComponent(categoryName) : '';
  const { models, loading } = useModels();

  useEffect(() => {
    if (name) document.title = `${name} :: LDR Files`;
  }, [name]);

  const categoryEntries = models ? Object.entries(models) : [];
  const index = categoryEntries.findIndex(([catName]) => catName === name);
  const sets = index >= 0 ? categoryEntries[index][1] : undefined;
  const color = index >= 0 ? categoryColor(index) : 'var(--accent-red)';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!sets) {
    return (
      <div className="p-8" style={{ color: 'var(--text-dim)' }}>
        <h1 className="display mb-2 text-2xl" style={{ color: 'var(--text)' }}>
          Theme not found
        </h1>
        <p>We couldn&apos;t find a theme called &ldquo;{name}&rdquo;.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-full"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <div
        className="flex items-center gap-4 border-b px-5 py-8 md:px-10"
        style={{ borderColor: 'var(--border)' }}
      >
        <BrickLogo color={color} size={56} className="rounded-2xl" />
        <div>
          <h1 className="display text-[28px]">{name}</h1>
          <div className="code text-[12px]" style={{ color: 'var(--text-faint)' }}>
            {String(sets.length).padStart(3, '0')} sets
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3.5 p-5 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] md:p-10">
        {sets.map((model) => (
          <ModelCard
            key={model.slug}
            slug={model.slug}
            file={model.file}
            color={color}
            hasPreview={model.hasPreview}
          />
        ))}
      </div>
    </div>
  );
}
