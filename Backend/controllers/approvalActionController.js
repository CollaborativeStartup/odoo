import ApprovalAction from "../models/ApprovalAction.js";

export const getApprovalActions = async (req, res) => {
  try {
    const actions = await ApprovalAction.find({
      expense: req.params.expenseId,
    }).populate("user");
    res.status(200).json(actions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createApprovalAction = async (req, res) => {
  try {
    const { expense, user, stepOrder, status, comment } = req.body;
    const action = new ApprovalAction({
      expense,
      user,
      stepOrder,
      status,
      comment,
    });
    await action.save();
    res.status(201).json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
