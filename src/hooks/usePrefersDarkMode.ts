import { useEffect, useState } from 'react';

export function usePrefersDarkMode() {
  const [prefersDark, setPrefersDark] = useState<boolean>();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) =>
      setPrefersDark(event.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersDark;
}
