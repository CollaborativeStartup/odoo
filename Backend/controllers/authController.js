import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Company from "../models/Company.js";
export const signup = async (req, res) => {
  try {
    const { companyName, country, currency, name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let company = await Company.findOne({ name: companyName });
    if (!company) {
      company = new Company({
        name: companyName,
        country: country,
        baseCurrency: currency,
      });
      await company.save();
    }

    const user = new User({
      company: company._id,
      name,
      email,
      passwordHash: password,
      role: role || "admin",
      manager: null,
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
        company: company._id,
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
