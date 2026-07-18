import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { FiDollarSign, FiClock, FiDownload, FiShare2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalCoins: 0, todayCoins: 0, paymentCount: 0 });
  const [recentPayments, setRecentPayments] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, qrRes] = await Promise.all([
        api.get('/merchants/dashboard'),
        api.get('/merchants/qr')
      ]);
      setStats(dashRes.data.stats);
      setRecentPayments(dashRes.data.payments.slice(0, 5)); // show only top 5 here
      setQrData(qrRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your store!</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: QR Code */}
        <div className="card glassmorphism qr-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
          <div className="qr-glow-bg"></div>
          <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-primary)', zIndex: 1 }}>Your Payment QR Code</h3>
          {qrData?.qrData ? (
            <div style={{ background: '#fff', padding: 24, borderRadius: 24, marginBottom: 24, boxShadow: '0 10px 40px rgba(99, 102, 241, 0.2)', zIndex: 1 }}>
              <QRCodeSVG value={`merchant:${qrData.qrData}`} size={220} />
            </div>
          ) : (
            <p>QR Code not available</p>
          )}
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem', zIndex: 1 }}>Scan to pay <strong>{qrData?.shopName}</strong></p>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', zIndex: 1 }}>
            <button className="btn btn-secondary" style={{ borderRadius: '20px' }}>
              <FiDownload /> Download
            </button>
            <button className="btn btn-primary" style={{ borderRadius: '20px' }}>
              <FiShare2 /> Share QR
            </button>
          </div>
        </div>

        {/* Right Column: Stats & Recent Tx */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
          <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(30,30,40,1) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)' }}>
                <FiDollarSign />
              </div>
              <div className="stat-info">
                <p className="stat-title">Total Collected</p>
                <h3 className="stat-value">{stats.totalCoins} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Coins</span></h3>
              </div>
            </div>
            
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(30,30,40,1) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-green)' }}>
                <FiClock />
              </div>
              <div className="stat-info">
                <p className="stat-title">Today's Collection</p>
                <h3 className="stat-value">{stats.todayCoins} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Coins</span></h3>
              </div>
            </div>
          </div>

          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between align-center" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Recent Transactions</h3>
              <Link to="/transactions" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>View All</Link>
            </div>
            
            {recentPayments.length === 0 ? (
              <div className="empty-state" style={{ flex: 1, minHeight: '150px' }}>
                <p>No transactions today.</p>
              </div>
            ) : (
              <div className="transaction-list">
                {recentPayments.map(p => (
                  <div key={p._id} className="transaction-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar" style={{ background: 'var(--bg-tertiary)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {p.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.user?.name || 'Unknown User'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDate(p.createdAt)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '1.1rem' }}>+{p.coinsAmount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coins</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
