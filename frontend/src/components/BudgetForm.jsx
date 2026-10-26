import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBudget } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';

const BudgetForm = () => {
  const { monthlyBudget, updateBudget } = useBudget();
  const { formatAmount, convertToINR, convertFromINR, currencySymbol } = useCurrency();
  
  // Display budget in selected currency
  const [displayAmount, setDisplayAmount] = useState(
    convertFromINR(monthlyBudget).toFixed(2)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Convert displayed amount to INR before saving
      const amountInINR = convertToINR(parseFloat(displayAmount));
      updateBudget(amountInINR);
      toast.success('Monthly budget updated!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
        Set Monthly Budget
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Budget Amount ({currencySymbol})
          </label>
          <input
            type="number"
            value={displayAmount}
            onChange={(e) => setDisplayAmount(e.target.value)}
            min="0"
            step="0.01"
            required
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Enter budget amount"
          />
          <p className="text-xs text-gray-400 mt-1">
            Current: {formatAmount(monthlyBudget)}
          </p>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Budget
        </button>
      </form>
    </motion.div>
  );
};

export default BudgetForm;