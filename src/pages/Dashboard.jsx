import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { FiLogOut, FiDollarSign, FiClock } from 'react-icons/fi';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalCoins: 0, todayCoins: 0, paymentCount: 0 });
  const [payments, setPayments] = useState([]);
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
      setPayments(dashRes.data.payments);
      setQrData(qrRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Merchant Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Welcome, {user?.name} ({user?.shopName})</p>
        </div>
        <button onClick={logout} className="btn btn-secondary">
          <FiLogOut style={{ marginRight: 8 }} /> Logout
        </button>
      </header>

      <div className="grid">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Your Payment QR Code</h3>
          {qrData?.qrData ? (
            <div style={{ background: '#fff', padding: 16, borderRadius: 16, marginBottom: 16 }}>
              <QRCodeSVG value={`merchant:${qrData.qrData}`} size={200} />
            </div>
          ) : (
            <p>QR Code not available</p>
          )}
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Scan to pay {qrData?.shopName}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
                <FiDollarSign />
              </div>
              <div className="stat-info">
                <p className="stat-title">Total Collected</p>
                <h3 className="stat-value">{stats.totalCoins} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Coins</span></h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}>
                <FiClock />
              </div>
              <div className="stat-info">
                <p className="stat-title">Today's Collection</p>
                <h3 className="stat-value">{stats.todayCoins} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Coins</span></h3>
              </div>
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, color: 'var(--text-primary)' }}>Recent Transactions</h3>
            {payments.length === 0 ? (
              <div className="empty-state">
                <p>No transactions yet.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount (Coins)</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.user?.name || 'Unknown User'}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.user?.mobileNumber || p.user?.email}</div>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>+{p.coinsAmount}</td>
                        <td style={{ fontSize: '0.875rem' }}>{formatDate(p.createdAt)}</td>
                        <td><span className={`badge badge-${p.status === 'completed' ? 'active' : 'pending'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
