import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Transactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/merchants/dashboard');
      setPayments(res.data.payments);
    } catch (error) {
      toast.error('Failed to load transactions');
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
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View your complete payment history.</p>
        </div>
      </div>

      <div className="card">
        {payments.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found.</p>
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
                  <tr key={p._id} style={{ transition: 'background-color 0.2s' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar" style={{ background: 'var(--bg-tertiary)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {p.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.user?.name || 'Unknown User'}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.user?.mobileNumber || p.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '1.1rem' }}>+{p.coinsAmount}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{formatDate(p.createdAt)}</td>
                    <td>
                      <span className={`badge badge-${p.status === 'completed' ? 'active' : 'pending'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
