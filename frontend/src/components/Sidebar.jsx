import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  DollarSign,
  CreditCard,
  User,
  LogOut,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import CurrencySelector from "./CurrencySelector";
// ❌ BudgetNotifications removed

const Sidebar = ({ setActiveView, activeView }) => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", view: "dashboard" },
    { icon: DollarSign, label: "Income", view: "income" },
    { icon: CreditCard, label: "Expenses", view: "expenses" },
    { icon: BarChart3, label: "Budget", view: "budget" },
    { icon: PieChart, label: "Categories", view: "categories" },
    { icon: TrendingUp, label: "Analytics", view: "analytics" },
    { icon: Target, label: "Goals", view: "goals" },
    { icon: FileText, label: "Templates", view: "templates" },
    { icon: Brain, label: "AI Insights", view: "ai-insights" },
    { icon: FileText, label: "Reports", view: "reports" },
    { icon: User, label: "Profile", view: "profile" },
  ];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="bg-gray-900 text-white w-64 min-h-screen p-4 flex flex-col"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Finance Tracker</h2>
          {username && (
            <p className="mt-2 text-gray-400">Hi, {username}</p>
          )}
        </div>

        <CurrencySelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => setActiveView(item.view)}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors duration-200 ${
                  activeView === item.view
                    ? "bg-blue-600"
                    : "hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full p-2 rounded-lg transition-colors duration-200 hover:bg-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;

