import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Edit2, Save, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BudgetPlanning = ({ transactions }) => {
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('categoryBudgets');
    return saved ? JSON.parse(saved) : {
      Food: 500,
      Transportation: 300,
      Entertainment: 200,
      Utilities: 400,
      Other: 300,
    };
  });

  const [editing, setEditing] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    localStorage.setItem('categoryBudgets', JSON.stringify(budgets));
    const total = Object.values(budgets).reduce((sum, val) => sum + parseFloat(val), 0);
    setTotalBudget(total);
  }, [budgets]);

  // Calculate current month's spending per category
  const getCurrentMonthSpending = () => {
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

  const spending = getCurrentMonthSpending();
  const totalSpent = Object.values(spending).reduce((sum, val) => sum + val, 0);

  const handleEdit = (category) => {
    setEditing(category);
    setTempValue(budgets[category]);
  };

  const handleSave = (category) => {
    const value = parseFloat(tempValue);
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setBudgets({ ...budgets, [category]: value });
    setEditing(null);
    toast.success(`Budget updated for ${category}`);
  };

  const handleCancel = () => {
    setEditing(null);
    setTempValue('');
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
    if (percentage >= 100) return <AlertTriangle className="w-5 h-5 text-red-400" />;
    if (percentage >= 80) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <CheckCircle className="w-5 h-5 text-green-400" />;
  };

  const categoryIcons = {
    Food: '🍔',
    Transportation: '🚗',
    Entertainment: '🎬',
    Utilities: '💡',
    Other: '📦',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-blue-400" />
          Budget Planning
        </h2>
        
        {/* Overall Progress */}
        <div className="bg-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Monthly Budget Overview</h3>
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-blue-400">${totalBudget.toFixed(2)}</p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Spent: ${totalSpent.toFixed(2)}</span>
              <span className="text-gray-400">
                {((totalSpent / totalBudget) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${getProgressColor(totalSpent, totalBudget)} transition-colors`}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Remaining</span>
            <span className={`text-lg font-bold ${
              totalBudget - totalSpent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${(totalBudget - totalSpent).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(budgets).map(([category, budget]) => {
          const spent = spending[category] || 0;
          const remaining = budget - spent;
          const percentage = (spent / budget) * 100;

          return (
            <motion.div
              key={category}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{categoryIcons[category]}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{category}</h3>
                    <p className="text-sm text-gray-400">Monthly Budget</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(spent, budget)}
                  {editing === category ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSave(category)}
                        className="p-1 bg-green-600 rounded hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Budget Amount */}
              <div className="mb-4">
                {editing === category ? (
                  <input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSave(category)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    min="0"
                    step="10"
                  />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Budget</span>
                    <span className="text-xl font-bold text-blue-400">${budget.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Spent: ${spent.toFixed(2)}</span>
                  <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full ${getProgressColor(spent, budget)} transition-colors`}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Remaining</p>
                  <p className={`text-lg font-bold ${
                    remaining >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${Math.abs(remaining).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className={`text-sm font-semibold ${
                    percentage >= 100 ? 'text-red-400' :
                    percentage >= 80 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {percentage >= 100 ? 'Over Budget' :
                     percentage >= 80 ? 'Warning' :
                     'On Track'}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
          Budget Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start">
            <span className="mr-2">💡</span>
            <span>Set realistic budgets based on your average spending in each category</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📊</span>
            <span>Review and adjust your budgets monthly to match your lifestyle changes</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎯</span>
            <span>Try to keep your total monthly expenses below 80% of your income</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⚠️</span>
            <span>You'll receive alerts when you reach 75%, 90%, and 100% of any budget</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default BudgetPlanning;