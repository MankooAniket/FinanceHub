// frontend/src/components/AIInsights.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, AlertCircle, Lightbulb, Target } from 'lucide-react';

const AIInsights = ({ transactions, totalIncome, totalExpenses }) => {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    generateAIInsights();
  }, [transactions, totalIncome, totalExpenses]);

  const generateAIInsights = () => {
    const newInsights = [];
    const newRecommendations = [];

    // Calculate spending patterns
    const categorySpending = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + parseFloat(t.amount);
    });

    // Get current month data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // AI Insight 1: Savings Rate
    const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome) * 100 : 0;
    
    if (savingsRate > 20) {
      newInsights.push({
        icon: TrendingUp,
        type: 'success',
        title: 'Excellent Savings Rate!',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`,
      });
    } else if (savingsRate < 10 && monthIncome > 0) {
      newInsights.push({
        icon: AlertCircle,
        type: 'warning',
        title: 'Low Savings Alert',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to increase it to at least 20%.`,
      });
      newRecommendations.push({
        icon: Target,
        title: 'Increase Savings',
        message: 'Aim to save at least 20% of your monthly income for financial security.',
      });
    }

    // AI Insight 2: Highest Spending Category
    const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory && topCategory[1] > monthIncome * 0.3) {
      newInsights.push({
        icon: TrendingDown,
        type: 'warning',
        title: `High ${topCategory[0]} Spending`,
        message: `${topCategory[0]} accounts for ${((topCategory[1] / monthExpenses) * 100).toFixed(1)}% of your expenses.`,
      });
      newRecommendations.push({
        icon: Lightbulb,
        title: `Reduce ${topCategory[0]} Costs`,
        message: `Consider setting a budget limit for ${topCategory[0]} to control spending.`,
      });
    }

    // AI Insight 3: Spending Trend
    const avgDailySpending = monthExpenses / now.getDate();
    const projectedMonthlySpending = avgDailySpending * new Date(currentYear, currentMonth + 1, 0).getDate();

    if (projectedMonthlySpending > monthIncome) {
      newInsights.push({
        icon: AlertCircle,
        type: 'error',
        title: 'Spending Exceeds Income',
        message: `At current rate, you'll spend ₹${projectedMonthlySpending.toFixed(0)} but earn ₹${monthIncome.toFixed(0)}.`,
      });
      newRecommendations.push({
        icon: Target,
        title: 'Reduce Daily Spending',
        message: `Cut daily spending by ₹${((projectedMonthlySpending - monthIncome) / 30).toFixed(0)} to break even.`,
      });
    }

    // AI Insight 4: Transaction Frequency
    const transactionCount = monthTransactions.length;
    const avgPerDay = transactionCount / now.getDate();

    if (avgPerDay > 5) {
      newRecommendations.push({
        icon: Lightbulb,
        title: 'Track Smaller Expenses',
        message: `You make ${avgPerDay.toFixed(1)} transactions/day. Small purchases add up quickly!`,
      });
    }

    // AI Insight 5: Income Stability
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    if (incomeTransactions.length > 3) {
      const incomeAmounts = incomeTransactions.map(t => parseFloat(t.amount));
      const avgIncome = incomeAmounts.reduce((a, b) => a + b, 0) / incomeAmounts.length;
      const variance = incomeAmounts.reduce((sum, val) => sum + Math.pow(val - avgIncome, 2), 0) / incomeAmounts.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev / avgIncome > 0.3) {
        newInsights.push({
          icon: AlertCircle,
          type: 'info',
          title: 'Variable Income Detected',
          message: 'Your income varies significantly. Consider building an emergency fund.',
        });
        newRecommendations.push({
          icon: Target,
          title: 'Build Emergency Fund',
          message: 'Save 3-6 months of expenses for income stability.',
        });
      }
    }

    setInsights(newInsights);
    setRecommendations(newRecommendations);
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success': return 'from-green-500/20 to-green-500/5 border-green-500/30';
      case 'warning': return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30';
      case 'error': return 'from-red-500/20 to-red-500/5 border-red-500/30';
      case 'info': return 'from-blue-500/20 to-blue-500/5 border-blue-500/30';
      default: return 'from-gray-500/20 to-gray-500/5 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Financial Insights</h2>
            <p className="text-gray-400 text-sm">Powered by intelligent spending analysis</p>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-400" />
            Smart Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${getBgColor(insight.type)} border rounded-xl p-4`}
              >
                <div className="flex items-start space-x-3">
                  <insight.icon className={`w-6 h-6 mt-1 ${getIconColor(insight.type)}`} />
                  <div>
                    <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-300">{insight.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <rec.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-400">{rec.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Insights Yet */}
      {insights.length === 0 && recommendations.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">AI is Learning...</h3>
          <p className="text-gray-400">
            Add more transactions to get personalized AI insights and recommendations!
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;

