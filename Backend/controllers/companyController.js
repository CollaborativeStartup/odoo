import Company from "../models/Company.js";

export const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, country, baseCurrency } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.user.company,
      { name, country, baseCurrency },
      { new: true }
    );
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
