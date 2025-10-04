import mongoose from "mongoose";
const ApprovalRuleSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  approvalSequence: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  minimumPercentApproval: { type: Number },
  specificApproverIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isManagerFirst: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ApprovalRule", ApprovalRuleSchema);
