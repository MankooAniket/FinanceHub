import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, CheckCircle, Trophy, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTransactions } from '../contexts/TransactionContext';

const BudgetGoals = () => {
  const { formatAmount, convertToINR, convertFromINR, currencySymbol } = useCurrency();
  const { transactions } = useTransactions();

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('budget-goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    localStorage.setItem('budget-goals', JSON.stringify(goals));
  }, [goals]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amountInINR = convertToINR(parseFloat(formData.targetAmount));
    const newGoal = {
      ...formData,
      id: editingGoal?.id || Date.now().toString(),
      targetAmount: amountInINR,
      currentAmount: editingGoal?.currentAmount || 0,
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
      completed: false,
    };

    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? newGoal : g));
      toast.success('Goal updated!');
    } else {
      setGoals(prev => [...prev, newGoal]);
      toast.success('Goal created!');
    }

    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this goal?')) {
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal deleted');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: convertFromINR(goal.targetAmount).toFixed(2),
      deadline: goal.deadline,
      category: goal.category,
      description: goal.description,
    });
    setShowAddForm(true);
  };

  const markAsCompleted = (id) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, completed: true, completedAt: new Date().toISOString() } : g
    ));
    toast.success('🎉 Goal completed! Congratulations!', {
      icon: '🏆',
      duration: 5000,
    });
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingGoal(null);
    setFormData({
      title: '',
      targetAmount: '',
      deadline: '',
      category: '',
      description: '',
    });
  };

  // Calculate progress based on category spending
  const calculateProgress = (goal) => {
    if (!goal.category) return 0;

    const categorySpending = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === goal.category &&
        new Date(t.date) >= new Date(goal.createdAt)
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return categorySpending;
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const endDate = new Date(deadline);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

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
              <Target className="w-6 h-6 mr-2 text-blue-400" />
              Budget Goals & Milestones
            </h2>
            <p className="text-gray-400 mt-1">Set and track your financial goals</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Goal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Active Goals</span>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{activeGoals.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Completed</span>
            <Trophy className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{completedGoals.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Goals</span>
            <CheckCircle className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{goals.length}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 rounded-xl p-6 shadow-lg overflow-hidden"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Reduce food spending"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    placeholder="1000"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category (Optional)
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Why is this goal important?"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Active Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const currentSpending = calculateProgress(goal);
              const percentage = (currentSpending / goal.targetAmount) * 100;
              const daysLeft = getDaysRemaining(goal.deadline);
              const isOverdue = daysLeft < 0;
              const isNearDeadline = daysLeft <= 7 && daysLeft >= 0;

              return (
                <motion.div
                  key={goal.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-800 rounded-xl p-6 shadow-lg"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{goal.title}</h4>
                      {goal.category && (
                        <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded mt-2">
                          {goal.category}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {goal.description && (
                    <p className="text-sm text-gray-400 mb-4">{goal.description}</p>
                  )}

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-semibold">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full ${getProgressColor(percentage)}`}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Target</p>
                      <p className="text-lg font-bold text-white">
                        {formatAmount(goal.targetAmount)}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Current</p>
                      <p className="text-lg font-bold text-blue-400">
                        {formatAmount(currentSpending)}
                      </p>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    isOverdue ? 'bg-red-500/20 text-red-400' :
                    isNearDeadline ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {isOverdue 
                          ? `Overdue by ${Math.abs(daysLeft)} days`
                          : `${daysLeft} days remaining`
                        }
                      </span>
                    </div>
                    <span className="text-xs">
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  {percentage >= 100 && (
                    <button
                      onClick={() => markAsCompleted(goal.id)}
                      className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-green-400" />
            Completed Goals ({completedGoals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <motion.div
                key={goal.id}
                className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{goal.title}</h4>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-sm text-gray-400">
                  Completed: {new Date(goal.completedAt).toLocaleDateString()}
                </p>
                <p className="text-lg font-bold text-green-400 mt-2">
                  {formatAmount(goal.targetAmount)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Goals Yet</h3>
          <p className="text-gray-400 mb-4">
            Set financial goals to track your progress and stay motivated
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default BudgetGoals;