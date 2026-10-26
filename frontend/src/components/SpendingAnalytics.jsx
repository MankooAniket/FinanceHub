import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Target, Award, Calendar } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTransactions } from '../contexts/TransactionContext';
import { useBudget } from '../contexts/BudgetContext';

const SpendingAnalytics = () => {
  const { formatAmount, convertFromINR } = useCurrency();
  const { transactions } = useTransactions();
  const { monthlyBudget } = useBudget();

  // Get daily spending for current month
  const getDailySpending = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const dailyMap = {};
    
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
        const day = new Date(t.date).getDate();
        if (!dailyMap[day]) {
          dailyMap[day] = 0;
        }
        dailyMap[day] += parseFloat(t.amount);
      });

    return Object.entries(dailyMap)
      .map(([day, amount]) => ({
        day: parseInt(day),
        amount: convertFromINR(amount),
      }))
      .sort((a, b) => a.day - b.day);
  };

  // Get weekly spending
  const getWeeklySpending = () => {
    const now = new Date();
    const last4Weeks = [];
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekSpending = transactions
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && date >= weekStart && date <= weekEnd;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      last4Weeks.push({
        week: `Week ${4 - i}`,
        spending: convertFromINR(weekSpending),
      });
    }
    
    return last4Weeks;
  };

  // Get spending insights
  const getInsights = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return (
          t.type === 'expense' &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return (
          t.type === 'expense' &&
          date.getMonth() === lastMonth &&
          date.getFullYear() === lastMonthYear
        );
      })
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const change = lastMonthExpenses > 0 
      ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

    // Daily average
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const dailyAverage = thisMonthExpenses / currentDay;
    const projectedMonthEnd = dailyAverage * daysInMonth;

    // Top spending day
    const dailySpending = getDailySpending();
    const topDay = dailySpending.reduce((max, day) => 
      day.amount > max.amount ? day : max, 
      { day: 0, amount: 0 }
    );

    return {
      thisMonth: thisMonthExpenses,
      lastMonth: lastMonthExpenses,
      change,
      dailyAverage,
      projectedMonthEnd,
      topDay,
      daysRemaining: daysInMonth - currentDay,
    };
  };

  const dailyData = getDailySpending();
  const weeklyData = getWeeklySpending();
  const insights = getInsights();

  const InsightCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} border border-opacity-30 rounded-xl p-6`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-sm text-gray-200 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-300">{subtitle}</p>}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-400" />
          Spending Analytics
        </h2>
        <p className="text-gray-400">
          Detailed insights into your spending patterns
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          icon={Calendar}
          title="Daily Average"
          value={formatAmount(insights.dailyAverage)}
          subtitle="Average spending per day this month"
          color="from-blue-500/20 to-blue-500/5 border-blue-500"
        />
        
        <InsightCard
          icon={Target}
          title="Projected Month End"
          value={formatAmount(insights.projectedMonthEnd)}
          subtitle={`${insights.daysRemaining} days remaining`}
          color="from-purple-500/20 to-purple-500/5 border-purple-500"
        />
        
        <InsightCard
          icon={insights.change >= 0 ? TrendingUp : TrendingDown}
          title="Month-over-Month"
          value={`${insights.change >= 0 ? '+' : ''}${insights.change.toFixed(1)}%`}
          subtitle="Compared to last month"
          color={insights.change >= 0 
            ? "from-red-500/20 to-red-500/5 border-red-500"
            : "from-green-500/20 to-green-500/5 border-green-500"
          }
        />
        
        <InsightCard
          icon={Award}
          title="Highest Spending Day"
          value={`Day ${insights.topDay.day}`}
          subtitle={formatAmount(insights.topDay.amount * (1 / convertFromINR(1)))}
          color="from-yellow-500/20 to-yellow-500/5 border-yellow-500"
        />
      </div>

      {/* Budget Progress Alert */}
      {monthlyBudget > 0 && (
        <div className={`p-4 rounded-xl border ${
          insights.projectedMonthEnd > monthlyBudget
            ? 'bg-red-900/20 border-red-800'
            : 'bg-green-900/20 border-green-800'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-6 h-6 mt-0.5 ${
              insights.projectedMonthEnd > monthlyBudget ? 'text-red-400' : 'text-green-400'
            }`} />
            <div>
              <h3 className={`font-semibold ${
                insights.projectedMonthEnd > monthlyBudget ? 'text-red-300' : 'text-green-300'
              }`}>
                {insights.projectedMonthEnd > monthlyBudget 
                  ? '⚠️ Budget Warning' 
                  : '✅ On Track'
                }
              </h3>
              <p className={`text-sm ${
                insights.projectedMonthEnd > monthlyBudget ? 'text-red-400' : 'text-green-400'
              }`}>
                {insights.projectedMonthEnd > monthlyBudget
                  ? `At current rate, you'll exceed budget by ${formatAmount(insights.projectedMonthEnd - monthlyBudget)}`
                  : `You're on track to stay within budget. Keep it up!`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Spending Chart */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Daily Spending This Month
        </h3>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF"
                label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            No spending data for this month yet
          </div>
        )}
      </div>

      {/* Weekly Trend */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Weekly Spending Trend
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="spending"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ fill: '#EF4444', r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          💡 Smart Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start">
            <span className="mr-2">📊</span>
            <span>Your daily average is {formatAmount(insights.dailyAverage)}. Try to stay below this to end the month under budget.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎯</span>
            <span>Based on current spending, you have {insights.daysRemaining} days to stay on track.</span>
          </li>
          {insights.change > 0 && (
            <li className="flex items-start">
              <span className="mr-2">⚠️</span>
              <span>Spending is up {insights.change.toFixed(1)}% compared to last month. Consider reviewing your expenses.</span>
            </li>
          )}
          {insights.change < 0 && (
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Great job! Spending is down {Math.abs(insights.change).toFixed(1)}% from last month.</span>
            </li>
          )}
        </ul>
      </div>
    </motion.div>
  );
};

export default SpendingAnalytics;

