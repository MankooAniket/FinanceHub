import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTransactions } from '../contexts/TransactionContext';
import { toast } from 'react-hot-toast';

const ExpenseForm = () => {
  const { addTransaction } = useTransactions();

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    referral: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Expense name is required');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Enter valid amount');
      return;
    }

    addTransaction({
      ...formData,
      type: 'expense',
      amount: parseFloat(formData.amount),
    });

    setFormData({
      name: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      referral: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-4 text-white">
        Add Expense
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300">
            Expense Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-md bg-gray-700 text-white p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300">
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
            className="mt-1 w-full rounded-md bg-gray-700 text-white p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 w-full rounded-md bg-gray-700 text-white p-2"
          >
            {['Food', 'Transportation', 'Entertainment', 'Utilities', 'Other'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 w-full rounded-md bg-gray-700 text-white p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300">
            Referral (Optional)
          </label>
          <input
            type="text"
            name="referral"
            value={formData.referral}
            onChange={handleChange}
            className="mt-1 w-full rounded-md bg-gray-700 text-white p-2"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full py-2 bg-blue-600 rounded-md hover:bg-blue-700 text-white flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ExpenseForm;
