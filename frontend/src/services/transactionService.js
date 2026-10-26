import api from './api';

const transactionService = {
  getIncome: async () => {
    return api.get('/income');
  },

  createIncome: async (incomeData) => {
    return api.post('/income', incomeData);
  },

  updateIncome: async (id, incomeData) => {
    return api.put(`/income/${id}`, incomeData);
  },

  deleteIncome: async (id) => {
    return api.delete(`/income/${id}`);
  },

  getExpenses: async () => {
    return api.get('/expense');
  },

  createExpense: async (expenseData) => {
    return api.post('/expense', expenseData);
  },

  updateExpense: async (id, expenseData) => {
    return api.put(`/expense/${id}`, expenseData);
  },

  deleteExpense: async (id) => {
    return api.delete(`/expense/${id}`);
  },

  getAllTransactions: async () => {
    const [income, expenses] = await Promise.all([
      transactionService.getIncome(),
      transactionService.getExpenses(),
    ]);

    const incomeTransactions = (income.income || []).map(item => ({
      ...item,
      type: 'income',
    }));

    const expenseTransactions = (expenses.expenses || []).map(item => ({
      ...item,
      type: 'expense',
    }));

    return [...incomeTransactions, ...expenseTransactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  },
};

export default transactionService;
