import Expense from "../models/Expense.js";

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ company: req.user.company }).populate(
      "employee category"
    );
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const {
      category,
      description,
      amountOriginal,
      currencyOriginal,
      amountConverted,
      receiptUrl,
      dateIncurred,
    } = req.body;

    const expense = new Expense({
      employee: req.user.id,
      company: req.user.company,
      category,
      description,
      amountOriginal,
      currencyOriginal,
      amountConverted,
      receiptUrl,
      dateIncurred,
      status: "pending",
      currentApprovalStep: 0,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error("Create Expense Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateExpenseStatus = async (req, res) => {
  try {
    const { status, currentApprovalStep } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { status, currentApprovalStep },
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(expense);
  } catch (error) {
    console.error("Update Expense Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
