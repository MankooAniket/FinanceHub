import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, DollarSign, X, Bell, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SmartAlerts = ({ transactions, totalIncome, totalExpenses }) => {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    checkAlerts();
  }, [transactions, totalIncome, totalExpenses]);

  const checkAlerts = () => {
    const newAlerts = [];
    const currentBalance = totalIncome - totalExpenses;

    // Check for overspending
    if (currentBalance < 0) {
      newAlerts.push({
        id: 'overspending',
        type: 'error',
        title: 'Overspending Alert',
        message: `You are overspending by $${Math.abs(currentBalance).toFixed(2)}`,
        icon: AlertTriangle,
        color: 'red',
      });
    }

    // Check for low balance
    if (currentBalance > 0 && currentBalance < 100) {
      newAlerts.push({
        id: 'low-balance',
        type: 'warning',
        title: 'Low Balance Warning',
        message: `Your balance is running low: $${currentBalance.toFixed(2)}`,
        icon: AlertTriangle,
        color: 'yellow',
      });
    }

    // Check this month's spending
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return (
          t.type === 'expense' &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthIncome = transactions
      .filter(t => {
        const date = new Date(t.date);
        return (
          t.type === 'income' &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Alert if this month's expenses exceed 80% of income
    if (monthIncome > 0 && monthExpenses > monthIncome * 0.8) {
      const percentage = ((monthExpenses / monthIncome) * 100).toFixed(0);
      newAlerts.push({
        id: 'monthly-limit',
        type: 'warning',
        title: 'Monthly Budget Alert',
        message: `You've used ${percentage}% of this month's income`,
        icon: TrendingUp,
        color: 'orange',
      });
    }

    // Category-wise overspending check
    const categoryLimits = {
      Food: 500,
      Transportation: 300,
      Entertainment: 200,
      Utilities: 400,
    };

    const categoryExpenses = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!categoryExpenses[t.category]) {
          categoryExpenses[t.category] = 0;
        }
        categoryExpenses[t.category] += parseFloat(t.amount);
      });

    Object.entries(categoryLimits).forEach(([category, limit]) => {
      const spent = categoryExpenses[category] || 0;
      if (spent > limit) {
        newAlerts.push({
          id: `category-${category}`,
          type: 'warning',
          title: `${category} Budget Exceeded`,
          message: `Spent $${spent.toFixed(2)} (Limit: $${limit})`,
          icon: DollarSign,
          color: 'orange',
        });
      }
    });

    // Good savings alert
    if (currentBalance > 1000) {
      newAlerts.push({
        id: 'good-savings',
        type: 'success',
        title: 'Great Savings!',
        message: `You have saved $${currentBalance.toFixed(2)}`,
        icon: CheckCircle,
        color: 'green',
      });
    }

    // Filter out dismissed alerts
    const filteredAlerts = newAlerts.filter(
      alert => !dismissedAlerts.includes(alert.id)
    );

    setAlerts(filteredAlerts);

    // Auto-show alerts if there are critical ones
    const hasCritical = filteredAlerts.some(a => a.type === 'error');
    if (hasCritical && filteredAlerts.length > 0) {
      setShowAlerts(true);
      // Show toast for critical alerts
      filteredAlerts
        .filter(a => a.type === 'error')
        .forEach(alert => {
          toast.error(alert.message);
        });
    }
  };

  const dismissAlert = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const dismissAll = () => {
    setDismissedAlerts([...dismissedAlerts, ...alerts.map(a => a.id)]);
    setAlerts([]);
    setShowAlerts(false);
  };

  if (alerts.length === 0) return null;

  return (
    <>
      {/* Alert Bell Icon */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAlerts(!showAlerts)}
        className="fixed top-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </motion.button>

      {/* Alerts Panel */}
      <AnimatePresence>
        {showAlerts && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-20 right-4 z-40 w-96 max-h-[80vh] overflow-y-auto bg-gray-800 rounded-xl shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Smart Alerts
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={dismissAll}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Dismiss All
                </button>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.color === 'red'
                      ? 'bg-red-500 bg-opacity-10 border-red-500'
                      : alert.color === 'yellow' || alert.color === 'orange'
                      ? 'bg-yellow-500 bg-opacity-10 border-yellow-500'
                      : 'bg-green-500 bg-opacity-10 border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <alert.icon
                        className={`w-5 h-5 mt-0.5 ${
                          alert.color === 'red'
                            ? 'text-red-400'
                            : alert.color === 'yellow' || alert.color === 'orange'
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}
                      />
                      <div>
                        <h4 className="font-semibold text-white">{alert.title}</h4>
                        <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
  {`
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}
</style>

    </>
  );
};

export default SmartAlerts;

