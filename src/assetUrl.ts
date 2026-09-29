const baseUrl = import.meta.env?.BASE_URL ?? './';

export const assetUrl = (path: string) =>
  `${baseUrl.replace(/\/?$/, '/')}${path.replace(/^\/+/, '')}`;
