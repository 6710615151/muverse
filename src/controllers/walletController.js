import * as WalletModel from '../models/walletModel.js';

// ------------------------------------------------------------------------------- //
//1. ดูยอดเงินคงเหลือ
export async function getBalance(req, res) {
  try {
    const { user_id } = req.params;

    const wallet = await WalletModel.getWalletByUserId(user_id);

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'ไม่พบกระเป๋าเงินในระบบ' });
    }

    res.status(200).json({ success: true, data: { balance: wallet.wallet } });
  } catch (error) {
    console.error("Error in getBalance:", error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
}

// ------------------------------------------------------------------------------- //
//2. เติมเงิน
export async function topup(req, res) {
  try {
    const { user_id, amount, payment_method } = req.body;

    if (!user_id || !amount || amount <= 0 || !payment_method) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน หรือยอดเงินไม่ถูกต้อง' });
    }

    const updatedWallet = await WalletModel.topupWallet(user_id, amount, payment_method);
    
    res.status(200).json({ 
        success: true, 
        message: 'เติมเงินสำเร็จ', 
        balance: updatedWallet.wallet 
    });
  } catch (error) {
    if (error.message === "ไม่พบกระเป๋าเงินของผู้ใช้นี้") {
        return res.status(404).json({ success: false, message: error.message });
    }
    console.error("Error in topup:", error);
    res.status(500).json({ 
        success: false, 
        message: 'เติมเงินล้มเหลว', 
        error: error.message 
    });
  }
}
// ------------------------------------------------------------------------------- //
//3. ถอนเงิน
export async function withdraw(req, res) {
  try {
    const { user_id, amount, payment_method } = req.body;

    if (!user_id || !amount || amount <= 0 || !payment_method) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน หรือยอดเงินไม่ถูกต้อง' });
    }

    const updatedWallet = await WalletModel.withdrawWallet(user_id, amount, payment_method);
    
    res.status(200).json({ 
        success: true, 
        message: 'ทำรายการถอนเงินสำเร็จ', 
        balance: updatedWallet.wallet 
    });
  } catch (error) {
    if (error.message.includes("ไม่เพียงพอสำหรับการถอน")) {
        return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Error in withdraw:", error);
    res.status(500).json({ success: false, message: 'ระบบถอนเงินมีปัญหา' });
  }
}
// ------------------------------------------------------------------------------- //
//4.จ่ายเงินให้แพลตฟอร์ม (มีไว้ก่อนยังไม่ใช้จริง)
export async function pay(req, res) {
  try {
    const { user_id, amount, payment_method } = req.body;

    if (!user_id || !amount || amount <= 0 || !payment_method) {
      return res.status(400).json({ success: false, message: 'ข้อมูลการชำระเงินไม่ครบถ้วน' });
    }

    const updatedWallet = await WalletModel.payWithWallet(user_id, amount, payment_method);
    
    res.status(200).json({ 
        success: true, 
        message: 'ชำระเงินสำเร็จ', 
        balance: updatedWallet.wallet 
    });
  } catch (error) {
    if (error.message.includes("ยอดเงินไม่เพียงพอ")) {
        return res.status(400).json({ success: false, message: 'ยอดเงินของคุณไม่เพียงพอ' });
    }
    console.error("Error in pay:", error);
    res.status(500).json({ success: false, message: 'ระบบชำระเงินขัดข้อง' });
  }
}

// ------------------------------------------------------------------------------- //
// 5. โอนเงินซื้อขาย ซื้อไปขาย
export async function transfer(req, res) {
  try {

    const { customer_id, seller_id, amount, payment_method } = req.body;

    if (!customer_id || !seller_id || !amount || amount <= 0 || !payment_method) {
      return res.status(400).json({ success: false, message: 'ข้อมูลการโอนเงินไม่ครบถ้วน' });
    }

    const result = await WalletModel.transferWallet(customer_id, seller_id, amount, payment_method);

    res.status(200).json({ 
        success: true, 
        message: 'ชำระเงินสำเร็จ', 
        balance: result.customer.wallet 
    });


  } catch (error) {
    if (error.message.includes("ยอดเงินของผู้ซื้อไม่เพียงพอ")) {
        return res.status(400).json({ success: false, message: 'ยอดเงินของคุณไม่เพียงพอ กรุณาเติมเงิน' });
    }
    if (error.message.includes("ไม่พบกระเป๋าเงินของผู้ขาย")) {
        return res.status(404).json({ success: false, message: 'ไม่สามารถทำรายการได้ เนื่องจากไม่พบร้านค้านี้' });
    }
    console.error("Error in transfer:", error);
    res.status(500).json({ success: false, message: 'ระบบโอนเงินขัดข้อง' });
  }
}
// ------------------------------------------------------------------------------- //
// 6. ดึงStatement
export async function getRecords(req, res) {
  try {
    const { user_id } = req.params;

    const records = await WalletModel.getWalletRecords(user_id);

    res.status(200).json({
        success: true,
        data: records
    });
  } catch (error) {
    console.error("Error in getRecords:", error);
    res.status(500).json({ success: false, message: 'ดึงประวัติไม่สำเร็จ' });
  }
}

// ------------------------------------------------------------------------------- //
// 7. Admin — ดูธุรกรรมทั้งหมด (Reconciliation)
export async function getAdminRecords(req, res) {
  try {
    const records = await WalletModel.getAllWalletRecords();
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error("Error in getAdminRecords:", error);
    res.status(500).json({ success: false, message: 'ดึงข้อมูลไม่สำเร็จ' });
  }
}