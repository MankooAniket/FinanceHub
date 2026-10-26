import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTransactions } from '../contexts/TransactionContext';

const IncomeForm = () => {
  const { addTransaction } = useTransactions();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Salary',
    date: new Date().toISOString().split('T')[0],
    referral: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      ...formData,
      type: 'income',
      amount: parseFloat(formData.amount),
    });
    setFormData({
      name: '',
      amount: '',
      category: 'Salary',
      date: new Date().toISOString().split('T')[0],
      referral: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-4 text-white">Add Income</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Income Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-green-500 focus:bg-gray-600 focus:ring-0 text-white"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-green-500 focus:bg-gray-600 focus:ring-0 text-white"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-green-500 focus:bg-gray-600 focus:ring-0 text-white"
          >
            {['Salary', 'Freelance', 'Investment', 'Gift', 'Other'].map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-green-500 focus:bg-gray-600 focus:ring-0 text-white"
          />
        </div>
        <div>
          <label htmlFor="referral" className="block text-sm font-medium text-gray-300">Referral</label>
          <input
            type="text"
            id="referral"
            name="referral"
            value={formData.referral}
            onChange={handleChange}
            placeholder="Optional"
            className="mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-green-500 focus:bg-gray-600 focus:ring-0 text-white"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="inline-block w-5 h-5 mr-2" />
          Add Income
        </motion.button>
      </form>
    </motion.div>
  );
};

export default IncomeForm;

