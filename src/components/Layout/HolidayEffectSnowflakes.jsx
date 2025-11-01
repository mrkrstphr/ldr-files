import { useEffect } from 'react';
import { withBasePath } from '../../config';
import { injectStyleSheet } from '../../lib/injectStylesheet';

export function HolidayEffectSnowflakes() {
  useEffect(() => injectStyleSheet(withBasePath('css/snowflakes.css')), []);

  return (
    <div className="snowflakes" aria-hidden="true">
      {Array.from({ length: 11 }).map((_, i) => (
        <div className="snowflake" key={`snowflake-${i}`}>
          <div className="inner">❅</div>
        </div>
      ))}
    </div>
  );
}
