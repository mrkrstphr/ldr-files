import { withBasePath } from '../../config';
import { isChristmastime } from '../../lib/isChristmastime';
import { isHalloweentime } from '../../lib/isHalloweentime';

const holidayLogo = () => {
  if (isHalloweentime()) return withBasePath('images/pumpkin.png');
  if (isChristmastime()) return withBasePath('images/santa.png');
};

export const HolidayLogo = () => {
  const holidayLogoSrc = holidayLogo();
  if (!holidayLogoSrc) return null;

  return <img src={holidayLogoSrc} className="size-12" />;
};
