import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { useBudget } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTransactions } from '../contexts/TransactionContext';
import BudgetForm from './BudgetForm';

const BudgetComparison = () => {
  const { monthlyBudget, calculatePercentageUsed, isOverBudget } = useBudget();
  const { formatAmount, convertFromINR } = useCurrency();
  const { transactions } = useTransactions();

  // Get current month expenses
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
  const overBudget = isOverBudget(totalExpenses);

  // Chart data (convert to selected currency)
  const chartData = [
    {
      name: 'Budget vs Actual',
      Budget: convertFromINR(monthlyBudget),
      Actual: convertFromINR(totalExpenses),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">
          Budget Comparison
        </h2>
        <p className="text-gray-400">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Budget Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BudgetForm />
        </div>

        {/* Budget Overview */}
        <div className="lg:col-span-2">
          {monthlyBudget > 0 ? (
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-full">
              <h3 className="text-lg font-semibold text-white mb-4">Budget Overview</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Budget</p>
                    <p className="text-2xl font-bold text-blue-400">{formatAmount(monthlyBudget)}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Spent</p>
                    <p className="text-2xl font-bold text-red-400">{formatAmount(totalExpenses)}</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-semibold">{percentageUsed.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${
                        overBudget ? 'bg-red-500' :
                        percentageUsed > 80 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">
                    {overBudget ? 'Over Budget' : 'Remaining'}
                  </p>
                  <p className={`text-2xl font-bold ${overBudget ? 'text-yellow-400' : 'text-green-400'}`}>
                    {formatAmount(Math.abs(monthlyBudget - totalExpenses))}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-full flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Set a monthly budget to see comparison</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {monthlyBudget > 0 && (
        <div className={`p-4 rounded-xl border ${
          overBudget
            ? 'bg-red-900/20 border-red-800'
            : 'bg-green-900/20 border-green-800'
        }`}>
          <div className="flex items-start space-x-3">
            {overBudget ? (
              <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-400 mt-0.5" />
            )}
            <div>
              <h3 className={`font-semibold ${
                overBudget ? 'text-red-300' : 'text-green-300'
              }`}>
                {overBudget ? '⚠️ Over Budget' : '✅ Within Budget'}
              </h3>
              <p className={`text-sm ${
                overBudget ? 'text-red-400' : 'text-green-400'
              }`}>
                {overBudget
                  ? `You are ${formatAmount(totalExpenses - monthlyBudget)} over your monthly budget (${percentageUsed.toFixed(1)}% used)`
                  : `You have ${formatAmount(monthlyBudget - totalExpenses)} remaining from your budget (${percentageUsed.toFixed(1)}% used)`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {monthlyBudget > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Budget vs Actual Expenses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
              />
              <Legend />
              <Bar dataKey="Budget" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Actual" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default BudgetComparison;