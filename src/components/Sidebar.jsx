import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPieChart, FiList, FiSettings, FiLogOut, FiGift } from 'react-icons/fi';

const NAV_ITEMS = [
  { to: '/',             icon: <FiPieChart />, label: 'Dashboard',   id: 'nav-dashboard'   },
  { to: '/transactions', icon: <FiList />,     label: 'Transactions', id: 'nav-transactions' },
  { to: '/redemptions',  icon: <FiGift />,     label: 'Redemptions',  id: 'nav-redemptions'  },
  { to: '/settings',     icon: <FiSettings />, label: 'Settings',     id: 'nav-settings'     },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo" style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.png" alt="Merchant Panel" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>TaskApp</h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>Merchant Panel</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-label">Main Menu</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            id={item.id}
            to={item.to}
            end={item.to === '/'}
            onClick={() => { if (onClose) onClose(); }}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'M'}
          </div>
          <div className="user-info">
            <div className="name">{user?.name || 'Merchant'}</div>
            <div className="role">{user?.shopName}</div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', padding: 4, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--accent-red)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </aside>
  );
}
