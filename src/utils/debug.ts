// Debug utilities for development
const isDevelopment = import.meta.env.DEV;

export const debugLog = (message: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

export const debugError = (message: string, error?: any) => {
  if (isDevelopment) {
    console.error(`[ERROR] ${message}`, error);
  }
};

export const debugAPI = (method: string, url: string, data?: any) => {
  if (isDevelopment) {
    console.log(`[API] ${method.toUpperCase()} ${url}`, data);
  }
};

export const checkAuthState = () => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  debugLog('Auth State Check', {
    hasToken: !!token,
    isAdmin,
    tokenLength: token?.length || 0
  });
  
  return { token, isAdmin, isAuthenticated: !!token };
};