import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  TbMultiplier05X,
  TbMultiplier15X,
  TbMultiplier1X,
  TbMultiplier2X,
} from 'react-icons/tb';

const speedToIcon = {
  0.5: TbMultiplier05X,
  1: TbMultiplier1X,
  1.5: TbMultiplier15X,
  2: TbMultiplier2X,
};

const PlaybackOption = ({ children, onClick }) => (
  <MenuItem
    as="div"
    onClick={onClick}
    className="block cursor-pointer px-4 py-2 text-sm text-stone-700 data-focus:bg-stone-100 data-focus:text-stone-900 data-focus:outline-hidden dark:text-stone-300 dark:data-focus:bg-white/5 dark:data-focus:text-white"
  >
    {children}{' '}
  </MenuItem>
);

export function PlaybackSpeed({ playSpeed, setPlaySpeed }) {
  const SpeedIcon = speedToIcon[playSpeed] || TbMultiplier1X;

  return (
    <Menu>
      <MenuButton>
        <div className="border cursor-pointer border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded p-1">
          <SpeedIcon />
        </div>
      </MenuButton>

      <MenuItems
        anchor="top center"
        transition
        className="absolute -mt-2 z-10 w-14 text-center origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-stone-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
      >
        <div className="py-1">
          <PlaybackOption onClick={() => setPlaySpeed(0.5)}>.5x</PlaybackOption>
          <PlaybackOption onClick={() => setPlaySpeed(1.5)}>
            1.5x
          </PlaybackOption>
          <PlaybackOption onClick={() => setPlaySpeed(1)}>1</PlaybackOption>
          <PlaybackOption onClick={() => setPlaySpeed(2)}>2</PlaybackOption>
        </div>
      </MenuItems>
    </Menu>
  );
}
