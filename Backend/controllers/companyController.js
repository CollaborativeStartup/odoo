const Company = require("../models/Company");

exports.getCompany = async (req, res) => {
  const company = await Company.findById(req.user.company);
  res.json(company);
};

exports.updateCompany = async (req, res) => {
  const { name, country, baseCurrency } = req.body;
  const company = await Company.findByIdAndUpdate(
    req.user.company,
    { name, country, baseCurrency },
    { new: true }
  );
  res.json(company);
};
