import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import SIPCalculator from '../components/SIPCalculator';
import LumpsumCalculator from '../components/LumpsumCalculator';
import LumpsumSIPCalculator from '../components/LumpsumSIPCalculator'; // NEW
import StepUpSIPCalculator from '../components/StepUpSIPCalculator'; // NEW
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
          className={activeTab === 'lumpsum-sip' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('lumpsum-sip')}
        >
          Lumpsum + SIP
        </button>
        <button
          className={activeTab === 'stepup-sip' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('stepup-sip')}
        >
          Step-Up SIP
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
        {activeTab === 'lumpsum-sip' && <LumpsumSIPCalculator />}
        {activeTab === 'stepup-sip' && <StepUpSIPCalculator />}
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
          padding: 10px 25px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
        }

        .logout-btn:hover {
          background: white;
          color: #0D9488;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
        }

        .nav-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .tab {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }

        .tab.active {
          background: white;
          color: #667eea;
          border-color: white;
        }

        .tab:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
