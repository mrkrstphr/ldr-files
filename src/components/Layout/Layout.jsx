import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, Outlet } from 'react-router-dom';
import { withBasePath } from '../../config';
import { useModels } from '../../hooks/useModels';
import { MenuToggle } from '../MenuToggle';
import { Menu } from './Menu';

const isChristmastime = () => new Date().getMonth() === 11;
const isHalloweentime = () => new Date().getMonth() === 9;

export function Layout() {
  const { models } = useModels();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isHalloweentime()) {
      document.documentElement.classList.add('halloween');
    } else if (isChristmastime()) {
      document.documentElement.classList.add('christmas');
    }
  }, []);

  return (
    <div className="relative h-dvh">
      <div
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } absolute top-0 left-0 p-4 w-full h-dvh z-50 bg-gray-100 dark:bg-stone-950 dark:text-gray-100`}
      >
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-2xl font-bold flex-1">Models</h2>
          <MenuToggle onClick={() => setMobileMenuOpen(false)}>
            <FiX />
          </MenuToggle>
        </div>
        <Menu models={models} onSelectModel={() => setMobileMenuOpen(false)} />
      </div>
      <div className="grid grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr] h-dvh min-h-0">
        <div className="h-24 flex items-center gap-2 p-4 col-start-1 col-end-4">
          <h1 className="text-4xl flex-1 flex items-center gap-1">
            {isHalloweentime() && (
              <img
                src={withBasePath('images/pumpkin.png')}
                className="size-12"
              />
            )}
            <Link to="/">LDR Files</Link>
          </h1>
          <MenuToggle
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <FiMenu />
          </MenuToggle>
        </div>
        <div className="w-64 p-4 overflow-auto col-start-1 col-end-2 hidden lg:block">
          <div className="text-lg font-bold mb-1">Models</div>
          <Menu models={models} />
        </div>
        <div className="col-start-2 col-end-4 min-h-0 overflow-y-auto lg:rounded-tl-lg lg:rounded-bl-lg bg-white dark:bg-stone-900 dark:text-gray-100">
          <Outlet />
        </div>
        <div className="col-start-1 col-end-4 p-4 lg:pl-64 text-sm text-center">
          Models are copyright LEGO&reg;. This software uses the{' '}
          <a href="https://ldraw.org">LDraw Parts Library</a>.
        </div>
      </div>
    </div>
  );
}
