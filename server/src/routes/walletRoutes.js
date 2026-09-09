const express = require('express');
const {
  getWalletBalance,
  getTransactionHistory,
  createRazorpayTopupOrder,
  verifyRazorpayTopup
} = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');
const {
  topupOrderSchema,
  verifyPaymentSchema,
  validateRequest
} = require('../validators/walletValidator');

const router = express.Router();

router.use(protect);

router.get('/balance', getWalletBalance);
router.get('/transactions', getTransactionHistory);
router.post('/topup/order', validateRequest(topupOrderSchema), createRazorpayTopupOrder);
router.post('/topup/verify', validateRequest(verifyPaymentSchema), verifyRazorpayTopup);

module.exports = router;
