export const basePath = '/ldr-files/';

export const withBasePath = (path: string) =>
  `${basePath}${path.replace(/^\/+/, '')}`;
