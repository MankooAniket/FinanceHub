import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Save, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTransactions } from '../contexts/TransactionContext';

const CategoryBudget = () => {
  const { formatAmount, convertToINR, convertFromINR, currencySymbol } = useCurrency();
  const { transactions } = useTransactions();

  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    const saved = localStorage.getItem('category-budgets');
    return saved ? JSON.parse(saved) : {
      Food: 5000,
      Transportation: 3000,
      Entertainment: 2000,
      Utilities: 4000,
      Other: 3000,
    };
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem('category-budgets', JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  // Get current month spending per category
  const getCategorySpending = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spending = {};
    
    transactions
      .filter(t => {
        const date = new Date(t.date);
        return (
          t.type === 'expense' &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .forEach(t => {
        if (!spending[t.category]) {
          spending[t.category] = 0;
        }
        spending[t.category] += parseFloat(t.amount);
      });

    return spending;
  };

  const categorySpending = getCategorySpending();

  const handleEdit = (category) => {
    setEditingCategory(category);
    setEditValue(convertFromINR(categoryBudgets[category]).toFixed(2));
  };

  const handleSave = (category) => {
    const amountInINR = convertToINR(parseFloat(editValue));
    setCategoryBudgets(prev => ({
      ...prev,
      [category]: amountInINR,
    }));
    setEditingCategory(null);
    toast.success(`Budget updated for ${category}`);
  };

  const handleDelete = (category) => {
    if (window.confirm(`Remove budget for ${category}?`)) {
      const newBudgets = { ...categoryBudgets };
      delete newBudgets[category];
      setCategoryBudgets(newBudgets);
      toast.success(`Budget removed for ${category}`);
    }
  };

  const getProgressColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return '🔴';
    if (percentage >= 80) return '🟡';
    return '🟢';
  };

  const categoryIcons = {
    Food: '🍔',
    Transportation: '🚗',
    Entertainment: '🎬',
    Utilities: '💡',
    Shopping: '🛍️',
    Healthcare: '🏥',
    Education: '📚',
    Other: '📦',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <PieChart className="w-6 h-6 mr-2 text-blue-400" />
              Category Budgets
            </h2>
            <p className="text-gray-400 mt-1">Track spending limits for each category</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Budget</p>
            <p className="text-2xl font-bold text-white">
              {formatAmount(Object.values(categoryBudgets).reduce((a, b) => a + b, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categoryBudgets).map(([category, budget]) => {
          const spent = categorySpending[category] || 0;
          const remaining = budget - spent;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;

          return (
            <motion.div
              key={category}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{categoryIcons[category] || '📦'}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{category}</h3>
                    <p className="text-xs text-gray-400">Monthly Budget</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getStatusIcon(spent, budget)}</span>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Budget Amount */}
              <div className="mb-4">
                {editingCategory === category ? (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(category)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-400">
                      {formatAmount(budget)}
                    </span>
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Spent: {formatAmount(spent)}</span>
                  <span className="text-gray-400">{percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full ${getProgressColor(spent, budget)}`}
                  />
                </div>
              </div>

              {/* Remaining */}
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Remaining</span>
                  <span className={`text-lg font-bold ${
                    remaining >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {remaining >= 0 ? formatAmount(remaining) : `-${formatAmount(Math.abs(remaining))}`}
                  </span>
                </div>
              </div>

              {/* Warning if over budget */}
              {percentage >= 100 && (
                <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Over budget by {(percentage - 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Categories</p>
            <p className="text-2xl font-bold text-white">
              {Object.keys(categoryBudgets).length}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-blue-400">
              {formatAmount(Object.values(categoryBudgets).reduce((a, b) => a + b, 0))}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-red-400">
              {formatAmount(Object.values(categorySpending).reduce((a, b) => a + b, 0))}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">On Track</p>
            <p className="text-2xl font-bold text-green-400">
              {Object.entries(categoryBudgets).filter(([cat, budget]) => {
                const spent = categorySpending[cat] || 0;
                return spent < budget;
              }).length}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryBudget;