export const basePath = '/ldr-files/';

export const withBasePath = (path) => `${basePath}${path.replace(/^\/+/, '')}`;
