const Income = require('../models/Income');

exports.addIncome = async (req, res) => {
  try {
    const { name, amount, category, date, referral } = req.body;
    const income = await Income.create({
      user: req.user.id,
      name,
      amount,
      category,
      date,
      referral,
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, category, date, referral } = req.body;
    const income = await Income.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { name, amount, category, date, referral },
      { new: true }
    );
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await Income.findOneAndDelete({ _id: id, user: req.user.id });
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.searchIncomes = async (req, res) => {
    try {
      const { query } = req.query;
      const incomes = await Income.find({
        user: req.user.id,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }).sort({ date: -1 });
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  exports.filterIncomes = async (req, res) => {
    try {
      const { category } = req.query;
      const incomes = await Income.find({
        user: req.user.id,
        category: category
      }).sort({ date: -1 });
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };