const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ company: req.user.company });
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  const category = new Category({
    name,
    description,
    company: req.user.company,
  });
  await category.save();
  res.json(category);
};

exports.updateCategory = async (req, res) => {
  const { name, description, active } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, active },
    { new: true }
  );
  res.json(category);
};
