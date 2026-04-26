import * as ReviewModel from "../models/reviewModel.js";
import * as RequestModel from "../models/requestsModel.js";
import * as SellerModel from "../models/sellerModel.js";

// POST /api/review — สร้าง review หลังบริการเสร็จ
export async function create(req, res) {
  try {
    const { request_id, reviewer_id, seller_id, rating, comment } = req.body;

    if (!reviewer_id || !seller_id || !rating) {
      return res.status(400).json({ success: false, error: "reviewer_id, seller_id, rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: "rating must be between 1 and 5" });
    }

    // ถ้ามี request_id ให้ตรวจสอบว่า request นั้น COMPLETED และยังไม่ถูก review
    if (request_id) {
      const req_data = await RequestModel.getRequestById(request_id);
      if (!req_data) {
        return res.status(404).json({ success: false, error: "Request not found" });
      }
      if (!["COMPLETE", "COMPLETED"].includes((req_data.request_status || "").toUpperCase())) {
        return res.status(400).json({ success: false, error: "Can only review a COMPLETED request" });
      }
      const existing = await ReviewModel.getReviewByRequest(request_id);
      if (existing) {
        return res.status(409).json({ success: false, error: "This request has already been reviewed" });
      }
    }

    // seller_id ที่รับมาคือ user_id — ต้อง lookup seller_id จริงจาก sellers table
    const sellers = await SellerModel.getSellerByUserId(seller_id);
    if (!sellers.length) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }
    const real_seller_id = sellers[0].seller_id;

    const review = await ReviewModel.createReview(request_id || null, reviewer_id, real_seller_id, rating, comment || null);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/review/seller/:seller_id — ดู reviews ของ seller
export async function getBySeller(req, res) {
  try {
    const reviews = await ReviewModel.getReviewsBySeller(req.params.seller_id);
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
