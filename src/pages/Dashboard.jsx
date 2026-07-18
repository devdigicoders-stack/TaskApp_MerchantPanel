import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
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

  const handleDownloadQR = () => {
    const qrCanvas = document.getElementById('merchant-qr-code');
    if (!qrCanvas) {
      toast.error('QR Code not found. Please refresh and try again.');
      return;
    }

    const drawAndDownload = (logoImage) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const width = 600;
        const height = 900;
        canvas.width = width;
        canvas.height = height;

        // 1. Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 2. GPay Style Corner Bands
        // Top Left (Red)
        ctx.fillStyle = '#EA4335';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(250, 0);
        ctx.quadraticCurveTo(80, 80, 0, 250);
        ctx.fill();

        // Top Right (Blue)
        ctx.fillStyle = '#4285F4';
        ctx.beginPath();
        ctx.moveTo(width, 0);
        ctx.lineTo(width - 250, 0);
        ctx.quadraticCurveTo(width - 80, 80, width, 250);
        ctx.fill();

        // Bottom Left (Yellow/Orange)
        ctx.fillStyle = '#F29900';
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(250, height);
        ctx.quadraticCurveTo(80, height - 80, 0, height - 250);
        ctx.fill();
        
        // Bottom Right (Green)
        ctx.fillStyle = '#34A853';
        ctx.beginPath();
        ctx.moveTo(width, height);
        ctx.lineTo(width - 250, height);
        ctx.quadraticCurveTo(width - 80, height - 80, width, height - 250);
        ctx.fill();

        // 3. Logo and App Name
        if (logoImage) {
          const logoWidth = 140;
          const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
          const logoX = (width - logoWidth) / 2;
          const logoY = 60;
          ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
        } else {
          // Fallback text if no logo
          ctx.fillStyle = '#1e1e2d';
          ctx.font = 'bold 50px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TaskApp', width / 2, 120);
        }

        // 4. Merchant Name
        ctx.fillStyle = '#1e1e2d';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(qrData?.shopName || 'Merchant', width / 2, 210);

        // 5. Draw QR Code with Shadow and Rounded Corners
        const qrSize = 350;
        const qrX = (width - qrSize) / 2;
        const qrY = 270;
        
        const drawRoundedRect = (x, y, w, h, r) => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
        };
        
        // Shadow for QR box
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 15;
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(qrX - 24, qrY - 24, qrSize + 48, qrSize + 48, 24);
        ctx.fill();
        
        // Reset shadow for QR image
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw actual QR
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

        // 6. Scan and Pay Text
        ctx.fillStyle = '#444444';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Scan and pay with any BHIM UPI app', width / 2, qrY + qrSize + 60);

        // 7. UPI Supported Icons Text (Fallback if we don't have images)
        ctx.fillStyle = '#555555';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('GPay | PhonePe | Paytm | UPI', width / 2, qrY + qrSize + 120);

        // 8. Download the canvas
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${qrData?.shopName?.replace(/\s+/g, '_') || 'Merchant'}_Standee.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('Standee downloaded successfully!');
      } catch (err) {
        console.error('Download failed:', err);
        toast.error('Failed to download QR Standee.');
      }
    };

    // Load actual logo image
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous'; // Important for canvas toDataURL
    logoImg.onload = () => drawAndDownload(logoImg);
    logoImg.onerror = () => drawAndDownload(null);
    logoImg.src = '/logo.png';
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pay ${qrData?.shopName}`,
          text: `Scan this QR code to pay ${qrData?.shopName}`,
          url: `merchant:${qrData?.qrData}`
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      toast.error('Sharing not supported on this device/browser');
    }
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
              <QRCodeCanvas id="merchant-qr-code" value={`merchant:${qrData.qrData}`} size={220} bgColor="#ffffff" fgColor="#000000" />
            </div>
          ) : (
            <p>QR Code not available</p>
          )}
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem', zIndex: 1 }}>Scan to pay <strong>{qrData?.shopName}</strong></p>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', zIndex: 1 }}>
            <button className="btn btn-secondary" style={{ borderRadius: '20px' }} onClick={handleDownloadQR}>
              <FiDownload /> Download
            </button>
            <button className="btn btn-primary" style={{ borderRadius: '20px' }} onClick={handleShareQR}>
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
