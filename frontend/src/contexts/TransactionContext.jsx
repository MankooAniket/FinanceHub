import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TransactionContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('⚠️ No token, skipping transaction fetch (this is OK on landing page)');
        setLoading(false);
        return;
      }

      const [expensesRes, incomesRes] = await Promise.all([
        axios.get(`${API_URL}/api/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/incomes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const expenses = expensesRes.data.map(e => ({
        ...e,
        type: 'expense',
      }));

      const incomes = incomesRes.data.map(i => ({
        ...i,
        type: 'income',
      }));

      const allTransactions = [...expenses, ...incomes].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setTransactions(allTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      setLoading(false);

      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        const token = localStorage.getItem('token');
        if (token) {
          toast.error('Failed to fetch transactions.');
        }
      }
    }
  };

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => {
        const amount = parseFloat(t.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => {
        const amount = parseFloat(t.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    setTotalIncome(income);
    setTotalExpenses(expenses);
  };

  const addTransaction = async (transaction) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please login first.');
        navigate('/login');
        return;
      }

      const amount = parseFloat(transaction.amount);

      if (isNaN(amount) || amount <= 0) {
        toast.error('Enter valid amount.');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/${transaction.type}s`,
        { ...transaction, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTransaction = {
        ...response.data,
        type: transaction.type,
      };

      setTransactions(prev => [newTransaction, ...prev]);

      toast.success(`${transaction.type} added successfully!`);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  const deleteTransaction = async (id, type) => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `${API_URL}/api/${type}s/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTransactions(prev =>
        prev.filter(t => t._id !== id)
      );

      toast.success('Transaction deleted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete transaction');
    }
  };

  const editTransaction = async (id, updatedTransaction) => {
    try {
      const token = localStorage.getItem('token');

      const amount = parseFloat(updatedTransaction.amount);

      if (isNaN(amount) || amount <= 0) {
        toast.error('Enter valid amount.');
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/${updatedTransaction.type}s/${id}`,
        { ...updatedTransaction, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTransactions(prev =>
        prev.map(t =>
          t._id === id
            ? { ...response.data, type: updatedTransaction.type }
            : t
        )
      );

      toast.success('Transaction updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update transaction');
    }
  };

  const searchTransactions = (query, type) => {
    return transactions.filter(t =>
      t.type === type &&
      (t.name?.toLowerCase().includes(query.toLowerCase()) ||
        t.category?.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const filterTransactions = (type, category) => {
    return transactions.filter(t =>
      t.type === type &&
      (category === 'All' || t.category === category)
    );
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        totalIncome,
        totalExpenses,
        loading,
        fetchTransactions,
        addTransaction,
        deleteTransaction,
        editTransaction,
        searchTransactions,
        filterTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};