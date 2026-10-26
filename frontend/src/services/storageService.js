const KEYS = {
  TOKEN: 'token',
  USER: 'user',
  USERNAME: 'username',
  IS_ADMIN: 'isAdmin',
  THEME: 'app-theme',
  CURRENCY: 'app-currency',
  BUDGET: 'monthly-budget',
  CATEGORY_BUDGETS: 'category-budgets',
  BUDGET_GOALS: 'budget-goals',
  NOTIFICATIONS: 'budget-notifications',
};

const storageService = {
  setAuth: (token, user) => {
    localStorage.setItem(KEYS.TOKEN, token);
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    if (user.username) {
      localStorage.setItem(KEYS.USERNAME, user.username);
    }
    if (user.isAdmin !== undefined) {
      localStorage.setItem(KEYS.IS_ADMIN, user.isAdmin.toString());
    }
  },

  getToken: () => {
    return localStorage.getItem(KEYS.TOKEN);
  },

  getUser: () => {
    const user = localStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  setUser: (user) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  clearAuth: () => {
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.USERNAME);
    localStorage.removeItem(KEYS.IS_ADMIN);
  },

  getTheme: () => {
    return localStorage.getItem(KEYS.THEME) || 'dark';
  },

  setTheme: (theme) => {
    localStorage.setItem(KEYS.THEME, theme);
    document.documentElement.className = theme;
  },

  getCurrency: () => {
    return localStorage.getItem(KEYS.CURRENCY) || 'INR';
  },

  setCurrency: (currency) => {
    localStorage.setItem(KEYS.CURRENCY, currency);
  },

  getBudget: () => {
    const budget = localStorage.getItem(KEYS.BUDGET);
    return budget ? parseFloat(budget) : 0;
  },

  setBudget: (amount) => {
    localStorage.setItem(KEYS.BUDGET, amount.toString());
  },

  getCategoryBudgets: () => {
    const budgets = localStorage.getItem(KEYS.CATEGORY_BUDGETS);
    return budgets ? JSON.parse(budgets) : {};
  },

  setCategoryBudgets: (budgets) => {
    localStorage.setItem(KEYS.CATEGORY_BUDGETS, JSON.stringify(budgets));
  },

  getBudgetGoals: () => {
    const goals = localStorage.getItem(KEYS.BUDGET_GOALS);
    return goals ? JSON.parse(goals) : [];
  },

  setBudgetGoals: (goals) => {
    localStorage.setItem(KEYS.BUDGET_GOALS, JSON.stringify(goals));
  },


  getNotifications: () => {
    const notifications = localStorage.getItem(KEYS.NOTIFICATIONS);
    return notifications ? JSON.parse(notifications) : {};
  },

  setNotifications: (notifications) => {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  set: (key, value) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  },

  // Check if key exists
  has: (key) => {
    return localStorage.getItem(key) !== null;
  },
};

export default storageService;

