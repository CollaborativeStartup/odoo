import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { company, name, email, password, role, manager } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      company,
      name,
      email,
      passwordHash,
      role,
      manager,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    let numericRole;
    switch (user.role) {
      case "admin":
        numericRole = 1;
        break;
      case "manager":
        numericRole = 2;
        break;
      case "employee":
      default:
        numericRole = 3;
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: numericRole,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user;

    const user = await User.findById(userId)
      .select("-passwordHash")
      .populate("company", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map role to number
    let numericRole;
    switch (user.role) {
      case "admin":
        numericRole = 1;
        break;
      case "manager":
        numericRole = 2;
        break;
      case "employee":
      default:
        numericRole = 3;
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: numericRole,
        status: user.status,
        company: user.company,
        manager: user.manager,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get User Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
