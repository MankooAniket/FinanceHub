import api from './api';
import storageService from './storageService';

const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      storageService.setAuth(response.token, response.user);
    }
    return response;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      storageService.setAuth(response.token, response.user);
    }
    return response;
  },

  verifyOTP: async (otpData) => {
    const response = await api.post('/otp/verify', otpData);
    if (response.token) {
      storageService.setAuth(response.token, response.user);
    }
    return response;
  },

  resendOTP: async (email) => {
    return await api.post('/otp/resend', { email });
  },

  // Logout
  logout: () => {
    storageService.clearAuth();
    window.location.href = '/login';
  },
  isAuthenticated: () => {
    return !!storageService.getToken();
  },

  getCurrentUser: () => {
    return storageService.getUser();
  },

  isAdmin: () => {
    const user = storageService.getUser();
    return user?.isAdmin || false;
  },

  updateUser: (userData) => {
    const currentUser = storageService.getUser();
    const updatedUser = { ...currentUser, ...userData };
    storageService.setUser(updatedUser);
    return updatedUser;
  },
};

export default authService;

