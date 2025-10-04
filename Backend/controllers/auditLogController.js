import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async (req, res) => {
  try {
    const { entityType, entityId, action, user, detailsJson } = req.body;
    const log = new AuditLog({
      entityType,
      entityId,
      action,
      user,
      detailsJson,
    });
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
