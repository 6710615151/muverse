import * as orderModel from "../models/orderModel.js";
import * as orderItemModel from "../models/orderItemModel.js";
import * as stockModel from "../models/stockModel.js";
import * as walletModel from "../models/walletModel.js";

// --- Buy Digital Item ---

export async function buyItem(req, res) {
  try {
    const { customer_id, seller_id, items } = req.body;
    // items = [{ stock_id, item_quantity }, ...]

    if (!customer_id || !seller_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "All fields required" });
    }

    // ตรวจสอบ stock ทุกรายการก่อน
    for (const item of items) {
      const stock = await stockModel.getStockById(item.stock_id);
      if (!stock) {
        return res.status(404).json({ success: false, error: `Stock id ${item.stock_id} not found` });
      }
      if (stock.stock_quantity < item.item_quantity) {
        return res.status(400).json({ success: false, error: `Stock id ${item.stock_id} not enough` });
      }
      item._stock = stock;
    }

    // คำนวณ total
    const total_price = items.reduce((sum, item) => sum + parseFloat(item._stock.price) * item.item_quantity, 0);

    // เช็ค wallet balance ก่อนสร้าง order
    const wallet = await walletModel.getWalletByUserId(customer_id);
    if (!wallet || parseFloat(wallet.wallet) < total_price) {
      return res.status(400).json({ success: false, error: "ยอดเงินในกระเป๋าไม่เพียงพอ" });
    }

    // สร้าง order
    const order_id = await orderModel.createOrder(customer_id, seller_id, total_price);

    // สร้าง order_items และ update stock ทุกรายการ
    for (const item of items) {
      await orderItemModel.createOrderItem(order_id, item.stock_id, item.item_quantity, item._stock.price);
      await stockModel.updateStockQuantity(item.stock_id, item.item_quantity);
    }

    // ตัดเงินจาก wallet และเปลี่ยน payment_status เป็น paid
    await walletModel.payWithWallet(customer_id, total_price, 'wallet');
    await orderModel.updatePaymentStatus(order_id, 'paid');

    res.status(201).json({ success: true, message: "Order created", data: { order_id } });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// --- Manage Order (Seller) ---

export async function getBySeller(req, res) {
  try {
    const orders = await orderModel.getOrdersBySeller(req.params.seller_id);
    res.json({ success: true, data: orders });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { order_status } = req.body;

    if (!order_status) {
      return res.status(400).json({ success: false, error: "order_status is required" });
    }

    await orderModel.updateOrderStatus(req.params.id, order_status);
    res.json({ success: true, message: "Order status updated" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePayment(req, res) {
  try {
    const { payment_status } = req.body;

    if (!payment_status) {
      return res.status(400).json({ success: false, error: "payment_status is required" });
    }

    await orderModel.updatePaymentStatus(req.params.id, payment_status);
    res.json({ success: true, message: "Payment status updated" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// --- Buyer ---

export async function getByCustomer(req, res) {
  try {
    const orders = await orderModel.getOrdersByCustomer(req.params.customer_id);
    res.json({ success: true, data: orders });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getById(req, res) {
  try {
    const order = await orderModel.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const items = await orderItemModel.getOrderItemsByOrder(req.params.id);
    res.json({ success: true, data: { ...order, items } });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// --- Step 5: Customer confirms receipt → release funds to seller ---

export async function confirmReceipt(req, res) {
  try {
    const order = await orderModel.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (order.order_status === "completed") {
      return res.status(400).json({ success: false, error: "Order already completed" });
    }

    await walletModel.releaseFundsToSeller(order.seller_id, order.total_price);
    await orderModel.updateOrderStatus(req.params.id, "completed");

    res.json({ success: true, message: "Order completed, funds released to seller" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
