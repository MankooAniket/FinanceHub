// frontend/src/components/DashboardOverview.jsx - COMPLETE WITH CHARTS

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';

const DashboardOverview = ({ transactions = [], totalIncome = 0, totalExpenses = 0 }) => {

  // 🔥 SAFE CONTEXT ACCESS (NO CRASH)
  const currencyContext = useCurrency();

  const currency = currencyContext?.currency ?? 'INR';
  const symbol = currencyContext?.currencySymbol ?? '₹';

  const formatAmount =
    typeof currencyContext?.formatAmount === 'function'
      ? currencyContext.formatAmount
      : (amt) => `${symbol}${amt}`;

  // 🔥 FIXED CURRENCY FORMAT (NO EXTRA .00)
  const formatCurrency = (amount) => {
    let num = parseFloat(amount);
    if (isNaN(num)) num = 0;

    return formatAmount(num);
  };

  const currentBalance = Number(totalIncome) - Number(totalExpenses);

  // ================= MONTHLY DATA =================
  const monthlyData = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthlyIncome = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'income' &&
          d.getMonth() === month &&
          d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const monthlyExpenses = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' &&
          d.getMonth() === month &&
          d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return {
      monthlyIncome,
      monthlyExpenses,
      savings: monthlyIncome - monthlyExpenses,
    };
  }, [transactions]);

  // ================= CATEGORY PIE =================
  const expensesByCategory = useMemo(() => {
    const categories = {};

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Other';
        categories[cat] = (categories[cat] || 0) + parseFloat(t.amount || 0);
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [transactions]);

  // ================= INCOME CATEGORY PIE =================
  const incomeByCategory = useMemo(() => {
    const categories = {};

    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const cat = t.category || 'Other';
        categories[cat] = (categories[cat] || 0) + parseFloat(t.amount || 0);
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  // ================= LAST 6 MONTHS BAR =================
  const last6MonthsData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();

      const income = transactions
        .filter(t => {
          const td = new Date(t.date);
          return t.type === 'income' &&
            td.getMonth() === month &&
            td.getFullYear() === year;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const expenses = transactions
        .filter(t => {
          const td = new Date(t.date);
          return t.type === 'expense' &&
            td.getMonth() === month &&
            td.getFullYear() === year;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        Income: income,
        Expenses: expenses,
        Savings: income - expenses,
      });
    }

    return months;
  }, [transactions]);

  // ================= DAILY TREND (LAST 7 DAYS) =================
  const last7DaysData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayIncome = transactions
        .filter(t => {
          const td = new Date(t.date);
          return t.type === 'income' && td.toISOString().split('T')[0] === dateStr;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const dayExpenses = transactions
        .filter(t => {
          const td = new Date(t.date);
          return t.type === 'expense' && td.toISOString().split('T')[0] === dateStr;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        Income: dayIncome,
        Expenses: dayExpenses,
      });
    }

    return days;
  }, [transactions]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">

      {/* ================= TOP CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Income</h3>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(totalIncome)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Expenses</h3>
            <div className="p-2 bg-red-500/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(totalExpenses)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Current Balance</h3>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(currentBalance)}
          </p>
        </motion.div>

      </div>

      {/* ================= MONTH SUMMARY ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-blue-400" />
          This Month Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm mb-2">Income</p>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(monthlyData.monthlyIncome)}
            </p>
          </div>

          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm mb-2">Expenses</p>
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(monthlyData.monthlyExpenses)}
            </p>
          </div>

          <div className="bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm mb-2">Savings</p>
            <p className={`text-2xl font-bold ${monthlyData.savings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatCurrency(monthlyData.savings)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ================= CHARTS ROW 1 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart - Last 6 Months */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Income vs Expenses (Last 6 Months)
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last6MonthsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value) => formatCurrency(value)} 
              />
              <Legend />
              <Bar dataKey="Income" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Expenses" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line Chart - Savings Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Savings Trend (Last 6 Months)
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last6MonthsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value) => formatCurrency(value)} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Savings" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* ================= CHARTS ROW 2 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart - Expense Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Expenses by Category
          </h3>

          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => formatCurrency(value)} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No expense data available
            </div>
          )}
        </motion.div>

        {/* Pie Chart - Income Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Income by Category
          </h3>

          {incomeByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => formatCurrency(value)} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No income data available
            </div>
          )}
        </motion.div>

      </div>

      {/* ================= AREA CHART - DAILY TREND ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Daily Trend (Last 7 Days)
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={last7DaysData}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              formatter={(value) => formatCurrency(value)} 
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="Income" 
              stroke="#10B981" 
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
            <Area 
              type="monotone" 
              dataKey="Expenses" 
              stroke="#EF4444" 
              fillOpacity={1} 
              fill="url(#colorExpenses)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

    </div>
  );
};

export default DashboardOverview;