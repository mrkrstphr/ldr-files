import { useEffect, useState } from 'react';

export function usePrefersDarkMode() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const [prefersDark, setPrefersDark] = useState<boolean>(mediaQuery.matches);

  useEffect(() => {
    const handleChange = (event: MediaQueryListEvent) =>
      setPrefersDark(event.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mediaQuery]);

  return prefersDark;
}
