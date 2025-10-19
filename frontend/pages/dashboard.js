import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import SIPCalculator from '../components/SIPCalculator';
import LumpsumCalculator from '../components/LumpsumCalculator';
import PortfolioAnalyzer from '../components/PortfolioAnalyzer';
import MoneyTracker from '../components/MoneyTracker';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('sip');
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <header className="header">
        <div>
          <h1>💰 AI Finance Assistant</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <nav className="nav-tabs">
        <button 
          className={activeTab === 'sip' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('sip')}
        >
          SIP Calculator
        </button>
        <button 
          className={activeTab === 'lumpsum' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('lumpsum')}
        >
          Lumpsum Calculator
        </button>
        <button 
          className={activeTab === 'portfolio' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio Analyzer
        </button>
        <button 
          className={activeTab === 'tracker' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('tracker')}
        >
          Money Tracker
        </button>
      </nav>

      <main className="content">
        {activeTab === 'sip' && <SIPCalculator />}
        {activeTab === 'lumpsum' && <LumpsumCalculator />}
        {activeTab === 'portfolio' && <PortfolioAnalyzer />}
        {activeTab === 'tracker' && <MoneyTracker />}
      </main>

      <footer className="footer">
        <p>© 2025 AI Finance Assistant | For Educational Purposes Only</p>
      </footer>

      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .logout-btn {
          padding: 12px 28px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
          color: white;
          border: 2px solid rgba(212, 175, 55, 0.4);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          letter-spacing: 0.3px;
        }

        .logout-btn:hover {
          background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
          color: #0D47A1;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
          border-color: #D4AF37;
        }
      `}</style>
    </div>
  );
}
