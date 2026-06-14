import Transaction from "../models/transaction.model.js";
import { errorHandler } from "../utilies/error.js";
import moment from "moment";

export const addTransaction = async (req, res, next) => {
  const { type, category, amount, note, date } = req.body;
  const userId = req.user.id;

  if (!type || !category || !amount || !date) {
    return next(errorHandler(400, "Type, category, amount, and date are required"));
  }

  try {
    const transaction = new Transaction({
      userId,
      type,
      category,
      amount,
      note: note || "",
      date,
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  const userId = req.user.id;
  const { month, type } = req.query; // YYYY-MM

  try {
    const query = { userId };
    if (type) {
      query.type = type;
    }
    if (month) {
      // Filter by date starting with YYYY-MM
      query.date = { $regex: `^${month}` };
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const editTransaction = async (req, res, next) => {
  const { transactionId } = req.params;
  const { type, category, amount, note, date } = req.body;
  const userId = req.user.id;

  try {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });

    if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
    }

    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (amount !== undefined) transaction.amount = amount;
    if (note !== undefined) transaction.note = note;
    if (date !== undefined) transaction.date = date;

    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  const { transactionId } = req.params;
  const userId = req.user.id;

  try {
    const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId });

    if (!transaction) {
      return next(errorHandler(404, "Transaction not found"));
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req, res, next) => {
  const userId = req.user.id;
  const month = req.query.month || moment().format("YYYY-MM"); // YYYY-MM

  try {
    const transactions = await Transaction.find({
      userId,
      date: { $regex: `^${month}` },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSavings = 0;

    const categoryMap = {}; // Group expenses by category
    const dailyMap = {}; // Group daily totals

    // Initialize all days of the selected month in dailyMap
    const daysInMonth = moment(month, "YYYY-MM").daysInMonth();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month}-${String(d).padStart(2, "0")}`;
      dailyMap[dateStr] = { date: dateStr, expense: 0, income: 0, saving: 0 };
    }

    transactions.forEach((tx) => {
      const amt = tx.amount;
      if (tx.type === "income") {
        totalIncome += amt;
        if (dailyMap[tx.date]) dailyMap[tx.date].income += amt;
      } else if (tx.type === "expense") {
        totalExpense += amt;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + amt;
        if (dailyMap[tx.date]) dailyMap[tx.date].expense += amt;
      } else if (tx.type === "saving") {
        totalSavings += amt;
        if (dailyMap[tx.date]) dailyMap[tx.date].saving += amt;
      }
    });

    const balance = totalIncome - totalExpense - totalSavings;

    // Convert category breakdown map to array
    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      total: categoryMap[cat],
    }));

    // Convert daily totals map to sorted array
    const dailyTotals = Object.keys(dailyMap)
      .sort()
      .map((date) => dailyMap[date]);

    res.status(200).json({
      success: true,
      month,
      summary: {
        totalIncome,
        totalExpense,
        totalSavings,
        balance,
        categoryBreakdown,
        dailyTotals,
      },
    });
  } catch (error) {
    next(error);
  }
};
