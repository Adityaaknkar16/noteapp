import Bill from "../models/bill.model.js";
import Transaction from "../models/transaction.model.js";
import { errorHandler } from "../utilies/error.js";
import moment from "moment";

export const addBill = async (req, res, next) => {
  const { title, amount, dueDate, category, isRecurring, recurrenceInterval } = req.body;
  const userId = req.user.id;

  if (!title || amount === undefined || !dueDate) {
    return next(errorHandler(400, "Title, amount, and due date are required"));
  }

  try {
    const bill = new Bill({
      userId,
      title,
      amount: Number(amount),
      dueDate,
      category: category || "Other",
      isRecurring: !!isRecurring,
      recurrenceInterval: isRecurring ? recurrenceInterval : null,
      isPaid: false
    });

    await bill.save();

    res.status(201).json({
      success: true,
      message: "Bill added successfully",
      bill,
    });
  } catch (error) {
    next(error);
  }
};

export const getBills = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const bills = await Bill.find({ userId }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      message: "Bills retrieved successfully",
      bills,
    });
  } catch (error) {
    next(error);
  }
};

export const editBill = async (req, res, next) => {
  const { billId } = req.params;
  const { title, amount, dueDate, category, isRecurring, recurrenceInterval, isPaid } = req.body;
  const userId = req.user.id;

  try {
    const bill = await Bill.findOne({ _id: billId, userId });
    if (!bill) {
      return next(errorHandler(404, "Bill not found"));
    }

    if (title !== undefined) bill.title = title;
    if (amount !== undefined) bill.amount = Number(amount);
    if (dueDate !== undefined) bill.dueDate = dueDate;
    if (category !== undefined) bill.category = category;
    if (isRecurring !== undefined) bill.isRecurring = !!isRecurring;
    if (recurrenceInterval !== undefined) bill.recurrenceInterval = isRecurring ? recurrenceInterval : null;
    if (isPaid !== undefined) bill.isPaid = isPaid;

    await bill.save();

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      bill,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBill = async (req, res, next) => {
  const { billId } = req.params;
  const userId = req.user.id;

  try {
    const bill = await Bill.findOneAndDelete({ _id: billId, userId });
    if (!bill) {
      return next(errorHandler(404, "Bill not found"));
    }

    res.status(200).json({
      success: true,
      message: "Bill deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingBills = async (req, res, next) => {
  const userId = req.user.id;
  const today = moment().format("YYYY-MM-DD");
  const sevenDaysLater = moment().add(7, "days").format("YYYY-MM-DD");

  try {
    // Unpaid bills due in the next 7 days, or overdue (due date < today) and unpaid
    const bills = await Bill.find({
      userId,
      isPaid: false,
      dueDate: { $lte: sevenDaysLater }
    }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      message: "Upcoming bills retrieved successfully",
      bills,
    });
  } catch (error) {
    next(error);
  }
};

export const markBillAsPaid = async (req, res, next) => {
  const { billId } = req.params;
  const userId = req.user.id;

  try {
    const bill = await Bill.findOne({ _id: billId, userId });
    if (!bill) {
      return next(errorHandler(404, "Bill not found"));
    }

    if (bill.isPaid) {
      return res.status(200).json({
        success: true,
        message: "Bill was already paid",
        bill
      });
    }

    bill.isPaid = true;
    await bill.save();

    // Create an expense transaction in the Budget module
    const todayStr = moment().format("YYYY-MM-DD");
    const transaction = new Transaction({
      userId,
      type: "expense",
      category: bill.category || "Bills",
      amount: bill.amount,
      note: `Paid Bill: ${bill.title}`,
      date: todayStr,
    });
    await transaction.save();

    let nextBill = null;
    // If recurring, create the next occurrence
    if (bill.isRecurring && bill.recurrenceInterval) {
      let nextDueDate = moment(bill.dueDate);
      if (bill.recurrenceInterval === "monthly") {
        nextDueDate = nextDueDate.add(1, "month");
      } else if (bill.recurrenceInterval === "yearly") {
        nextDueDate = nextDueDate.add(1, "year");
      }

      nextBill = new Bill({
        userId,
        title: bill.title,
        amount: bill.amount,
        dueDate: nextDueDate.format("YYYY-MM-DD"),
        category: bill.category,
        isRecurring: bill.isRecurring,
        recurrenceInterval: bill.recurrenceInterval,
        isPaid: false
      });
      await nextBill.save();
    }

    res.status(200).json({
      success: true,
      message: "Bill marked as paid, expense logged to budget",
      bill,
      nextBill,
    });
  } catch (error) {
    next(error);
  }
};
