// Secure authentication utilities
const TOKEN_KEY = 'auth_token';
const ADMIN_KEY = 'is_admin';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export const AuthUtils = {
  // Set token with expiry
  setToken: (token: string, expiryHours: number = 24) => {
    const expiry = new Date().getTime() + (expiryHours * 60 * 60 * 1000);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  },

  // Get token if valid (with grace period for admin)
  getToken: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    const isAdmin = localStorage.getItem(ADMIN_KEY) === 'true';
    
    if (!token || !expiry) return null;
    
    const now = new Date().getTime();
    const expiryTime = parseInt(expiry);
    
    // Give admin 1 hour grace period after expiry
    const graceTime = isAdmin ? 60 * 60 * 1000 : 0;
    
    if (now > (expiryTime + graceTime)) {
      AuthUtils.clearAuth();
      return null;
    }
    
    return token;
  },

  // Set admin status
  setAdmin: (isAdmin: boolean) => {
    if (isAdmin) {
      localStorage.setItem(ADMIN_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_KEY);
    }
  },

  // Check if admin
  isAdmin: (): boolean => {
    return localStorage.getItem(ADMIN_KEY) === 'true' && AuthUtils.getToken() !== null;
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return AuthUtils.getToken() !== null;
  },

  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem('cartItems');
  },

  // Setup token validation without auto-logout
  setupTokenValidation: () => {
    // Only validate token existence, don't auto-logout
    const validateToken = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!token || !expiry) {
        return false;
      }
      
      // Just return validity, don't clear automatically
      const now = new Date().getTime();
      const expiryTime = parseInt(expiry);
      return now <= expiryTime;
    };
    
    return validateToken;
  },

  // Manual logout only
  logout: () => {
    AuthUtils.clearAuth();
    window.location.href = '/login';
  }
};