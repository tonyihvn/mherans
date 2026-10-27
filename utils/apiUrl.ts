

export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return (import.meta.env.VITE_API_URL);

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return (import.meta.env.VITE_API_URL);
  }
  return '/api';
};
