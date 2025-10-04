const Expense = require("../models/Expense");

exports.getExpenses = async (req, res) => {
  const expenses = await Expense.find({ company: req.user.company });
  res.json(expenses);
};

exports.createExpense = async (req, res) => {
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
  });
  await expense.save();
  res.json(expense);
};

exports.updateExpenseStatus = async (req, res) => {
  const { status, currentApprovalStep } = req.body;
  const expense = await Expense.findByIdAndUpdate(
    req.params.id,
    { status, currentApprovalStep },
    { new: true }
  );
  res.json(expense);
};
