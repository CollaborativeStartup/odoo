import mongoose from "mongoose";
const AuditLogSchema = new mongoose.Schema({
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  detailsJson: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("AuditLog", AuditLogSchema);
