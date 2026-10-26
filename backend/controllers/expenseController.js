const Expense = require('../models/Expense');

exports.addExpense = async (req, res) => {
  try {
    const { name, amount, category, date, referral } = req.body;
    const expense = await Expense.create({
      user: req.user.id,
      name,
      amount,
      category,
      date,
      referral,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, category, date, referral } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { name, amount, category, date, referral },
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, user: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.searchExpenses = async (req, res) => {
    try {
      const { query } = req.query;
      const expenses = await Expense.find({
        user: req.user.id,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }).sort({ date: -1 });
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  exports.filterExpenses = async (req, res) => {
    try {
      const { category } = req.query;
      const expenses = await Expense.find({
        user: req.user.id,
        category: category
      }).sort({ date: -1 });
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  

