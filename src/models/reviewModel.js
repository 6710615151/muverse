import sql from "../config/db.js";
import { updateSellerRating } from "./sellerModel.js";

// สร้าง review และอัปเดต rating ของ seller ทันที
export async function createReview(request_id, reviewer_id, seller_id, rating, comment) {
  const result = await sql`
    INSERT INTO reviews (request_id, reviewer_id, seller_id, rating, comment)
    VALUES (${request_id}, ${reviewer_id}, ${seller_id}, ${rating}, ${comment})
    RETURNING *
  `;
  // คำนวณ rating ใหม่ให้ seller
  await updateSellerRating(seller_id);
  return result[0];
}

// ดู reviews ทั้งหมดของ seller (แสดงชื่อผู้รีวิว)
export async function getReviewsBySeller(seller_id) {
  return await sql`
    SELECT r.*, u.name AS reviewer_name
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.user_id
    WHERE r.seller_id = ${seller_id}
    ORDER BY r.created_at DESC
  `;
}

// เช็กว่า request นี้ถูก review ไปแล้วหรือยัง (ป้องกัน review ซ้ำ)
export async function getReviewByRequest(request_id) {
  const result = await sql`
    SELECT * FROM reviews WHERE request_id = ${request_id}
  `;
  return result[0] || null;
}
