/**
 * Utility to debug authentication state
 * Run this in the browser console to check the auth state
 */

export const debugAuth = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log('Not in browser environment');
    return;
  }
  
  // Get auth cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };
  
  // Check auth cookie
  const authCookie = getCookie('_auth');
  console.log('Auth cookie exists:', !!authCookie);
  
  if (authCookie) {
    try {
      // Try to parse the base64-encoded JWT
      const base64Url = authCookie.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      console.log('Auth token payload:', payload);
      
      // Check if token is expired
      const isExpired = payload.exp * 1000 < Date.now();
      console.log('Token is expired:', isExpired);
    } catch (e) {
      console.log('Error parsing auth token:', e);
    }
  }
  
  return {
    hasAuthCookie: !!authCookie
  };
};

// Add to window for easy console access
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
} 