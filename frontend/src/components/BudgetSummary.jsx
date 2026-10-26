import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { useBudget } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTransactions } from '../contexts/TransactionContext';

const BudgetSummary = () => {
  const { monthlyBudget, calculatePercentageUsed, isOverBudget } = useBudget();
  const { formatAmount } = useCurrency();
  const { transactions } = useTransactions();

  // Calculate current month expenses (in INR)
  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return (
          t.type === 'expense' &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const totalExpenses = getCurrentMonthExpenses();
  const percentageUsed = calculatePercentageUsed(totalExpenses);
  const remaining = monthlyBudget - totalExpenses;
  const overBudget = isOverBudget(totalExpenses);

  if (monthlyBudget === 0) {
    return null; // Don't show if no budget set
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Budget Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Monthly Budget</span>
          <DollarSign className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-3xl font-bold text-white">
          {formatAmount(monthlyBudget)}
        </p>
      </motion.div>

      {/* Expenses Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Total Expenses</span>
          <TrendingDown className="w-5 h-5 text-red-500" />
        </div>
        <p className="text-3xl font-bold text-white">
          {formatAmount(totalExpenses)}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {percentageUsed.toFixed(1)}% used
        </p>
      </motion.div>

      {/* Remaining/Deficit Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`bg-gradient-to-br ${
          overBudget
            ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30'
            : 'from-green-500/20 to-green-500/5 border-green-500/30'
        } border rounded-xl p-6`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            {overBudget ? 'Over Budget' : 'Remaining'}
          </span>
          {overBudget ? (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          ) : (
            <TrendingUp className="w-5 h-5 text-green-500" />
          )}
        </div>
        <p className={`text-3xl font-bold ${
          overBudget ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {formatAmount(Math.abs(remaining))}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {overBudget 
            ? `${(percentageUsed - 100).toFixed(1)}% over budget`
            : `${(100 - percentageUsed).toFixed(1)}% remaining`
          }
        </p>
      </motion.div>
    </div>
  );
};

export default BudgetSummary;