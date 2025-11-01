import { lazy, Suspense } from 'react';
import { isChristmastime } from '../../lib/isChristmastime';

export function HolidayEffects() {
  const HolidayEffectSnowflakes = lazy(() =>
    import('./HolidayEffectSnowflakes').then((module) => ({
      default: module.HolidayEffectSnowflakes,
    })),
  );

  return (
    <Suspense fallback={null}>
      {isChristmastime() && <HolidayEffectSnowflakes />}
    </Suspense>
  );
}
