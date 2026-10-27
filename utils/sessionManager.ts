

/**
 * Session Manager - Clear all user sessions
 */

export const clearAllSessions = () => {
  console.log('[SessionManager] Clearing all sessions...');
  
  // Clear localStorage
  localStorage.clear();
  console.log('[SessionManager] localStorage cleared');
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('[SessionManager] sessionStorage cleared');
  
  // Clear all cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
  console.log('[SessionManager] Cookies cleared');
  
  // Call backend to log clear
  fetch(import.meta.env.VITE_API_URL + '/debug/clear-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(r => r.json())
    .then(data => console.log('[SessionManager] Backend response:', data))
    .catch(err => console.error('[SessionManager] Backend error:', err));
  
  // Reload page
  setTimeout(() => {
    window.location.href = '/';
  }, 500);
};

export const getSessionInfo = () => {
  return {
    user: localStorage.getItem('user'),
    userLength: localStorage.getItem('user')?.length || 0,
    allLocalStorageKeys: Object.keys(localStorage),
    allSessionStorageKeys: Object.keys(sessionStorage)
  };
};
