import { createContext, useContext, useState, useEffect } from 'react';

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('monthly-budget');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('monthly-budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  const updateBudget = (amountInINR) => {
    const budget = parseFloat(amountInINR);
    if (isNaN(budget) || budget < 0) {
      throw new Error('Invalid budget amount');
    }
    setMonthlyBudget(budget);
  };

  
  const calculateDeficit = (totalExpensesInINR) => {
    return totalExpensesInINR - monthlyBudget;
  };

  const calculateSurplus = (totalExpensesInINR) => {
    return monthlyBudget - totalExpensesInINR;
  };

  const calculatePercentageUsed = (totalExpensesInINR) => {
    if (monthlyBudget === 0) return 0;
    return (totalExpensesInINR / monthlyBudget) * 100;
  };

  const isOverBudget = (totalExpensesInINR) => {
    return totalExpensesInINR > monthlyBudget;
  };

  const value = {
    monthlyBudget,
    updateBudget,
    calculateDeficit,
    calculateSurplus,
    calculatePercentageUsed,
    isOverBudget,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};