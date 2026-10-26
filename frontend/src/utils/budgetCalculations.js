export const calculateTotal = (transactions) => {
  if (!Array.isArray(transactions)) return 0;
  
  return transactions.reduce((sum, transaction) => {
    const amount = parseFloat(transaction.amount) || 0;
    return sum + amount;
  }, 0);
};

export const calculateMonthlySpending = (transactions) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  return calculateTotal(monthlyTransactions);
};

export const calculateBudgetPercentage = (spent, budget) => {
  if (!budget || budget === 0) return 0;
  return (spent / budget) * 100;
};

export const isOverBudget = (spent, budget) => {
  return spent > budget;
};

export const calculateCategorySpending = (transactions, category) => {
  const categoryTransactions = transactions.filter(
    t => t.category === category && t.type === 'expense'
  );
  
  return calculateTotal(categoryTransactions);
};

export const getSpendingByCategory = (transactions) => {
  const categoryMap = {};

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += parseFloat(t.amount) || 0;
    });

  return Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
  }));
};

export const calculateSavingsRate = (income, expenses) => {
  if (!income || income === 0) return 0;
  const savings = income - expenses;
  return (savings / income) * 100;
};

export const projectMonthEndSpending = (currentSpending, currentDay, daysInMonth) => {
  if (currentDay === 0) return 0;
  const dailyAverage = currentSpending / currentDay;
  return dailyAverage * daysInMonth;
};

export const calculateRemainingBudget = (budget, spent) => {
  return budget - spent;
};

export const getBudgetStatusColor = (percentage) => {
  if (percentage >= 100) return 'red';
  if (percentage >= 80) return 'yellow';
  if (percentage >= 60) return 'orange';
  return 'green';
};

export const getBudgetStatus = (spent, budget) => {
  if (budget === 0) return 'No budget set';
  
  const percentage = calculateBudgetPercentage(spent, budget);
  
  if (percentage >= 100) return 'Over budget';
  if (percentage >= 80) return 'Near limit';
  if (percentage >= 60) return 'On track';
  return 'Under budget';
};