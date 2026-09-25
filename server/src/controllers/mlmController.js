const MLMNode = require('../models/MLMNode');
const User = require('../models/User');
const MlmPayout = require('../models/MlmPayout');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const catchAsync = require('../utils/catchAsync');
const { getOrCreateMLMNode } = require('../utils/mlmService');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/appError');

/**
 * Recursive helper to populate binary tree hierarchy up to maxDepth
 */
const buildTreeHierarchy = async (nodeId, currentDepth = 1, maxDepth = 20) => {
  if (!nodeId || currentDepth > maxDepth) return null;

  const node = await MLMNode.findById(nodeId)
    .populate('user', 'name userId role referralCode')
    .lean();

  if (!node) return null;

  const leftChild = node.leftLeg
    ? await buildTreeHierarchy(node.leftLeg, currentDepth + 1, maxDepth)
    : null;
  const rightChild = node.rightLeg
    ? await buildTreeHierarchy(node.rightLeg, currentDepth + 1, maxDepth)
    : null;

  return {
    id: node._id,
    userId: node.user ? node.user.userId : 'VACANT',
    name: node.user ? node.user.name : 'Empty Spot',
    referralCode: node.user ? node.user.referralCode : '',
    position: node.position || 'ROOT',
    rank: node.rank || 'BRONZE',
    leftVolume: node.leftVolume || 0,
    rightVolume: node.rightVolume || 0,
    carriedLeftVolume: node.carriedLeftVolume !== undefined ? node.carriedLeftVolume : (node.leftVolume || 0),
    carriedRightVolume: node.carriedRightVolume !== undefined ? node.carriedRightVolume : (node.rightVolume || 0),
    leftLeg: leftChild,
    rightLeg: rightChild
  };
};

/**
 * @route   GET /api/mlm/tree
 * @desc    Fetch binary tree hierarchy for logged-in user up to depth 20
 * @access  Private (Student / User / Affiliate)
 */
const getBinaryTree = catchAsync(async (req, res) => {
  const rootNode = await getOrCreateMLMNode(req.user._id);
  const depth = req.query.depth ? parseInt(req.query.depth, 10) : 20;
  const treeData = await buildTreeHierarchy(rootNode._id, 1, depth);

  return sendSuccess(res, 200, 'Binary MLM tree hierarchy retrieved successfully.', {
    tree: treeData
  });
});

/**
 * @route   GET /api/mlm/stats
 * @desc    Fetch affiliate dashboard stats (leg volumes, carry forward, matching bonus, capping, deductions, referral link)
 * @access  Private (Student / User / Affiliate)
 */
const getAffiliateStats = catchAsync(async (req, res) => {
  const node = await getOrCreateMLMNode(req.user._id);

  // Count direct referrals sponsored by this user
  const directReferralsCount = await User.countDocuments({ referredBy: req.user.referralCode });

  // Carry Forward PV Logic
  const carriedLeftPV = node.carriedLeftVolume !== undefined ? node.carriedLeftVolume : (node.leftVolume || 0);
  const carriedRightPV = node.carriedRightVolume !== undefined ? node.carriedRightVolume : (node.rightVolume || 0);

  // 1:1 Pair Matching on Weaker Leg
  const matchedPV = Math.min(carriedLeftPV, carriedRightPV);
  const grossMatchingBonus = Math.round(matchedPV * 0.1); // 10% matching rate

  // Financial Rules & Deductions
  const dailyCappingLimit = 25000;
  const cappedGrossBonus = Math.min(grossMatchingBonus, dailyCappingLimit);
  const isCapped = grossMatchingBonus > dailyCappingLimit;

  const adminFee = Math.round(cappedGrossBonus * 0.05); // 5% Admin Charge
  const tdsDeduction = Math.round(cappedGrossBonus * 0.05); // 5% TDS
  const netPayableBonus = cappedGrossBonus - adminFee - tdsDeduction;

  const hostOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:3000');
  const referralLink = `${hostOrigin}/register?ref=${req.user.referralCode || req.user.userId}`;

  return sendSuccess(res, 200, 'Affiliate stats retrieved successfully.', {
    stats: {
      userId: req.user.userId,
      referralCode: req.user.referralCode,
      referralLink,
      rank: node.rank,
      placementPreference: node.placementPreference,
      leftVolume: node.leftVolume,
      rightVolume: node.rightVolume,
      carriedLeftPV,
      carriedRightPV,
      totalVolume: node.leftVolume + node.rightVolume,
      matchedPV,
      grossMatchingBonus,
      dailyCappingLimit,
      cappedGrossBonus,
      isCapped,
      adminFee,
      tdsDeduction,
      netPayableBonus,
      totalMatchedVolume: node.totalMatchedVolume || 0,
      totalEarnings: node.totalEarnings || 0,
      lastPayoutDate: node.lastPayoutDate || null,
      directReferralsCount
    }
  });
});

/**
 * @route   PUT /api/mlm/preference
 * @desc    Update leg placement preference (AUTO, LEFT, RIGHT)
 * @access  Private (Student / User / Affiliate)
 */
const updatePlacementPreference = catchAsync(async (req, res) => {
  const { placementPreference } = req.body;
  const node = await getOrCreateMLMNode(req.user._id);

  node.placementPreference = placementPreference;
  await node.save();

  return sendSuccess(res, 200, `Leg placement preference updated to '${placementPreference}'.`, {
    placementPreference: node.placementPreference
  });
});

/**
 * @route   POST /api/mlm/payout/execute
 * @desc    Execute Binary MLM Payout Settlement Cycle (Admin only)
 *          Calculates 1:1 pair matching, applies ₹25k capping limit, deducts 5% Admin + 5% TDS,
 *          credits net payout to user's wallet, flushes matched PV, and rolls over carry-forward volume.
 * @access  Private (Super Admin)
 */
const executeBinaryPayoutSettlement = catchAsync(async (req, res) => {
  // Find all MLM nodes that have matched volume on carried legs
  const allNodes = await MLMNode.find({}).populate('user');
  const payoutResults = [];

  for (const node of allNodes) {
    if (!node.user) continue;

    const carriedLeft = node.carriedLeftVolume !== undefined ? node.carriedLeftVolume : (node.leftVolume || 0);
    const carriedRight = node.carriedRightVolume !== undefined ? node.carriedRightVolume : (node.rightVolume || 0);

    const matchedPV = Math.min(carriedLeft, carriedRight);
    if (matchedPV <= 0) continue; // Skip if no pairs matched

    const grossBonus = Math.round(matchedPV * 0.1);
    const dailyCappingLimit = 25000;
    const cappedGrossBonus = Math.min(grossBonus, dailyCappingLimit);

    const adminFee = Math.round(cappedGrossBonus * 0.05);
    const tdsDeduction = Math.round(cappedGrossBonus * 0.05);
    const netPayout = cappedGrossBonus - adminFee - tdsDeduction;

    const carriedLeftAfter = carriedLeft - matchedPV;
    const carriedRightAfter = carriedRight - matchedPV;

    // 1. Update MLM Node carry forward and totals
    node.carriedLeftVolume = carriedLeftAfter;
    node.carriedRightVolume = carriedRightAfter;
    node.totalMatchedVolume = (node.totalMatchedVolume || 0) + matchedPV;
    node.totalEarnings = (node.totalEarnings || 0) + netPayout;
    node.lastPayoutDate = new Date();
    await node.save();

    // 2. Credit User Wallet
    let wallet = await Wallet.findOne({ user: node.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: node.user._id, balance: 0 });
    }
    wallet.balance += netPayout;
    await wallet.save();

    // 3. Create Transaction Record
    await Transaction.create({
      wallet: wallet._id,
      user: node.user._id,
      amount: netPayout,
      type: 'CREDIT',
      category: 'AFFILIATE_COMMISSION',
      status: 'SUCCESS',
      description: `Binary MLM Matching Bonus Payout (Matched: ${matchedPV} PV, Net: ₹${netPayout})`
    });

    // 4. Create Audit Log Payout Record
    const payoutRecord = await MlmPayout.create({
      user: node.user._id,
      mlmNode: node._id,
      cycleDate: new Date(),
      matchedVolume: matchedPV,
      matchingRatePercentage: 10,
      grossBonus,
      cappingLimit: dailyCappingLimit,
      cappedGrossBonus,
      adminFee,
      tdsDeduction,
      netPayout,
      carriedLeftAfter,
      carriedRightAfter,
      status: 'PAID'
    });

    payoutResults.push({
      userId: node.user.userId,
      name: node.user.name,
      matchedPV,
      grossBonus,
      cappedGrossBonus,
      adminFee,
      tdsDeduction,
      netPayout,
      carriedLeftAfter,
      carriedRightAfter,
      payoutId: payoutRecord._id
    });
  }

  return sendSuccess(res, 200, `Binary MLM Payout Settlement completed successfully. ${payoutResults.length} accounts credited.`, {
    processedCount: payoutResults.length,
    payoutResults
  });
});

/**
 * @route   GET /api/mlm/payout/history
 * @desc    Fetch past binary payout statements for logged-in user or admin
 * @access  Private (Student / User / Affiliate / Admin)
 */
const getPayoutHistory = catchAsync(async (req, res) => {
  const query = req.user.role === 'ADMIN' ? {} : { user: req.user._id };
  const history = await MlmPayout.find(query)
    .populate('user', 'name userId email mobile')
    .sort({ cycleDate: -1 })
    .lean();

  return sendSuccess(res, 200, 'Binary MLM payout history retrieved successfully.', {
    count: history.length,
    history
  });
});

/**
 * @route   POST /api/mlm/seed
 * @desc    Seed a sample 7-node binary network tree for testing
 * @access  Public / Admin
 */
const seedMLMNetwork = catchAsync(async (req, res) => {
  let rootUser = (req.user && req.user._id) ? req.user : await User.findOne({}).lean();
  if (!rootUser) {
    rootUser = await User.create({
      name: 'Root Network Sponsor',
      mobile: '9999888877',
      password: 'rootpassword123',
      role: 'ADMIN'
    });
  }
  const rootNode = await getOrCreateMLMNode(rootUser._id);

  rootNode.leftVolume = 12500;
  rootNode.rightVolume = 9800;
  rootNode.carriedLeftVolume = 12500;
  rootNode.carriedRightVolume = 9800;
  rootNode.rank = 'GOLD';
  await rootNode.save();

  return sendSuccess(res, 201, 'Binary MLM sample network tree seeded successfully.', {
    rootNode
  });
});

module.exports = {
  getBinaryTree,
  getAffiliateStats,
  updatePlacementPreference,
  executeBinaryPayoutSettlement,
  getPayoutHistory,
  seedMLMNetwork
};
