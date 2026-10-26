import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, ShoppingCart, Trash2, Edit, Download, AlertTriangle, Undo } from 'lucide-react';
import { useTransactions } from '../contexts/TransactionContext';
import AdvancedFilters from './AdvancedFilters';
import { toast } from 'react-hot-toast';

const TransactionList = ({ type }) => {
  const { transactions, deleteTransaction, editTransaction, loading } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletedTransaction, setDeletedTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });

  const categories = type === 'expense' 
    ? ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Other']
    : ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

  const handleDelete = async (id) => {
    const transaction = displayedTransactions.find(t => t._id === id);
    setDeletedTransaction(transaction);
    await deleteTransaction(id, type);
    setDeleteConfirm(null);
    
    // Show undo toast
    toast.success(
      (t) => (
        <div className="flex items-center justify-between">
          <span>Transaction deleted</span>
          <button
            onClick={() => handleUndo(transaction)}
            className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Undo className="w-4 h-4 mr-1" />
            Undo
          </button>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const handleUndo = async (transaction) => {
    // Re-add the transaction
    const { _id, ...transactionData } = transaction;
    await editTransaction(_id, transactionData);
    setDeletedTransaction(null);
    toast.success('Transaction restored!');
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await editTransaction(editingTransaction._id, editingTransaction);
    setEditingTransaction(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingTransaction(prev => ({ ...prev, [name]: value }));
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Amount', 'Category', 'Date', 'Referral'];
    const csvData = displayedTransactions.map(t => [
      t.name,
      t.amount,
      t.category,
      new Date(t.date).toLocaleDateString(),
      t.referral || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully!');
  };

  // Apply filters
  const applyFilters = (transactionsList) => {
    return transactionsList.filter(t => {
      // Type filter
      if (t.type !== type) return false;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!t.name.toLowerCase().includes(searchLower) && 
            !t.category.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'All' && t.category !== filters.category) {
        return false;
      }

      // Date from filter
      if (filters.dateFrom) {
        const transactionDate = new Date(t.date);
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) return false;
      }

      // Date to filter
      if (filters.dateTo) {
        const transactionDate = new Date(t.date);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59); // Include the entire day
        if (transactionDate > toDate) return false;
      }

      // Amount min filter
      if (filters.amountMin && parseFloat(t.amount) < parseFloat(filters.amountMin)) {
        return false;
      }

      // Amount max filter
      if (filters.amountMax && parseFloat(t.amount) > parseFloat(filters.amountMax)) {
        return false;
      }

      return true;
    });
  };

  const displayedTransactions = applyFilters(transactions);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-white">Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <AdvancedFilters 
        onFilterChange={setFilters} 
        type={type}
      />

      {/* Transaction List */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-white">
              {type === 'expense' ? 'Expenses' : 'Income'}
            </h3>
            <p className="text-gray-400 mt-1">
              {displayedTransactions.length} transaction{displayedTransactions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {displayedTransactions.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
        </div>

        {displayedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg">No transactions found</p>
            <p className="text-gray-500 text-sm mt-2">
              {filters.search || filters.category !== 'All' || filters.dateFrom || filters.dateTo
                ? 'Try adjusting your filters'
                : `Start by adding your first ${type}`}
            </p>
          </div>
        ) : (
          <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {displayedTransactions.map((transaction) => (
                <motion.li
                  key={transaction._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg ${
                    type === 'expense' 
                      ? 'bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20' 
                      : 'bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20'
                  } hover:shadow-lg transition-all`}
                >
                  {editingTransaction && editingTransaction._id === transaction._id ? (
                    <form onSubmit={handleUpdate} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          name="name"
                          value={editingTransaction.name}
                          onChange={handleChange}
                          placeholder="Transaction name"
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          name="amount"
                          value={editingTransaction.amount}
                          onChange={handleChange}
                          step="0.01"
                          placeholder="Amount"
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          name="category"
                          value={editingTransaction.category}
                          onChange={handleChange}
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          name="date"
                          value={editingTransaction.date?.split('T')[0] || ''}
                          onChange={handleChange}
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <input
                        type="text"
                        name="referral"
                        value={editingTransaction.referral || ''}
                        onChange={handleChange}
                        placeholder="Referral (optional)"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex space-x-2">
                        <button 
                          type="submit" 
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditingTransaction(null)} 
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${
                          type === 'income' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
                        }`}>
                          {type === 'income' ? (
                            <DollarSign className="w-5 h-5 text-green-400" />
                          ) : (
                            <ShoppingCart className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">{transaction.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                              {transaction.category}
                            </span>
                            {transaction.referral && (
                              <span className="text-xs text-gray-500">
                                Ref: {transaction.referral}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`font-bold text-xl ${
                            type === 'expense' ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(transaction)}
                            className="p-2 rounded-lg bg-blue-500 bg-opacity-20 hover:bg-opacity-30 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteConfirm(transaction._id)}
                            className="p-2 rounded-lg bg-red-500 bg-opacity-20 hover:bg-opacity-30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-500 bg-opacity-20 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Delete Transaction?
              </h3>
              <p className="text-gray-400 text-center mb-6">
                Are you sure you want to delete this transaction? You can undo this action within 5 seconds.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
    </div>
  );
};

export default TransactionList;