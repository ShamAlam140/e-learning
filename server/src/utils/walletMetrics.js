const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const MLMNode = require('../models/MLMNode');
const WithdrawalRequest = require('../models/WithdrawalRequest');

/**
 * Calculate user wallet balances:
 * - totalBalance: Total usable balance for purchasing courses/materials
 * - withdrawableBalance: Amount earned via Refer & Earn / Affiliate commissions eligible for cashout to Bank/UPI
 * - purchaseBalance: Deposit/Top-Up balance reserved for course purchases (non-withdrawable)
 */
const getUserWalletMetrics = async (userId, userRole) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }

  const totalBalance = Math.max(0, wallet.balance || 0);

  // TEACHER: All earnings come from course royalties and MLM commissions (100% withdrawable)
  if (userRole === 'TEACHER') {
    return {
      totalBalance,
      withdrawableBalance: totalBalance,
      purchaseBalance: 0,
      totalReferralEarned: totalBalance,
      totalDeposited: 0,
      totalWithdrawnOrPending: 0
    };
  }

  // STUDENT:
  // 1. Calculate total referral / affiliate commission earned
  const referralTxns = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'CREDIT',
        category: { $in: ['AFFILIATE_COMMISSION', 'ROYALTY_PAYOUT'] },
        status: 'SUCCESS'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const txnReferralEarned = referralTxns[0]?.total || 0;

  const mlmNode = await MLMNode.findOne({ user: userId });
  const nodeEarned = mlmNode?.totalEarnings || 0;
  const totalReferralEarned = Math.max(txnReferralEarned, nodeEarned);

  // 2. Calculate total deposit top-ups made
  const topupTxns = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'CREDIT',
        category: { $in: ['TOPUP', 'WALLET_TOPUP'] },
        status: 'SUCCESS'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalDeposited = topupTxns[0]?.total || 0;

  // 3. Calculate total withdrawals already requested or approved
  const withdrawalRequests = await WithdrawalRequest.aggregate([
    {
      $match: {
        user: userId,
        status: { $in: ['PENDING', 'APPROVED'] }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalWithdrawnOrPending = withdrawalRequests[0]?.total || 0;

  // 4. Calculate available referral earnings eligible for cashout
  const availableReferralEarnings = Math.max(0, totalReferralEarned - totalWithdrawnOrPending);
  const withdrawableBalance = Math.min(totalBalance, availableReferralEarnings);
  const purchaseBalance = Math.max(0, totalBalance - withdrawableBalance);

  return {
    totalBalance,
    withdrawableBalance,
    purchaseBalance,
    totalReferralEarned,
    totalDeposited,
    totalWithdrawnOrPending
  };
};

module.exports = {
  getUserWalletMetrics
};
