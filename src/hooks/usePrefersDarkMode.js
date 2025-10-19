import { useEffect, useState } from 'react';

export function usePrefersDarkMode() {
  const [prefersDark, setPrefersDark] = useState();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(mediaQuery.matches);

    const handleChange = (event) => setPrefersDark(event.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersDark;
}
