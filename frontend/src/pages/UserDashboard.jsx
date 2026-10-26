import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import ExpenseForm from '../components/ExpenseForm';
import IncomeForm from '../components/IncomeForm';
import TransactionList from '../components/TransactionList';
import DashboardOverview from '../components/DashboardOverview';
import Profile from '../components/Profile';
import SmartAlerts from '../components/SmartAlerts';
import Reports from '../components/Reports';
import BudgetComparison from '../components/BudgetComparison';
import CategoryBudget from '../components/CategoryBudget';
import SpendingAnalytics from '../components/SpendingAnalytics';
import BudgetGoals from '../components/BudgetGoals';
import BudgetTemplates from '../components/BudgetTemplates';
import AiChatbot from '../components/AiChatbot';
import AiInsights from '../components/AiInsights';

// Contexts
import { useTransactions } from '../contexts/TransactionContext';

const UserDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const navigate = useNavigate();

  const {
    transactions,
    totalIncome,
    totalExpenses,
    loading
  } = useTransactions();

  // Redirect to login if there is no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">

      {/* ✅ HEADER */}
      <Header />

      <div className="flex flex-1">

        {/* ✅ SIDEBAR */}
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        {/* ✅ MAIN CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {/* DASHBOARD */}
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                <SmartAlerts
                  transactions={transactions}
                  totalIncome={totalIncome}
                  totalExpenses={totalExpenses}
                />

                <DashboardOverview
                  transactions={transactions}
                  totalIncome={totalIncome}
                  totalExpenses={totalExpenses}
                />
              </div>
            )}

            {/* BUDGET SECTION */}
            {activeView === 'budget' && <BudgetComparison />}
            {activeView === 'categories' && <CategoryBudget />}
            {activeView === 'analytics' && <SpendingAnalytics />}
            {activeView === 'goals' && <BudgetGoals />}
            {activeView === 'templates' && <BudgetTemplates />}

            {/* AI INSIGHTS */}
            {activeView === 'ai-insights' && (
              <AiInsights
                transactions={transactions}
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
              />
            )}

            {/* EXPENSES */}
            {activeView === 'expenses' && (
              <div className="space-y-8">
                <ExpenseForm />
                <TransactionList
                  transactions={transactions}
                  type="expense"
                />
              </div>
            )}

            {/* INCOME */}
            {activeView === 'income' && (
              <div className="space-y-8">
                <IncomeForm />
                <TransactionList
                  transactions={transactions}
                  type="income"
                />
              </div>
            )}

            {/* REPORTS */}
            {activeView === 'reports' && (
              <Reports
                transactions={transactions}
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
              />
            )}

            {/* PROFILE */}
            {activeView === 'profile' && <Profile />}
          </motion.div>
        </main>
      </div>

      {/* ✅ FOOTER */}
      <Footer />

      {/* ✅ AI CHATBOT - Floating */}
      <AiChatbot />
    </div>
  );
};

export default UserDashboard;
