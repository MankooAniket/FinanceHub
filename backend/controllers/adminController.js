const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $lookup: {
          from: 'expenses',
          localField: '_id',
          foreignField: 'user',
          as: 'expenses'
        }
      },
      {
        $lookup: {
          from: 'incomes',
          localField: '_id',
          foreignField: 'user',
          as: 'incomes'
        }
      },
      {
        $project: {
          username: 1,
          email: 1,
          createdAt: 1,
          totalExpenses: { $sum: '$expenses.amount' },
          totalIncome: { $sum: '$incomes.amount' },
          balance: { $subtract: [{ $sum: '$incomes.amount' }, { $sum: '$expenses.amount' }] }
        }
      },
      { $sort: { balance: -1 } }
    ]);

    res.json(userStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOverallStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalIncome = await Income.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyData = await Income.aggregate([
      {
        $group: {
          _id: { $month: '$date' },
          income: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const expenseData = await Expense.aggregate([
      {
        $group: {
          _id: { $month: '$date' },
          expense: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyStats = monthlyData.map(income => {
      const expense = expenseData.find(e => e._id === income._id) || { expense: 0 };
      return {
        month: income._id,
        income: income.income,
        expense: expense.expense
      };
    });

    res.json({
      totalUsers,
      totalExpenses: totalExpenses[0]?.total || 0,
      totalIncome: totalIncome[0]?.total || 0,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

