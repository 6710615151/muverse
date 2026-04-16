import express from 'express';
import * as WalletController from '../controllers/walletController.js';

const router = express.Router();

// 1. ดูยอดเงิน
router.get('/balance/:userId', WalletController.getBalance);

// 2. เติมเงิน
router.post('/topup', WalletController.topup);

// 3. ถอนเงิน
router.post('/withdraw', WalletController.withdraw);

// 4. จ่ายเงินให้ส่วนกลาง (มีไว้เผื่อใช้)
router.post('/pay', WalletController.pay);

// 5. โอนเงินซื้อขาย
router.post('/transfer', WalletController.transfer);

// 6. ดูประวัติธุรกรรม
router.get('/records/:userId', WalletController.getRecords);

export default router;