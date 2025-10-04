import ApprovalRule from "../models/ApprovalRule.js";

export const getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({
      company: req.user.company,
    }).populate("categories approvalSequence specificApproverIds");
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createApprovalRule = async (req, res) => {
  try {
    const {
      name,
      description,
      categories,
      approvalSequence,
      minimumPercentApproval,
      specificApproverIds,
      isManagerFirst,
    } = req.body;

    const rule = new ApprovalRule({
      company: req.user.company,
      name,
      description,
      categories,
      approvalSequence,
      minimumPercentApproval,
      specificApproverIds,
      isManagerFirst,
    });

    await rule.save();
    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
