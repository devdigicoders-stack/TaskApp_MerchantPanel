import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiGift, FiCheck, FiX, FiClock, FiUser, FiPackage } from 'react-icons/fi';

const STATUS_COLORS = {
  pending:  { color: 'var(--accent-orange)', bg: 'rgba(251,146,60,0.1)' },
  approved: { color: 'var(--accent-green)',  bg: 'rgba(16,185,129,0.1)' },
  rejected: { color: 'var(--accent-red)',    bg: 'rgba(239,68,68,0.1)'  },
};

export default function Redemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [resolving, setResolving]     = useState(null);
  const [filter, setFilter]           = useState('all');

  useEffect(() => { fetchRedemptions(); }, []);

  const fetchRedemptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/redemptions');
      setRedemptions(res.data.redemptions || []);
    } catch {
      toast.error('Failed to load redemptions');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, status) => {
    setResolving(id + status);
    try {
      await api.put(`/redemptions/${id}`, { status });
      toast.success(status === 'approved' ? 'Redemption approved! 🎉' : 'Redemption rejected.');
      fetchRedemptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setResolving(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const filtered = filter === 'all'
    ? redemptions
    : redemptions.filter((r) => r.status === filter);

  const pendingCount  = redemptions.filter((r) => r.status === 'pending').length;
  const approvedCount = redemptions.filter((r) => r.status === 'approved').length;
  const rejectedCount = redemptions.filter((r) => r.status === 'rejected').length;

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiGift /> Gift Redemptions
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Approve or reject user gift redemption requests.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Pending',  count: pendingCount,  color: 'var(--accent-orange)', icon: <FiClock /> },
          { label: 'Approved', count: approvedCount, color: 'var(--accent-green)',  icon: <FiCheck /> },
          { label: 'Rejected', count: rejectedCount, color: 'var(--accent-red)',    icon: <FiX />    },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ padding: '18px 20px' }}>
            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <p className="stat-title">{s.label}</p>
              <h3 className="stat-value" style={{ color: s.color }}>{s.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`btn ${filter === tab ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 20, padding: '6px 18px', fontSize: '0.85rem', textTransform: 'capitalize' }}
          >
            {tab}{tab !== 'all' ? ` (${redemptions.filter(r => r.status === tab).length})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <FiGift size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-muted)' }}>No {filter === 'all' ? '' : filter} redemptions found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((r) => {
            const sc = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
            const giftImg = r.gift?.image || '';
            const isImgUrl = giftImg.startsWith('http://') || giftImg.startsWith('https://');

            return (
              <div key={r._id} className="card" style={{
                padding: '18px 22px',
                display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
                borderLeft: `3px solid ${sc.color}`,
              }}>
                {/* Gift Image */}
                <div style={{
                  width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                  background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isImgUrl
                    ? <img src={giftImg} alt={r.gift?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <FiPackage size={22} style={{ color: 'var(--text-muted)' }} />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {r.gift?.name || 'Unknown Gift'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <FiUser size={12} />
                    <span>{r.user?.name || 'User'}</span>
                    <span>·</span>
                    <span>{r.user?.mobileNumber || r.user?.email}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    🪙 {r.gift?.requiredCoins} Coins &nbsp;•&nbsp; {formatDate(r.createdAt)}
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{
                  padding: '4px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                  color: sc.color, background: sc.bg, letterSpacing: '0.05em', textTransform: 'uppercase',
                  flexShrink: 0,
                }}>
                  {r.status}
                </div>

                {/* Actions */}
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      id={`approve-${r._id}`}
                      className="btn"
                      style={{
                        background: 'rgba(16,185,129,0.12)', color: 'var(--accent-green)',
                        border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '7px 16px',
                        display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.85rem',
                        cursor: resolving ? 'not-allowed' : 'pointer', opacity: resolving ? 0.6 : 1,
                      }}
                      disabled={!!resolving}
                      onClick={() => handleResolve(r._id, 'approved')}
                    >
                      {resolving === r._id + 'approved'
                        ? <span className="spinner" style={{ width: 14, height: 14 }} />
                        : <FiCheck size={14} />
                      }
                      Approve
                    </button>
                    <button
                      id={`reject-${r._id}`}
                      className="btn"
                      style={{
                        background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)',
                        border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '7px 16px',
                        display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.85rem',
                        cursor: resolving ? 'not-allowed' : 'pointer', opacity: resolving ? 0.6 : 1,
                      }}
                      disabled={!!resolving}
                      onClick={() => handleResolve(r._id, 'rejected')}
                    >
                      {resolving === r._id + 'rejected'
                        ? <span className="spinner" style={{ width: 14, height: 14 }} />
                        : <FiX size={14} />
                      }
                      Reject
                    </button>
                  </div>
                )}

                {r.status !== 'pending' && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>Resolved</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
