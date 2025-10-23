import Expense from "../models/Expense.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import ApprovalRule from "../models/ApprovalRule.js";
import axios from "axios";

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
      receiptUrl,
      dateIncurred,
    } = req.body;

    // Get company's base currency
    const company = await Company.findById(req.user.company);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const baseCurrency = company.baseCurrency;

    // Convert currency if needed
    let amountConverted = amountOriginal;
    if (currencyOriginal !== baseCurrency) {
      try {
        const response = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${currencyOriginal}`
        );
        const rate = response.data.rates[baseCurrency];
        amountConverted = amountOriginal * rate;
      } catch (conversionError) {
        console.error("Currency conversion error:", conversionError.message);
        // Fallback to original amount if conversion fails
        amountConverted = amountOriginal;
      }
    }

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
      status: "draft",
      currentApprovalStep: 0,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error("Create Expense Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employee: req.user.id }).populate(
      "employee category"
    );
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getManagerExpenses = async (req, res) => {
  try {
    // Get pending expenses where the current approver is the logged-in user
    const expenses = await Expense.find({
      approvalSequence: { $elemMatch: { $eq: req.user.id } },
      status: "pending",
      $expr: { $lt: ["$currentApprovalStep", { $size: "$approvalSequence" }] },
    }).populate("employee category approvalSequence");

    // Filter to only include expenses where the user is the current approver
    const filteredExpenses = expenses.filter(
      (expense) =>
        expense.approvalSequence[expense.currentApprovalStep].toString() ===
        req.user.id
    );

    res.status(200).json(filteredExpenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpenseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const expense = await Expense.findById(req.params.id).populate("category");
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (status === "pending" && expense.currentApprovalStep === 0) {
      // Submission: find approval rule for the category
      const rule = await ApprovalRule.findOne({
        company: req.user.company,
        categories: expense.category._id,
      }).populate("approvalSequence");

      if (rule) {
        expense.approvalSequence = rule.approvalSequence;
      } else {
        // Fallback: find manager or something
        const user = await User.findById(req.user.id).populate("manager");
        if (user.manager) {
          expense.approvalSequence = [user.manager._id];
        } else {
          // No manager, approve automatically?
          expense.status = "approved";
          await expense.save();
          return res.status(200).json(expense);
        }
      }

      // Set status to pending after setting approval sequence
      expense.status = "pending";
      expense.currentApprovalStep = 0; // Start at first approver
    } else if (status === "approved") {
      // Approval: check if last step
      if (expense.currentApprovalStep < expense.approvalSequence.length - 1) {
        expense.currentApprovalStep += 1;
        expense.status = "pending"; // Still pending for next approver
      } else {
        expense.status = "approved";
      }
    } else if (status === "rejected") {
      expense.status = "rejected";
    }

    // Remove the conditional status update as it's now handled above

    await expense.save();
    res.status(200).json(expense);
  } catch (error) {
    console.error("Update Expense Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
