import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { useBudget } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTransactions } from '../contexts/TransactionContext';

const BudgetNotifications = () => {
  const { monthlyBudget, calculatePercentageUsed } = useBudget();
  const { formatAmount } = useCurrency();
  const { transactions } = useTransactions();
  
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, [transactions, monthlyBudget]);

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

  const generateNotifications = () => {
    if (monthlyBudget === 0) {
      setNotifications([]);
      return;
    }

    const newNotifications = [];
    const totalExpenses = getCurrentMonthExpenses();
    const percentageUsed = calculatePercentageUsed(totalExpenses);
    const remaining = monthlyBudget - totalExpenses;

    // Check if already notified for this milestone
    const notified = JSON.parse(localStorage.getItem('budget-notifications') || '{}');
    const currentMonth = new Date().getMonth();

    // 50% threshold
    if (percentageUsed >= 50 && percentageUsed < 75 && !notified[`${currentMonth}-50`]) {
      newNotifications.push({
        id: 'budget-50',
        type: 'info',
        icon: Info,
        title: 'Halfway There',
        message: `You've used 50% of your monthly budget (${formatAmount(totalExpenses)})`,
        timestamp: new Date().toISOString(),
      });
      notified[`${currentMonth}-50`] = true;
    }

    // 75% threshold
    if (percentageUsed >= 75 && percentageUsed < 90 && !notified[`${currentMonth}-75`]) {
      newNotifications.push({
        id: 'budget-75',
        type: 'warning',
        icon: AlertTriangle,
        title: 'Budget Alert',
        message: `You've used 75% of your budget. ${formatAmount(remaining)} remaining.`,
        timestamp: new Date().toISOString(),
      });
      notified[`${currentMonth}-75`] = true;
    }

    // 90% threshold
    if (percentageUsed >= 90 && percentageUsed < 100 && !notified[`${currentMonth}-90`]) {
      newNotifications.push({
        id: 'budget-90',
        type: 'critical',
        icon: AlertTriangle,
        title: 'Budget Warning',
        message: `You've used 90% of your budget! Only ${formatAmount(remaining)} left.`,
        timestamp: new Date().toISOString(),
      });
      notified[`${currentMonth}-90`] = true;
    }

    // 100% exceeded
    if (percentageUsed >= 100 && !notified[`${currentMonth}-100`]) {
      newNotifications.push({
        id: 'budget-100',
        type: 'error',
        icon: AlertTriangle,
        title: 'Budget Exceeded',
        message: `You've exceeded your budget by ${formatAmount(Math.abs(remaining))}!`,
        timestamp: new Date().toISOString(),
      });
      notified[`${currentMonth}-100`] = true;
    }

    // Good progress - under 50% with 2 weeks left
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const currentDay = new Date().getDate();
    const daysRemaining = daysInMonth - currentDay;

    if (percentageUsed < 50 && daysRemaining <= 14 && daysRemaining > 7 && !notified[`${currentMonth}-good`]) {
      newNotifications.push({
        id: 'budget-good',
        type: 'success',
        icon: CheckCircle,
        title: 'Great Job!',
        message: `You're doing great! Only ${percentageUsed.toFixed(0)}% of budget used with ${daysRemaining} days left.`,
        timestamp: new Date().toISOString(),
      });
      notified[`${currentMonth}-good`] = true;
    }

    // Category budget warnings
    const categoryBudgets = JSON.parse(localStorage.getItem('category-budgets') || '{}');
    Object.entries(categoryBudgets).forEach(([category, budget]) => {
      const categorySpending = transactions
        .filter(t => {
          const date = new Date(t.date);
          return (
            t.type === 'expense' &&
            t.category === category &&
            date.getMonth() === currentMonth
          );
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const categoryPercentage = (categorySpending / budget) * 100;

      if (categoryPercentage >= 100 && !notified[`${currentMonth}-cat-${category}`]) {
        newNotifications.push({
          id: `category-${category}`,
          type: 'warning',
          icon: AlertTriangle,
          title: `${category} Budget Exceeded`,
          message: `You've spent ${formatAmount(categorySpending)} on ${category} (Budget: ${formatAmount(budget)})`,
          timestamp: new Date().toISOString(),
        });
        notified[`${currentMonth}-cat-${category}`] = true;
      }
    });

    localStorage.setItem('budget-notifications', JSON.stringify(notified));
    
    // Get existing notifications from state and merge with new ones
    setNotifications(prev => {
      const existing = prev.filter(n => !newNotifications.find(nn => nn.id === n.id));
      return [...newNotifications, ...existing].slice(0, 10); // Keep max 10
    });
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'from-green-500/20 to-green-500/5 border-green-500/30';
      case 'info': return 'from-blue-500/20 to-blue-500/5 border-blue-500/30';
      case 'warning': return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30';
      case 'critical': return 'from-orange-500/20 to-orange-500/5 border-orange-500/30';
      case 'error': return 'from-red-500/20 to-red-500/5 border-red-500/30';
      default: return 'from-gray-500/20 to-gray-500/5 border-gray-500/30';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-orange-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      {/* Bell Icon with Badge */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-300" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {notifications.length}
            </span>
          )}
        </motion.button>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="absolute right-0 top-12 w-96 max-h-[500px] overflow-y-auto bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Budget Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={dismissAll}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setShowPanel(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="p-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications</p>
                    <p className="text-sm mt-1">We'll notify you about budget updates</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`bg-gradient-to-r ${getNotificationColor(notification.type)} border rounded-lg p-4`}
                      >
                        <div className="flex items-start space-x-3">
                          <notification.icon className={`w-5 h-5 mt-0.5 ${getIconColor(notification.type)}`} />
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
                            <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BudgetNotifications;