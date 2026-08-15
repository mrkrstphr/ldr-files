import { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { categoryColor } from '../../lib/categoryColor';
import { prettyModelName } from '../../lib/prettyModelName';
import type { ModelCollection } from '../../types';
import { BrickLogo } from '../BrickLogo';
import { Skeleton } from '../Skeleton';

export type SidebarProps = {
  models?: ModelCollection;
  onNavigate?: () => void;
};

type SearchResult =
  | { type: 'model'; label: string; slug: string; category: string; color: string }
  | { type: 'category'; label: string; category: string; color: string };

export function Sidebar({ models, onNavigate }: SidebarProps) {
  const { categoryName } = useParams();
  const activeCategory = categoryName ? decodeURIComponent(categoryName) : null;

  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);

  const categoryEntries = useMemo(
    () => (models ? Object.entries(models) : []),
    [models],
  );

  const results = useMemo<SearchResult[]>(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return [];

    const modelResults: SearchResult[] = [];
    categoryEntries.forEach(([catName, sets], i) => {
      const color = categoryColor(i);
      sets.forEach((model) => {
        const label = prettyModelName(model.file);
        if (label.toLowerCase().includes(needle)) {
          modelResults.push({
            type: 'model',
            label,
            slug: model.slug,
            category: catName,
            color,
          });
        }
      });
    });

    const categoryResults: SearchResult[] = [];
    categoryEntries.forEach(([catName], i) => {
      if (
        catName.toLowerCase().includes(needle) &&
        !modelResults.some((r) => r.category === catName)
      ) {
        categoryResults.push({
          type: 'category',
          label: catName,
          category: catName,
          color: categoryColor(i),
        });
      }
    });

    return [...modelResults, ...categoryResults].slice(0, 30);
  }, [term, categoryEntries]);

  const closeDropdown = () => setOpen(false);
  const handleResultClick = () => {
    setTerm('');
    closeDropdown();
    onNavigate?.();
  };

  return (
    <div>
      <Link
        to="/"
        className="mb-5 flex items-center gap-2.5"
        onClick={onNavigate}
      >
        <BrickLogo />
        <div className="text-[17px] font-bold" style={{ color: 'var(--text)' }}>
          LDR Files
          <span
            className="block text-[10.5px] font-medium tracking-[0.14em] uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            Set Viewer
          </span>
        </div>
      </Link>

      <div className="relative mb-4.5">
        <FiSearch
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 opacity-55"
          size={14}
        />
        <label htmlFor="modelSearch" className="sr-only">
          Search
        </label>
        <input
          id="modelSearch"
          type="search"
          autoComplete="off"
          placeholder="Search sets or themes..."
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => term && setOpen(true)}
          onBlur={() => setTimeout(closeDropdown, 150)}
          className="w-full rounded-[10px] border py-2.5 pr-3 pl-8.5 text-[13.5px] outline-none"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
          }}
        />
        {open && term.trim() && (
          <div
            className="absolute top-[calc(100%+6px)] right-0 left-0 z-20 max-h-[340px] overflow-y-auto rounded-xl border p-1.5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: '0 14px 30px -12px rgb(var(--shadow-color) / 0.4)',
            }}
          >
            {results.length === 0 ? (
              <div
                className="p-3.5 text-center text-[13px]"
                style={{ color: 'var(--text-faint)' }}
              >
                No matches for &ldquo;{term}&rdquo;
              </div>
            ) : (
              <>
                <div
                  className="code px-2 pt-2 pb-1 text-[10px] tracking-[0.08em] uppercase"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {results.length} result{results.length === 1 ? '' : 's'}
                </div>
                {results.map((r) =>
                  r.type === 'model' ? (
                    <Link
                      key={`${r.category}-${r.slug}`}
                      to={`/model/${r.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px]"
                      style={{ color: 'var(--text)' }}
                    >
                      <span
                        className="h-1.75 w-1.75 flex-shrink-0 rounded-sm"
                        style={{ background: r.color }}
                      />
                      <span className="min-w-0 flex-1 truncate">{r.label}</span>
                      <span
                        className="flex-shrink-0 text-[11px]"
                        style={{ color: 'var(--text-faint)' }}
                      >
                        {r.category}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      key={`cat-${r.category}`}
                      to={`/category/${encodeURIComponent(r.category)}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px]"
                      style={{ color: 'var(--text)' }}
                    >
                      <span
                        className="h-1.75 w-1.75 flex-shrink-0 rounded-sm"
                        style={{ background: r.color }}
                      />
                      <span className="min-w-0 flex-1 truncate">{r.label}</span>
                      <span
                        className="flex-shrink-0 text-[11px]"
                        style={{ color: 'var(--text-faint)' }}
                      >
                        theme
                      </span>
                    </Link>
                  ),
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div
        className="mx-1 mb-2 text-[10.5px] font-semibold tracking-[0.14em] uppercase"
        style={{ color: 'var(--text-faint)' }}
      >
        Collection
      </div>

      {categoryEntries.length === 0 ? (
        <div className="flex flex-col gap-2 px-2">
          <Skeleton />
          <Skeleton className="max-w-[75%]" />
          <Skeleton className="max-w-[85%]" />
          <Skeleton />
          <Skeleton className="max-w-[60%]" />
        </div>
      ) : (
        <nav>
          {categoryEntries.map(([name, sets], i) => {
            const isActive = name === activeCategory;
            return (
              <Link
                key={name}
                to={`/category/${encodeURIComponent(name)}`}
                onClick={onNavigate}
                className="group mb-0.5 flex items-center gap-2.25 rounded-lg px-2 py-2 text-[13.5px] font-medium"
                style={{
                  color: 'var(--text)',
                  background: isActive
                    ? 'color-mix(in srgb, var(--accent-red) 12%, transparent)'
                    : undefined,
                }}
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-sm"
                  style={{ background: categoryColor(i) }}
                />
                <span className="min-w-0 flex-1 truncate" title={name}>
                  {name}
                </span>
                <span
                  className="code text-[11px]"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {sets.length}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
