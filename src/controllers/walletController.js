import * as WalletModel from '../models/walletModel.js';

// ------------------------------------------------------------------------------- //
//1. ดูยอดเงินคงเหลือ
export async function getBalance(req, res) {
  try {
    const { userId } = req.params;

    const wallet = await WalletModel.getWalletByUserId(userId);

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'ไม่พบกระเป๋าเงินในระบบ' });
    }

    res.status(200).json({ success: true, balance: wallet.wallet });
  } catch (error) {
    console.error("Error in getBalance:", error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
}

// ------------------------------------------------------------------------------- //
//2. เติมเงิน
export async function topup(req, res) {
  try {
    const { userId, amount, paymentMethod } = req.body;

    if (!userId || !amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน หรือยอดเงินไม่ถูกต้อง' });
    }

    const updatedWallet = await WalletModel.topupWallet(userId, amount, paymentMethod);
    
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
    res.status(500).json({ success: false, message: 'เติมเงินล้มเหลว กรุณาลองใหม่' });
  }
}
// ------------------------------------------------------------------------------- //
//3. ถอนเงิน
export async function withdraw(req, res) {
  try {
    const { userId, amount, paymentMethod } = req.body;

    if (!userId || !amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน หรือยอดเงินไม่ถูกต้อง' });
    }

    const updatedWallet = await WalletModel.withdrawWallet(userId, amount, paymentMethod);
    
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
    const { userId, amount, paymentMethod } = req.body;

    if (!userId || !amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'ข้อมูลการชำระเงินไม่ครบถ้วน' });
    }

    const updatedWallet = await WalletModel.payWithWallet(userId, amount, paymentMethod);
    
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

    const { buyerId, sellerId, amount, paymentMethod } = req.body;

    if (!buyerId || !sellerId || !amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'ข้อมูลการโอนเงินไม่ครบถ้วน' });
    }

    const result = await WalletModel.transferWallet(buyerId, sellerId, amount, paymentMethod);

    res.status(200).json({ 
        success: true, 
        message: 'ชำระเงินสำเร็จ', 
        balance: result.buyer.wallet 
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
    const { userId } = req.params;
    
    const records = await WalletModel.getWalletRecords(userId);
    
    res.status(200).json({ 
        success: true, 
        transactions: records 
    });
  } catch (error) {
    console.error("Error in getRecords:", error);
    res.status(500).json({ success: false, message: 'ดึงประวัติไม่สำเร็จ' });
  }
}