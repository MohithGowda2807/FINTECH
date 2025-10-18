import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        email: formData.email,
        password: formData.password,
        name: isLogin ? undefined : formData.name,
      });

      // Save token and user data
      login(response.data.token, response.data.user);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>💰 Finance Assistant</h1>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required={!isLogin}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            minLength="6"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="toggle-auth">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(
            135deg,
            #0d9488 0%,
            #06b6d4 50%,
            #0ea5e9 100%
          );
          padding: 20px;
        }

        .auth-box {
          background: rgba(255, 255, 255, 0.95);
          padding: 48px;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(13, 148, 136, 0.25),
            0 8px 24px rgba(6, 182, 212, 0.15);
          width: 100%;
          max-width: 440px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        h1 {
          text-align: center;
          background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        h2 {
          text-align: center;
          color: #1e293b;
          margin-bottom: 32px;
          font-weight: 600;
          font-size: 1.5rem;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        input {
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          background: rgba(241, 245, 249, 0.8);
          transition: all 0.25s ease;
        }

        input:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
          background: white;
        }

        input:hover {
          border-color: #14b8a6;
        }

        button[type="submit"] {
          padding: 16px;
          background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(13, 148, 136, 0.3);
          margin-top: 8px;
        }

        button[type="submit"]:hover:not(:disabled) {
          background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(13, 148, 136, 0.4);
        }

        button[type="submit"]:active {
          transform: translateY(0);
        }

        button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          padding: 14px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 16px;
          border-left: 4px solid #ef4444;
          font-weight: 500;
        }

        .toggle-auth {
          text-align: center;
          margin-top: 24px;
          color: #64748b;
          font-size: 15px;
        }

        .toggle-auth button {
          background: none;
          border: none;
          color: #0d9488;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .toggle-auth button:hover {
          color: #0f766e;
        }
      `}</style>
    </div>
  );
}
