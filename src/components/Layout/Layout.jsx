import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { useHolidayTheme } from '../../hooks/useHolidayTheme';
import { useModels } from '../../hooks/useModels';
import { prettyModelName } from '../../lib/prettyModelName';
import { splitPlus } from '../../lib/splitPlus';
import { MenuToggle } from '../MenuToggle';
import { HolidayEffects } from './HolidayEffects';
import { HolidayLogo } from './HolidayLogo';
import { Sidebar } from './Sidebar';

function Crumb({ isLast, to, children }) {
  if (isLast) {
    return (
      <span className="truncate font-semibold" style={{ color: 'var(--text)' }}>
        {children}
      </span>
    );
  }

  return (
    <Link to={to} className="flex-shrink-0" style={{ color: 'var(--text-dim)' }}>
      {children}
    </Link>
  );
}

function Breadcrumb({ models }) {
  const location = useLocation();
  const { categoryName, modelSlug } = useParams();

  if (location.pathname === '/') return null;

  const crumbs = [{ label: 'Home', to: '/' }];

  if (categoryName) {
    crumbs.push({
      label: decodeURIComponent(categoryName),
      to: location.pathname,
    });
  } else if (modelSlug) {
    const entry = Object.entries(models ?? {}).find(([, sets]) =>
      sets.some((set) => set.slug === modelSlug),
    );

    if (entry) {
      const [modelCategoryName, sets] = entry;
      const model = sets.find((set) => set.slug === modelSlug);
      const [, ...rest] = splitPlus(prettyModelName(model.file), ' ', 2);
      const modelName = rest.join(' ') || prettyModelName(model.file);

      crumbs.push({
        label: modelCategoryName,
        to: `/category/${encodeURIComponent(modelCategoryName)}`,
      });
      crumbs.push({ label: modelName, to: location.pathname });
    }
  }

  return (
    <div className="flex items-center gap-1.5 truncate text-[13px]">
      {crumbs.map((crumb, i) => (
        <span key={crumb.to} className="flex min-w-0 items-center gap-1.5">
          {i > 0 && <span style={{ color: 'var(--text-faint)' }}>/</span>}
          <Crumb isLast={i === crumbs.length - 1} to={crumb.to}>
            {crumb.label}
          </Crumb>
        </span>
      ))}
    </div>
  );
}

export function Layout() {
  useHolidayTheme();

  const { models } = useModels();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div
      className="relative h-dvh"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <div
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } fixed inset-0 z-50 overflow-y-auto p-5 lg:hidden`}
        style={{ background: 'var(--surface)' }}
      >
        <div className="mb-3 flex items-center justify-end">
          <MenuToggle onClick={() => setMobileMenuOpen(false)}>
            <FiX />
          </MenuToggle>
        </div>
        <Sidebar models={models} onNavigate={() => setMobileMenuOpen(false)} />
      </div>

      <div className="grid h-dvh min-h-0 grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside
          className="hidden overflow-y-auto border-r p-5.5 lg:block"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <Sidebar models={models} />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col">
          <div
            className={`flex items-center gap-3.5 border-b px-4 py-3 lg:px-7 ${
              isHome ? 'lg:hidden' : ''
            }`}
            style={{
              borderColor: 'var(--border)',
              background: 'color-mix(in srgb, var(--bg) 88%, transparent)',
            }}
          >
            <MenuToggle
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <FiMenu />
            </MenuToggle>
            <div className="flex items-center gap-1.5 lg:hidden">
              <HolidayLogo />
              <Link
                to="/"
                className="text-lg font-bold"
                style={{ color: 'var(--text)' }}
              >
                LDR Files
              </Link>
            </div>
            <div className="hidden min-w-0 flex-1 lg:block">
              <Breadcrumb models={models} />
            </div>
            <div className="flex-1 lg:hidden" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
      <HolidayEffects />
    </div>
  );
}
