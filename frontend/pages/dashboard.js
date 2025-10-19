import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import SIPCalculator from "../components/SIPCalculator";
import LumpsumCalculator from "../components/LumpsumCalculator";
import PortfolioAnalyzer from "../components/PortfolioAnalyzer";
import MoneyTracker from "../components/MoneyTracker";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("sip");
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      <header className="header">
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              marginBottom: "8px",
              letterSpacing: "-0.5px",
            }}
          >
            💰 AI Finance Assistant
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "rgba(255, 255, 255, 0.95)",
              fontWeight: "500",
            }}
          >
            Welcome back, {user?.name}!
          </p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <nav className="nav-tabs">
        <button
          className={activeTab === "sip" ? "tab active" : "tab"}
          onClick={() => setActiveTab("sip")}
        >
          SIP Calculator
        </button>
        <button
          className={activeTab === "lumpsum" ? "tab active" : "tab"}
          onClick={() => setActiveTab("lumpsum")}
        >
          Lumpsum Calculator
        </button>
        <button
          className={activeTab === "portfolio" ? "tab active" : "tab"}
          onClick={() => setActiveTab("portfolio")}
        >
          Portfolio Analyzer
        </button>
        <button
          className={activeTab === "tracker" ? "tab active" : "tab"}
          onClick={() => setActiveTab("tracker")}
        >
          Money Tracker
        </button>
      </nav>

      <main className="content">
        {activeTab === "sip" && <SIPCalculator />}
        {activeTab === "lumpsum" && <LumpsumCalculator />}
        {activeTab === "portfolio" && <PortfolioAnalyzer />}
        {activeTab === "tracker" && <MoneyTracker />}
      </main>

      <footer className="footer">
        <p>© 2025 AI Finance Assistant | For Educational Purposes Only</p>
      </footer>

      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          background: rgba(255, 255, 255, 0.15);
          padding: 24px 32px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .logout-btn {
          padding: 12px 28px;
          background: rgba(255, 255, 255, 0.25);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          backdrop-filter: blur(10px);
        }

        .logout-btn:hover {
          background: white;
          color: #0d9488;
          border-color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
