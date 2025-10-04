import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "manager", "employee"],
    required: true,
  },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // reporting manager
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
