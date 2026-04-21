import * as stockModel from "../models/stockModel.js";

// --- Digital Item Admin ---

export async function create(req, res) {
  try {
    const { seller_id, category_id, item_name, description, price, stock_quantity, item_type, stock_status,url } = req.body;

    if (!seller_id || !category_id || !item_name || !price || !stock_quantity || !item_type || !stock_status || !url) {
      return res.status(400).json({ success: false, error: "All fields required" });
    }

    await stockModel.createStock(seller_id, category_id, item_name, description, price, stock_quantity, item_type, stock_status,url);
    res.status(201).json({ success: true, message: "Stock created" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function update(req, res) {
  try {
    const { category_id, item_name, description, price, stock_quantity, item_type, stock_status,url} = req.body;

    if (!category_id || !item_name || !price || !stock_quantity || !item_type || !stock_status || !url) {
      return res.status(400).json({ success: false, error: "All fields required" });
    }

    await stockModel.updateStock(req.params.id, category_id, item_name, description, price, stock_quantity, item_type, stock_status,url);
    res.json({ success: true, message: "Stock updated" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function remove(req, res) {
  try {
    await stockModel.deleteStock(req.params.id);
    res.json({ success: true, message: "Stock deleted" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAllBySeller(req, res) {
  try {
    const stocks = await stockModel.getStocksBySeller(req.params.seller_id);
    res.json({ success: true, data: stocks });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// --- Market ---

export async function getAll(req, res) {
  try {
    const stocks = await stockModel.getAllStocks();
    res.json({ success: true, data: stocks });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getById(req, res) {
  try {
    const stock = await stockModel.getStockById(req.params.id);

    if (!stock) {
      return res.status(404).json({ success: false, error: "Stock not found" });
    }

    res.json({ success: true, data: stock });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getByCategory(req, res) {
  try {
    const stocks = await stockModel.getStocksByCategory(req.params.category_id);
    res.json({ success: true, data: stocks });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
