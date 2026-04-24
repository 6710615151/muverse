import sql from "../config/db.js";

//-------------------------------------------------------------------------------//
// 1. สร้างกระเป๋าเงิน
export async function createWallet(user_id) {
  const result = await sql`
    INSERT INTO account_wallet (user_id, wallet)
    VALUES (${user_id}, 0.00)
    RETURNING *
  `;
  return result[0] || null;
}

//-------------------------------------------------------------------------------//
// 2. หากระเป๋าเงิน
export async function getWalletByUserId(user_id) {
  const result = await sql`
    SELECT * FROM account_wallet
    WHERE user_id = ${user_id}
  `;
  return result[0] || null;
}

//-------------------------------------------------------------------------------//
// 3. เติมเงิน
export async function topupWallet(user_id, amount, payment_method) {
  const walletResult = await sql`
    UPDATE account_wallet 
    SET wallet = wallet + ${amount}
    WHERE user_id = ${user_id} 
    RETURNING *
  `;

  if (walletResult.length === 0) {
    throw new Error("ไม่พบกระเป๋าเงินของผู้ใช้นี้");
  }

  const account_id = walletResult[0].account_id;

  await sql`
    INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
    VALUES (${account_id}, 'DEPOSIT', ${amount}, ${payment_method}, 'SUCCESS')
  `;

  return walletResult[0];
}

//-------------------------------------------------------------------------------//
// 4. ถอนเงิน
export async function withdrawWallet(user_id, amount, payment_method) {
  const walletResult = await sql`
    UPDATE account_wallet 
    SET wallet = wallet - ${amount} 
    WHERE user_id = ${user_id} AND wallet >= ${amount}
    RETURNING *
  `;

  if (walletResult.length === 0) {
    throw new Error("ไม่พบกระเป๋าเงิน หรือ ยอดเงินไม่เพียงพอสำหรับการถอน");
  }

  const account_id = walletResult[0].account_id;

  await sql`
    INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
    VALUES (${account_id}, 'WITHDRAW', ${amount}, ${payment_method}, 'SUCCESS')
  `;

  return walletResult[0]; 
}

//-------------------------------------------------------------------------------//
// 5. ชำระเงิน (มีไว้ก่อนยังไม่ใช้จริง)
export async function payWithWallet(user_id, amount, payment_method) {
  const walletResult = await sql`
    UPDATE account_wallet 
    SET wallet = wallet - ${amount} 
    WHERE user_id = ${user_id} AND wallet >= ${amount}
    RETURNING *
  `;

  if (walletResult.length === 0) {
    throw new Error("ไม่พบกระเป๋าเงิน หรือ ยอดเงินไม่เพียงพอ");
  }

  const account_id = walletResult[0].account_id;

  await sql`
    INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
    VALUES (${account_id}, 'PAYMENT', ${amount}, ${payment_method}, 'SUCCESS')
  `;

  return walletResult[0];
}

//-------------------------------------------------------------------------------//
// 6. โอนเงินการซื้อขาย 
export async function transferWallet(customer_id, seller_id, amount, payment_method) {
  return await sql.begin(async (tx) => {
    const customerResult = await tx`
      UPDATE account_wallet
      SET wallet = wallet - ${amount}
      WHERE user_id = ${customer_id} AND wallet >= ${amount}
      RETURNING *
    `;

    if (customerResult.length === 0) {
      throw new Error("ยอดเงินของผู้ซื้อไม่เพียงพอ");
    }

    const sellerResult = await tx`
      UPDATE account_wallet
      SET wallet = wallet + ${amount}
      WHERE user_id = ${seller_id}
      RETURNING *
    `;

    if (sellerResult.length === 0) {
      throw new Error("ไม่พบกระเป๋าเงินของผู้ขาย");
    }

    await tx`
      INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
      VALUES (${customerResult[0].account_id}, 'PAYMENT', ${amount}, ${payment_method}, 'SUCCESS')
    `;

    await tx`
      INSERT INTO record_wallet (account_id, payment_type, amount, payment_method, status)
      VALUES (${sellerResult[0].account_id}, 'INCOME', ${amount}, ${payment_method}, 'SUCCESS')
    `;

    return {
      customer: customerResult[0],
      seller: sellerResult[0]
    };
  });
} 

//-------------------------------------------------------------------------------//
// 7. ดูประวัติธุรกรรม by userId
export async function getWalletRecords(user_id) {
  const records = await sql`
    SELECT r.* FROM record_wallet r
    JOIN account_wallet a ON r.account_id = a.account_id
    WHERE a.user_id = ${user_id}
    ORDER BY r.created_at DESC
  `;
  return records;
}