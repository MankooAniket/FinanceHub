import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, RefreshCw, Plus, Edit2, Trash2, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTransactions } from '../contexts/TransactionContext';

const RecurringTransactions = () => {
  const { addTransaction } = useTransactions();
  const [recurringItems, setRecurringItems] = useState(() => {
    const saved = localStorage.getItem('recurringTransactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    type: 'expense',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    dayOfMonth: new Date().getDate(),
    isActive: true,
  });

  useEffect(() => {
    localStorage.setItem('recurringTransactions', JSON.stringify(recurringItems));
  }, [recurringItems]);

  // Check and process recurring transactions
  useEffect(() => {
    const checkRecurring = () => {
      const today = new Date();
      const todayDate = today.getDate();
      
      recurringItems.forEach(item => {
        if (!item.isActive) return;
        
        const lastProcessed = item.lastProcessed ? new Date(item.lastProcessed) : null;
        
        // Check if we should process today
        const shouldProcess = item.frequency === 'monthly' && 
                             todayDate === item.dayOfMonth &&
                             (!lastProcessed || lastProcessed.getMonth() !== today.getMonth());
        
        if (shouldProcess) {
          processRecurringTransaction(item);
        }
      });
    };

    checkRecurring();
    // Check daily at midnight
    const interval = setInterval(checkRecurring, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [recurringItems]);

  const processRecurringTransaction = async (item) => {
    try {
      await addTransaction({
        name: `${item.name} (Auto)`,
        amount: parseFloat(item.amount),
        category: item.category,
        type: item.type,
        date: new Date().toISOString(),
        referral: 'Recurring Transaction',
      });

      // Update last processed date
      setRecurringItems(prev =>
        prev.map(ri =>
          ri.id === item.id
            ? { ...ri, lastProcessed: new Date().toISOString() }
            : ri
        )
      );

      toast.success(`✓ Recurring transaction added: ${item.name}`);
    } catch (error) {
      console.error('Failed to process recurring transaction:', error);
      toast.error(`Failed to add recurring transaction: ${item.name}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingItem) {
      setRecurringItems(prev =>
        prev.map(item =>
          item.id === editingItem.id ? { ...formData, id: item.id } : item
        )
      );
      toast.success('Recurring transaction updated!');
    } else {
      const newItem = {
        ...formData,
        id: Date.now().toString(),
        lastProcessed: null,
      };
      setRecurringItems(prev => [...prev, newItem]);
      toast.success('Recurring transaction created!');
    }

    resetForm();
  };

  const handleDelete = (id) => {
    setRecurringItems(prev => prev.filter(item => item.id !== id));
    toast.success('Recurring transaction deleted!');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddForm(true);
  };

  const toggleActive = (id) => {
    setRecurringItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      amount: '',
      category: '',
      type: 'expense',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: new Date().getDate(),
      isActive: true,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getNextOccurrence = (item) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let nextDate = new Date(currentYear, currentMonth, item.dayOfMonth);
    
    if (nextDate < today) {
      nextDate = new Date(currentYear, currentMonth + 1, item.dayOfMonth);
    }
    
    return nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Other'],
    expense: ['Rent', 'Subscription', 'Utilities', 'Insurance', 'Loan Payment', 'Other'],
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <RefreshCw className="w-6 h-6 mr-2 text-blue-400" />
              Recurring Transactions
            </h2>
            <p className="text-gray-400 mt-1">Automate your regular income and expenses</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Recurring
          </motion.button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingItem ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Monthly Salary, Netflix Subscription"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories[formData.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    {/* Future: Add weekly, yearly options */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Day of Month
                  </label>
                  <input
                    type="number"
                    name="dayOfMonth"
                    value={formData.dayOfMonth}
                    onChange={handleChange}
                    required
                    min="1"
                    max="31"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recurring Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurringItems.length === 0 ? (
          <div className="col-span-2 bg-gray-800 rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Recurring Transactions</h3>
            <p className="text-gray-400 mb-4">
              Set up automatic transactions for your regular income and expenses
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First
            </button>
          </div>
        ) : (
          recurringItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 ${
                item.type === 'income' ? 'border-green-500' : 'border-red-500'
              } ${!item.isActive && 'opacity-50'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    item.type === 'income' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
                  }`}>
                    <RefreshCw className={`w-5 h-5 ${
                      item.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.category}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount</span>
                  <span className={`text-xl font-bold ${
                    item.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.type === 'income' ? '+' : '-'}${parseFloat(item.amount).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Next Occurrence
                  </span>
                  <span className="text-white">{getNextOccurrence(item)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Frequency</span>
                  <span className="text-white capitalize">{item.frequency}</span>
                </div>

                {item.lastProcessed && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Last Processed</span>
                    <span className="text-white">
                      {new Date(item.lastProcessed).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-700">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-400">Active</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={() => toggleActive(item.id)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors ${
                        item.isActive ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          item.isActive && 'transform translate-x-4'
                        }`} />
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Info Section */}
      {recurringItems.length > 0 && (
        <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">How it works:</p>
              <p>
                Recurring transactions are automatically added to your account on their scheduled day each month.
                You'll receive a notification when a transaction is processed.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RecurringTransactions;

