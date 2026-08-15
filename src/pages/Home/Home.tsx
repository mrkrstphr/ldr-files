import { useEffect, useMemo } from 'react';
import { BsDice5 } from 'react-icons/bs';
import { FaGhost } from 'react-icons/fa6';
import { FiGithub } from 'react-icons/fi';
import { TbChristmasBall } from 'react-icons/tb';
import { Link, useNavigate } from 'react-router-dom';
import { ModelCard } from '../../components/ModelCard';
import { withBasePath } from '../../config';
import { useModels } from '../../hooks/useModels';
import { categoryColor } from '../../lib/categoryColor';
import { isChristmastime } from '../../lib/isChristmastime';
import { isHalloweentime } from '../../lib/isHalloweentime';
import type { ModelCollection } from '../../types';

const RECENT_COUNT = 8;
const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function SeasonalLink() {
  return isHalloweentime() ? (
    <Link
      to="/seasonal/halloween/"
      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold"
      style={{
        color: 'var(--accent-purple)',
        borderColor:
          'color-mix(in srgb, var(--accent-purple) 35%, transparent)',
        background: 'color-mix(in srgb, var(--accent-purple) 12%, transparent)',
      }}
    >
      <FaGhost />
      View Spooky Sets
    </Link>
  ) : isChristmastime() ? (
    <Link
      to="/seasonal/christmas/"
      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold"
      style={{
        color: 'var(--accent-green)',
        borderColor: 'color-mix(in srgb, var(--accent-green) 35%, transparent)',
        background: 'color-mix(in srgb, var(--accent-green) 12%, transparent)',
      }}
    >
      <TbChristmasBall />
      View Festive Sets
    </Link>
  ) : null;
}

export function Home() {
  const navigate = useNavigate();
  const { models } = useModels();

  useEffect(() => {
    document.title = 'LDR Files';
  }, []);

  const handleRandomSetClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    fetch(withBasePath('/data/models.json'))
      .then((res) => res.json())
      .then((models: ModelCollection) => {
        const flattenedModels = Object.values(models).flat();
        const randomModel =
          flattenedModels[Math.floor(Math.random() * flattenedModels.length)];

        navigate(`/model/${randomModel.slug}`);
      });
  };

  const categoryEntries = useMemo(
    () => (models ? Object.entries(models) : []),
    [models],
  );
  const colorForCategory = (name: string) =>
    categoryColor(categoryEntries.findIndex(([catName]) => catName === name));
  const totalSets = categoryEntries.reduce(
    (sum, [, sets]) => sum + sets.length,
    0,
  );

  const recentModels = useMemo(() => {
    const now = Date.now();

    return categoryEntries
      .flatMap(([category, sets]) => sets.map((set) => ({ ...set, category })))
      .sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      )
      .slice(0, RECENT_COUNT)
      .map((set) => ({
        ...set,
        isNew: now - new Date(set.dateAdded).getTime() <= NEW_WINDOW_MS,
      }));
  }, [categoryEntries]);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* HERO */}
      <section
        className="relative overflow-hidden border-b px-5 py-11 md:px-10 md:py-16"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--stud) 2.5px, transparent 2.6px)',
            backgroundSize: '28px 28px',
            maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black, transparent 85%)',
          }}
        />
        <div className="relative max-w-2xl">
          <div
            className="code mb-5 inline-flex items-center gap-2 rounded-full border py-1 pr-2.5 pl-2 text-[11.5px] tracking-[0.12em] uppercase"
            style={{
              color: 'var(--accent-red)',
              borderColor:
                'color-mix(in srgb, var(--accent-red) 30%, transparent)',
              background:
                'color-mix(in srgb, var(--accent-red) 12%, transparent)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--accent-red)' }}
            />
            {totalSets || 150} sets across {categoryEntries.length || 20} themes
          </div>
          <h1 className="display mb-5 text-[34px] leading-[1.02] md:text-[52px]">
            Every set you&apos;ve built in{' '}
            <span style={{ color: 'var(--accent-red)' }}>plastic</span>, now in
            your browser.
          </h1>
          <p
            className="mb-7 max-w-lg text-[17px] leading-relaxed"
            style={{ color: 'var(--text-dim)' }}
          >
            A hand-built library of LEGO&reg; sets — orbit them, step through
            the build, and pull a submodel out on its own.
          </p>
          <div className="mb-9 flex flex-wrap gap-3">
            <button
              className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] px-5 py-3 text-[14.5px] font-semibold text-white transition-transform hover:-translate-y-px active:translate-y-0.5"
              style={{
                background: 'var(--accent-red)',
                boxShadow:
                  '0 3px 0 color-mix(in srgb, var(--accent-red) 60%, black)',
              }}
              onClick={handleRandomSetClick}
            >
              <BsDice5 className="group-hover:animate-spin" />
              Build me something random
            </button>
            {SeasonalLink()}
          </div>
          <div className="flex flex-wrap gap-7">
            <div>
              <b className="display block text-2xl">{totalSets || 150}</b>
              <span
                className="text-[11.5px] tracking-[0.1em] uppercase"
                style={{ color: 'var(--text-faint)' }}
              >
                Sets
              </span>
            </div>
            <div>
              <b className="display block text-2xl">
                {categoryEntries.length || 20}
              </b>
              <span
                className="text-[11.5px] tracking-[0.1em] uppercase"
                style={{ color: 'var(--text-faint)' }}
              >
                Themes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FRESH OFF THE BASEPLATE */}
      <section
        className="border-b px-5 py-9 md:px-10"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="display text-[22px]">Fresh off the baseplate</h2>
          <div className="text-[12.5px]" style={{ color: 'var(--text-faint)' }}>
            Recently added
          </div>
        </div>
        <div className="flex gap-3.5 overflow-x-auto pb-1.5">
          {recentModels.map((m) => (
            <div key={m.slug} className="w-[220px] flex-none">
              <ModelCard
                slug={m.slug}
                file={m.file}
                color={colorForCategory(m.category)}
                isNew={m.isNew}
                hasPreview={m.hasPreview}
              />
            </div>
          ))}
        </div>
      </section>

      {/* BROWSE BY THEME */}
      <section className="px-5 py-9 md:px-10">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="display text-[22px]">Browse by theme</h2>
          <div className="text-[12.5px]" style={{ color: 'var(--text-faint)' }}>
            {categoryEntries.length} themes
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
          {categoryEntries.map(([name, sets], i) => (
            <Link
              key={name}
              to={`/category/${encodeURIComponent(name)}`}
              className="hover-card block overflow-hidden rounded-[14px] border"
              style={
                {
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  '--card-color': categoryColor(i),
                } as React.CSSProperties
              }
            >
              <div
                className="flex h-[54px] items-center gap-1.5 px-3.5"
                style={{
                  background: `color-mix(in srgb, ${categoryColor(i)} 16%, var(--surface))`,
                }}
              >
                <span
                  className="h-[13px] w-[13px] rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${categoryColor(i)} 75%, var(--surface))`,
                    boxShadow:
                      'inset 0 -2px 2px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                />
                <span
                  className="h-[13px] w-[13px] rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${categoryColor(i)} 75%, var(--surface))`,
                    boxShadow:
                      'inset 0 -2px 2px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                />
              </div>
              <div className="px-3.5 pt-3 pb-3.5">
                <div
                  className="mb-0.5 truncate text-sm font-semibold"
                  title={name}
                >
                  {name}
                </div>
                <div
                  className="code text-[11.5px]"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {String(sets.length).padStart(3, '0')} sets
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div
        className="block w-[320px] mx-auto text-sm border mt-6 p-2 text-center rounded-lg"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
      >
        <a href="http://www.ldraw.org">
          <img
            src="http://www.ldraw.org/uploads/images/Logos-Stamps-Visual-IDs/Stamp290.png"
            className="mx-auto"
          />
        </a>
        <br />
        <a href="http://www.ldraw.org/" style={{ color: 'var(--accent-blue)' }}>
          This software uses the LDraw Parts Library
        </a>
      </div>

      <div
        className="px-5 py-9 text-center text-[12.5px] md:px-10"
        style={{ color: 'var(--text-faint)' }}
      >
        Models are copyright LEGO&reg;.{' '}
        <a
          href="https://github.com/mrkrstphr/ldr-files"
          className="inline-flex items-center gap-1.5"
          style={{ color: 'var(--accent-blue)' }}
        >
          <FiGithub /> View on GitHub
        </a>
        <br />
        Made with ❤️ by <a href="https://github.com/mrkrstphr">Kristopher</a>.
      </div>
    </div>
  );
}
