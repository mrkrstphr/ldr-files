import { useEffect } from 'react';
import { isChristmastime } from '../lib/isChristmastime';
import { isHalloweentime } from '../lib/isHalloweentime';

export const useHolidayTheme = () => {
  useEffect(() => {
    if (isHalloweentime()) {
      document.documentElement.classList.add('halloween');
    } else if (isChristmastime()) {
      document.documentElement.classList.add('christmas');
    }
  }, []);
};
