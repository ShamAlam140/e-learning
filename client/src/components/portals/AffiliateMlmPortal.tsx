import React, { useState, useEffect } from 'react';
import { MlmTreeVisualizer } from '../MlmTreeVisualizer';
import { Share2, Copy, Check, QrCode, MessageSquare, Send, Award, Network, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAffiliateStats,
  fetchBinaryTree,
  updateLegPreference,
  seedMlmNetwork,
  fetchPayoutHistory,
  AffiliateStats,
  MlmNodeRecord,
  MlmPayoutRecord
} from '../../services/affiliateService';

export const AffiliateMlmPortal: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [treeData, setTreeData] = useState<MlmNodeRecord | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<MlmPayoutRecord[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const [copied, setCopied] = useState(false);
  const [placementLeg, setPlacementLeg] = useState<'AUTO' | 'LEFT' | 'RIGHT'>('AUTO');
  const [showQrModal, setShowQrModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load Affiliate Stats
  const loadStats = async () => {
    setIsLoadingStats(true);
    const res = await fetchAffiliateStats();
    if (res.success && res.data) {
      setStats(res.data.stats);
      setPlacementLeg(res.data.stats.placementPreference || 'AUTO');
    }
    setIsLoadingStats(false);
  };

  // Load Binary Tree
  const loadTree = async () => {
    setIsLoadingTree(true);
    const res = await fetchBinaryTree();
    if (res.success && res.data) {
      setTreeData(res.data.tree);
    }
    setIsLoadingTree(false);
  };

  const loadPayoutHistoryData = async () => {
    const res = await fetchPayoutHistory();
    if (res.success && res.data) {
      setPayoutHistory(res.data.history || []);
    }
  };

  useEffect(() => {
    loadStats();
    loadTree();
    loadPayoutHistoryData();
  }, []);

  // Update Leg Placement Preference
  const handlePlacementChange = async (leg: 'AUTO' | 'LEFT' | 'RIGHT') => {
    setFeedbackMsg('');
    setErrorMsg('');
    setIsUpdatingPreference(true);

    const res = await updateLegPreference(leg);
    setIsUpdatingPreference(false);

    if (res.success) {
      setPlacementLeg(leg);
      setFeedbackMsg(`✅ Leg placement preference updated to ${leg}!`);
      loadStats();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } else {
      setErrorMsg(res.message || 'Failed to update placement preference.');
    }
  };

  // 1-Click Seed Sample Network Tree
  const handleSeedNetwork = async () => {
    setFeedbackMsg('');
    setErrorMsg('');
    setIsSeeding(true);

    const res = await seedMlmNetwork();
    setIsSeeding(false);

    if (res.success) {
      setFeedbackMsg('🌱 Sample 7-node binary network tree seeded successfully!');
      loadStats();
      loadTree();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } else {
      setErrorMsg(res.message || 'Failed to seed network tree.');
    }
  };

  const getShareUrl = () => {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    let link = stats?.referralLink || `${currentOrigin}/register?ref=${user?.referralCode || user?.userId || 'EDU-99201'}`;
    if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
      link = link.replace('https://eduverse.in', currentOrigin);
    }
    return link;
  };

  const copyReferralLink = () => {
    const link = getShareUrl();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = "Hey! Join EduVerse E-Learning Platform for state-wise study courses & competitive exams! Register using my referral link:";

  const handleShareWhatsApp = () => {
    const shareUrl = getShareUrl();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
  };

  const handleShareTelegram = () => {
    const shareUrl = getShareUrl();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div>
      {/* Top Banner Header */}
      <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '24px', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-amber" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>
                <Share2 size={13} /> AFFILIATE & BINARY MLM NETWORK PORTAL
              </span>
              <span className="badge badge-primary" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>
                {stats?.rank || 'BRONZE'} PARTNER SUITE
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0' }}>
              Welcome, {user?.name || 'Affiliate Partner'} ({stats?.referralCode || user?.userId || 'EDU-99201'})
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Interactive Visual Binary Tree, Left/Right PV Volume Inspectors, Marketing Suite & 1-Click Payout Releases.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => { loadStats(); loadTree(); }} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
              <RefreshCw size={14} className={isLoadingStats || isLoadingTree ? 'animate-spin' : ''} /> Refresh Data
            </button>
            <button className="btn-amber" onClick={handleSeedNetwork} disabled={isSeeding} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
              <Sparkles size={14} /> {isSeeding ? 'Seeding...' : 'Seed Sample Network'}
            </button>
            <button className="btn-secondary" onClick={() => setShowQrModal(true)} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
              <QrCode size={15} /> QR Code Share
            </button>
            <button className="btn-primary" onClick={copyReferralLink} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Link Copied!' : 'Copy Referral Link'}
            </button>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontSize: '0.85rem', fontWeight: '700', marginBottom: '20px' }}>
          {feedbackMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Rank Progress & Auto-Placement Selector Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Rank Progression Bar */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.95rem', color: '#FBBF24' }}>
              <Award size={18} /> Current Rank: {stats?.rank || 'BRONZE'} PARTNER
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progress Active</span>
          </div>

          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: stats?.rank === 'GOLD' ? '85%' : '45%', height: '100%', background: 'var(--amber-gradient)' }} />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Total Network Volume: <strong style={{ color: '#FFF' }}>{stats ? (stats.totalVolume || 0).toLocaleString('en-IN') : 0} PV</strong> (Direct Referrals: {stats?.directReferralsCount || 0})
          </div>
        </div>

        {/* Auto-Placement Selector */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={18} color="var(--primary-accent)" />
            Downline Binary Placement Leg Preference
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handlePlacementChange('AUTO')}
              disabled={isUpdatingPreference}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '10px',
                border: placementLeg === 'AUTO' ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
                background: placementLeg === 'AUTO' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                color: placementLeg === 'AUTO' ? '#818CF8' : 'var(--text-secondary)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              ⚖️ Auto-Balance
            </button>

            <button
              onClick={() => handlePlacementChange('LEFT')}
              disabled={isUpdatingPreference}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '10px',
                border: placementLeg === 'LEFT' ? '2px solid #34D399' : '1px solid var(--border-color)',
                background: placementLeg === 'LEFT' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
                color: placementLeg === 'LEFT' ? '#34D399' : 'var(--text-secondary)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              👈 Force Left
            </button>

            <button
              onClick={() => handlePlacementChange('RIGHT')}
              disabled={isUpdatingPreference}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '10px',
                border: placementLeg === 'RIGHT' ? '2px solid #818CF8' : '1px solid var(--border-color)',
                background: placementLeg === 'RIGHT' ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.03)',
                color: placementLeg === 'RIGHT' ? '#818CF8' : 'var(--text-secondary)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              👉 Force Right
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Social Marketing Share Suite Bar */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Share2 size={22} color="var(--primary-accent)" />
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>1-Click Social Marketing Share Suite</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Share referral link directly to WhatsApp & Telegram contacts</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-emerald" onClick={handleShareWhatsApp} style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', border: 'none', padding: '8px 14px', fontSize: '0.8rem' }}>
            <MessageSquare size={15} /> WhatsApp Share
          </button>

          <button className="btn-primary" onClick={handleShareTelegram} style={{ background: 'linear-gradient(135deg, #0088cc 0%, #006699 100%)', border: 'none', padding: '8px 14px', fontSize: '0.8rem' }}>
            <Send size={15} /> Telegram Share
          </button>
        </div>
      </div>

      {/* Complete Binary MLM Calculation & Payout Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.12) 100%)', borderRadius: '18px', border: '1px solid rgba(245,158,11,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '4px' }}>
              ⚡ REAL-TIME BINARY MATCHING COMMISSION BREAKDOWN
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ₹ {stats ? (stats.netPayableBonus || 0).toLocaleString('en-IN') : 0}.00
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>(Net Receivable Payout)</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>Lifetime Binary Paid</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FBBF24' }}>
              ₹ {stats ? (stats.totalEarnings || 0).toLocaleString('en-IN') : 0}.00
            </div>
          </div>
        </div>

        {/* Binary Matching Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'var(--bg-surface)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>CARRIED LEFT PV</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#34D399' }}>{stats?.carriedLeftPV || 0} PV</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total: {stats?.leftVolume || 0} PV</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>CARRIED RIGHT PV</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#818CF8' }}>{stats?.carriedRightPV || 0} PV</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total: {stats?.rightVolume || 0} PV</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>1:1 MATCHED PAIRS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#FBBF24' }}>{stats?.matchedPV || 0} PV</div>
            <div style={{ fontSize: '0.68rem', color: '#FBBF24' }}>10% Rate = ₹{stats?.grossMatchingBonus || 0}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>DAILY CAPPING LIMIT</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: stats?.isCapped ? '#FB7185' : '#34D399' }}>₹25,000 / day</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{stats?.isCapped ? '⚠️ Capped Limit Reached' : '✅ Within Capping Limit'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>DEDUCTIONS (10%)</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FB7185' }}>- ₹{(stats?.adminFee || 0) + (stats?.tdsDeduction || 0)}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>5% Admin (₹{stats?.adminFee || 0}) + 5% TDS (₹{stats?.tdsDeduction || 0})</div>
          </div>
        </div>
      </div>

      {/* Render Main Binary Tree & Volume Visualizer */}
      <MlmTreeVisualizer
        treeData={treeData}
        stats={stats}
        isLoading={isLoadingTree || isLoadingStats}
        onRefresh={() => { loadStats(); loadTree(); loadPayoutHistoryData(); }}
      />

      {/* Binary Payout Statements Table */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '28px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>📜 Binary Payout Settlement Statements</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Official audit logs of processed 1:1 pair matching bonuses with 5% Admin & 5% TDS deductions.</p>
          </div>
          <span className="badge badge-amber" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            {payoutHistory.length} Statements Logged
          </span>
        </div>

        {payoutHistory.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No past payout statements recorded yet. Payouts are triggered daily by Super Admin settlement.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Cycle Date</th>
                  <th>Matched Volume</th>
                  <th>Gross Bonus</th>
                  <th>Capping Applied</th>
                  <th>5% Admin Fee</th>
                  <th>5% TDS</th>
                  <th>Net Paid to Wallet</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((item) => (
                  <tr key={item._id}>
                    <td>{new Date(item.cycleDate).toLocaleString('en-IN')}</td>
                    <td><strong style={{ color: '#FBBF24' }}>{item.matchedVolume} PV</strong></td>
                    <td>₹{item.grossBonus}</td>
                    <td>₹{item.cappedGrossBonus}</td>
                    <td style={{ color: '#FB7185' }}>- ₹{item.adminFee}</td>
                    <td style={{ color: '#FB7185' }}>- ₹{item.tdsDeduction}</td>
                    <td><strong style={{ color: '#34D399', fontSize: '0.9rem' }}>₹{item.netPayout}</strong></td>
                    <td><span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR CODE GENERATOR MODAL */}
      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '28px', textAlign: 'center', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>MOBILE QR CODE SCANNER</span>
              <button onClick={() => setShowQrModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '6px' }}>
              Scan QR to Join Team
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
              Scan with any mobile camera to register under {user?.name || 'Affiliate Sponsor'} ({stats?.referralCode || user?.userId})
            </p>

            {/* Generated QR Code Preview Box */}
            <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px' }}>
              <QrCode size={160} color="#000" />
            </div>

            <div style={{ fontSize: '0.85rem', color: '#FBBF24', fontWeight: '700' }}>
              Referral Code: {stats?.referralCode || user?.userId || 'EDU-99201'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

