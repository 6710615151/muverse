import sql from "../config/db.js";

//-------------------------------------------------------------------------------//
// 1. สร้างกระเป๋าเงิน
export async function createWallet(userId) {
  const result = await sql`
    INSERT INTO account_wallet (user_id, wallet)
    VALUES (${userId}, 0.00)
    RETURNING *
  `;
  return result[0] || null;
}

//-------------------------------------------------------------------------------//
// 2. หากระเป๋าเงิน
export async function getWalletByUserId(userId) {
  const result = await sql`
    SELECT * FROM account_wallet
    WHERE user_id = ${userId}
  `;
  return result[0] || null;
}

//-------------------------------------------------------------------------------//
// 3. เติมเงิน (paymentMethod: ใส่ชื่อวิธีการเติมเงิน)
export async function topupWallet(userId, amount, paymentMethod) {
  return await sql.begin(async (sql) => { 
    const walletResult = await sql`
      UPDATE account_wallet 
      SET wallet = wallet + ${amount}
      WHERE user_id = ${userId} 
      RETURNING *
    `;

    if (walletResult.length === 0) {
      throw new Error("ไม่พบกระเป๋าเงินของผู้ใช้นี้");
    }

    // ดึงค่า account_id จาก DB (ที่เป็น snake_case) มาเก็บในตัวแปร JS (camelCase)
    const accountId = walletResult[0].account_id;

    // บันทึกใน record_wallet
    await sql`
      INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
      VALUES (${accountId}, 'DEPOSIT', ${amount}, ${paymentMethod}, 'SUCCESS')
    `;

    return walletResult[0];
  });
}

//-------------------------------------------------------------------------------//
// 4. ถอนเงิน
export async function withdrawWallet(userId, amount, paymentMethod) {
  return await sql.begin(async (sql) => {
    const walletResult = await sql`
      UPDATE account_wallet 
      SET wallet = wallet - ${amount} 
      WHERE user_id = ${userId} AND wallet >= ${amount}
      RETURNING *
    `;

    if (walletResult.length === 0) {
      throw new Error("ไม่พบกระเป๋าเงิน หรือ ยอดเงินไม่เพียงพอสำหรับการถอน");
    }

    const accountId = walletResult[0].account_id;

    // บันทึกใน record_wallet
    await sql`
      INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
      VALUES (${accountId}, 'WITHDRAW', ${amount}, ${paymentMethod}, 'SUCCESS')
    `;

    return walletResult[0]; 
  });
}

//-------------------------------------------------------------------------------//
// 5. ชำระเงิน (มีไว้ก่อนยังไม่ใช้จริง)
export async function payWithWallet(userId, amount, paymentMethod) {
  return await sql.begin(async (sql) => {
    const walletResult = await sql`
      UPDATE account_wallet 
      SET wallet = wallet - ${amount} 
      WHERE user_id = ${userId} AND wallet >= ${amount}
      RETURNING *
    `;

    if (walletResult.length === 0) {
      throw new Error("ไม่พบกระเป๋าเงิน หรือ ยอดเงินไม่เพียงพอ");
    }

    const accountId = walletResult[0].account_id;

    // บันทึกใน record_wallet
    await sql`
      INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
      VALUES (${accountId}, 'PAYMENT', ${amount}, ${paymentMethod}, 'SUCCESS')
    `;

    return walletResult[0];
  });
}

//-------------------------------------------------------------------------------//
// 6. โอนเงินการซื้อขาย 
export async function transferWallet(buyerId, sellerId, amount, paymentMethod) {
  return await sql.begin(async (sql) => {
    // หักเงินผู้ซื้อ
    const buyerResult = await sql`
      UPDATE account_wallet 
      SET wallet = wallet - ${amount} 
      WHERE user_id = ${buyerId} AND wallet >= ${amount}
      RETURNING *
    `;

    if (buyerResult.length === 0) {
      throw new Error("ยอดเงินของผู้ซื้อไม่เพียงพอ");
    }

    // เพิ่มเงินผู้ขาย
    const sellerResult = await sql`
      UPDATE account_wallet 
      SET wallet = wallet + ${amount} 
      WHERE user_id = ${sellerId}
      RETURNING *
    `;

    if (sellerResult.length === 0) {
      throw new Error("ไม่พบกระเป๋าเงินของผู้ขาย");
    }

    // บันทึกใน record_wallet)
    await sql`
      INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
      VALUES (${buyerResult[0].account_id}, 'PAYMENT', ${amount}, ${paymentMethod}, 'SUCCESS')
    `;

    // บันทึกใน record_wallet 
    await sql`
      INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
      VALUES (${sellerResult[0].account_id}, 'INCOME', ${amount}, ${paymentMethod}, 'SUCCESS')
    `;

    return {
      buyer: buyerResult[0],  
      seller: sellerResult[0]
    };
  });
} 

//-------------------------------------------------------------------------------//
// 7. ดูประวัติธุรกรรม by userId
export async function getWalletRecords(userId) {
  const records = await sql`
    SELECT r.* FROM record_wallet r
    JOIN account_wallet a ON r.account_id = a.account_id
    WHERE a.user_id = ${userId}
    ORDER BY r.created_at DESC
  `;
  return records;
}