import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiBriefcase, FiKey } from 'react-icons/fi';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="page-header" style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex-between align-center" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your merchant profile.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        <div className="card">
          <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiUser className="text-accent" /> Profile Information
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <FiUser style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontWeight: 500 }}>{user?.name}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <FiMail style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontWeight: 500 }}>{user?.email}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Shop Name</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <FiBriefcase style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontWeight: 500 }}>{user?.shopName}</span>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Merchant ID (QR)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <FiKey style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontWeight: 500, fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{user?.merchantQrId}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
