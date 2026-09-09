import React, { useState } from 'react';
import { Network, Copy, Check, Award, Share2, RefreshCw, ZoomIn, RotateCcw } from 'lucide-react';
import { MlmNodeRecord, AffiliateStats } from '../services/affiliateService';

interface MlmTreeVisualizerProps {
  treeData?: MlmNodeRecord | null;
  stats?: AffiliateStats | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

interface TreeNodeItemProps {
  node?: MlmNodeRecord | null;
  positionLabel: string;
  depth: number;
  maxDepth: number;
  displayRootId: string;
  onNodeClick: (node: MlmNodeRecord) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  positionLabel,
  depth,
  maxDepth,
  displayRootId,
  onNodeClick
}) => {
  if (!node || node.userId === 'VACANT') {
    return (
      <div style={{
        border: '2px dashed var(--border-color)',
        borderRadius: '10px',
        padding: '8px 12px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.72rem',
        minWidth: '115px',
        background: 'rgba(255,255,255,0.01)'
      }}>
        Empty Spot ({positionLabel})
      </div>
    );
  }

  const isFocused = displayRootId === node.id;
  const hasChildren = Boolean(node.leftLeg || node.rightLeg);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Node Card */}
      <div
        onClick={() => {
          if (node.userId !== 'VACANT') {
            onNodeClick(node);
          }
        }}
        className="glass-card"
        title="Click node to drill down into its binary tree"
        style={{
          padding: '10px 14px',
          border: isFocused ? '2px solid #818CF8' : '1px solid var(--border-color)',
          background: isFocused ? 'rgba(99,102,241,0.2)' : 'var(--bg-card)',
          cursor: 'pointer',
          minWidth: '135px',
          textAlign: 'center',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          boxShadow: isFocused ? '0 0 14px rgba(99,102,241,0.3)' : undefined
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
            {node.rank || 'BRONZE'}
          </span>
          {hasChildren && <ZoomIn size={12} color="#818CF8" />}
        </div>

        <div style={{ fontWeight: '800', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '1px' }}>
          {node.name}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'monospace' }}>
          ID: {node.userId}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
          <span>L: <strong style={{ color: '#34D399' }}>{node.leftVolume || 0} PV</strong></span>
          <span>•</span>
          <span>R: <strong style={{ color: '#818CF8' }}>{node.rightVolume || 0} PV</strong></span>
        </div>
      </div>

      {/* Render Child Legs Recursively (Up to maxDepth) */}
      {depth < maxDepth && (node.leftLeg || node.rightLeg) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ width: '2px', height: '14px', background: 'var(--primary-accent)' }} />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TreeNodeItem
                node={node.leftLeg}
                positionLabel="L"
                depth={depth + 1}
                maxDepth={maxDepth}
                displayRootId={displayRootId}
                onNodeClick={onNodeClick}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TreeNodeItem
                node={node.rightLeg}
                positionLabel="R"
                depth={depth + 1}
                maxDepth={maxDepth}
                displayRootId={displayRootId}
                onNodeClick={onNodeClick}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MlmTreeVisualizer: React.FC<MlmTreeVisualizerProps> = ({
  treeData,
  stats,
  isLoading,
  onRefresh
}) => {
  const [copied, setCopied] = useState(false);
  const [focusedNode, setFocusedNode] = useState<MlmNodeRecord | null>(null);

  const copyReferralLink = () => {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    let link = stats?.referralLink || `${currentOrigin}/register?ref=${stats?.referralCode || 'EDU-99201'}`;
    if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
      link = link.replace('https://eduverse.in', currentOrigin);
    }
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayRoot = focusedNode || treeData;

  return (
    <div>
      {/* Top Banner: Binary Volume & Earnings Metrics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818CF8', fontWeight: '700', fontSize: '0.8rem', marginBottom: '4px' }}>
            <Award size={16} /> YOUR CURRENT RANK
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{stats?.rank || 'BRONZE'} PARTNER</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Matching Bonus: 10% Weaker Leg Volume</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: '700', marginBottom: '4px' }}>
            LEFT LEG VOLUME (PV)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34D399' }}>
            {stats ? stats.leftVolume.toLocaleString('en-IN') : 0} PV
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Left Downline Accumulation</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#818CF8', fontWeight: '700', marginBottom: '4px' }}>
            RIGHT LEG VOLUME (PV)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#818CF8' }}>
            {stats ? stats.rightVolume.toLocaleString('en-IN') : 0} PV
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Right Downline Accumulation</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#FBBF24', fontWeight: '700', marginBottom: '4px' }}>
            ESTIMATED MATCHING BONUS
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FBBF24' }}>
            ₹ {stats ? (stats.estimatedMatchingBonus || 0).toLocaleString('en-IN') : 0}.00
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>10% Weaker Leg Balance</div>
        </div>
      </div>

      {/* Referral Link Bar */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Share2 size={22} color="var(--primary-accent)" />
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Your Binary Referral Share Link</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Referral Code: <strong>{stats?.referralCode || 'EDU-99201'}</strong> • Direct Referrals: <strong>{stats?.directReferralsCount || 0} Members</strong>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={copyReferralLink} style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Link Copied!' : 'Copy Referral Link'}
        </button>
      </div>

      {/* Visual Binary Tree Display */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                <Network size={12} /> RECURSIVE DYNAMIC BINARY TREE VISUALIZER (FULL DOWNLINE)
              </span>
              {focusedNode && (
                <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ZoomIn size={12} /> Focused on: {focusedNode.name} ({focusedNode.userId})
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '2px 0' }}>
              Downline Tree & Leg Structure
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              💡 Click any node card below to zoom/drill down into its personal binary network tree.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {focusedNode && (
              <button
                type="button"
                className="btn-amber"
                onClick={() => setFocusedNode(null)}
                style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={14} /> Reset View to Top Root
              </button>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={onRefresh}
              style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Reload Tree
            </button>
          </div>
        </div>

        {/* Tree Render Structure */}
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Loading binary network hierarchy...
          </div>
        ) : !displayRoot ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No binary tree data found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto', padding: '14px 0' }}>
            <TreeNodeItem
              node={displayRoot}
              positionLabel="Root"
              depth={1}
              maxDepth={20}
              displayRootId={displayRoot.id}
              onNodeClick={(clickedNode) => setFocusedNode(clickedNode)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
