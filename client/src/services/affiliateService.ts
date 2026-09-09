import { apiFetch } from './apiClient';

export interface MlmNodeRecord {
  id: string;
  userId: string;
  name: string;
  referralCode: string;
  position: 'ROOT' | 'LEFT' | 'RIGHT';
  rank: string;
  leftVolume: number;
  rightVolume: number;
  carriedLeftVolume?: number;
  carriedRightVolume?: number;
  leftLeg: MlmNodeRecord | null;
  rightLeg: MlmNodeRecord | null;
}

export interface AffiliateStats {
  userId: string;
  referralCode: string;
  referralLink: string;
  rank: string;
  placementPreference: 'AUTO' | 'LEFT' | 'RIGHT';
  leftVolume: number;
  rightVolume: number;
  carriedLeftPV?: number;
  carriedRightPV?: number;
  totalVolume: number;
  matchedPV?: number;
  grossMatchingBonus?: number;
  dailyCappingLimit?: number;
  cappedGrossBonus?: number;
  isCapped?: boolean;
  adminFee?: number;
  tdsDeduction?: number;
  netPayableBonus?: number;
  totalMatchedVolume?: number;
  totalEarnings?: number;
  lastPayoutDate?: string;
  directReferralsCount: number;
  estimatedMatchingBonus?: number;
}

export interface MlmPayoutRecord {
  _id: string;
  user: { name: string; userId: string; email: string };
  cycleDate: string;
  matchedVolume: number;
  matchingRatePercentage: number;
  grossBonus: number;
  cappingLimit: number;
  cappedGrossBonus: number;
  adminFee: number;
  tdsDeduction: number;
  netPayout: number;
  carriedLeftAfter: number;
  carriedRightAfter: number;
  status: string;
}

/**
 * Fetch 100% dynamic affiliate stats (volumes, bonus, referral link, placement preference)
 */
export const fetchAffiliateStats = async () => {
  return apiFetch<{ stats: AffiliateStats }>('/mlm/stats');
};

/**
 * Fetch 100% dynamic binary tree hierarchy (depth up to 4)
 */
export const fetchBinaryTree = async () => {
  return apiFetch<{ tree: MlmNodeRecord }>('/mlm/tree');
};

/**
 * Update downline placement leg preference (AUTO, LEFT, RIGHT)
 */
export const updateLegPreference = async (placementPreference: 'AUTO' | 'LEFT' | 'RIGHT') => {
  return apiFetch<{ placementPreference: 'AUTO' | 'LEFT' | 'RIGHT' }>('/mlm/preference', {
    method: 'PUT',
    body: JSON.stringify({ placementPreference })
  });
};

/**
 * Execute Binary MLM Payout Settlement Cycle (Admin only)
 */
export const executeBinaryPayoutSettlement = async () => {
  return apiFetch<{ processedCount: number; payoutResults: any[] }>('/mlm/payout/execute', {
    method: 'POST'
  });
};

/**
 * Fetch binary payout statement history
 */
export const fetchPayoutHistory = async () => {
  return apiFetch<{ count: number; history: MlmPayoutRecord[] }>('/mlm/payout/history');
};

/**
 * Seed sample 7-node network tree for testing
 */
export const seedMlmNetwork = async () => {
  return apiFetch<{ rootNode: any }>('/mlm/seed', {
    method: 'POST'
  });
};
