import * as categoryModel from "../models/categoryModel.js";

export async function getAll(req, res) {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json({ success: true, data: categories });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getById(req, res) {
  try {
    const category = await categoryModel.getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    res.json({ success: true, data: category });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
