

export const getApiBaseUrl = (): string => {
  const configuredUrl = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (configuredUrl) return configuredUrl;
  return '/api';
};
