import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await axios.post(`${API_URL}${endpoint}`, {

        email: formData.email,
        password: formData.password,
        name: isLogin ? undefined : formData.name
      });

      // Save token and user data
      login(response.data.token, response.data.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>💰 Finance Assistant</h1>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required={!isLogin}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength="6"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="toggle-auth">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0D47A1 0%, #1C1C1C 100%);
          position: relative;
        }

        .auth-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .auth-box {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.95) 100%);
          backdrop-filter: blur(20px);
          padding: 50px;
          border-radius: 20px;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.15);
          width: 100%;
          max-width: 450px;
          position: relative;
          z-index: 1;
        }

        h1 {
          text-align: center;
          background: linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 15px;
          font-size: 36px;
          font-weight: 700;
          font-family: 'Playfair Display', serif;
        }

        h2 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        input {
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }

        input:focus {
          outline: none;
          border-color: #D4AF37;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1), 0 4px 12px rgba(13, 71, 161, 0.1);
          background: #fff;
        }

        button[type="submit"] {
          padding: 16px;
          background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(13, 71, 161, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          letter-spacing: 0.5px;
        }

        button[type="submit"]:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(13, 71, 161, 0.45), 0 0 0 1px rgba(212, 175, 55, 0.3);
        }

        button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 15px;
        }

        .toggle-auth {
          text-align: center;
          margin-top: 20px;
          color: #666;
        }

        .toggle-auth button {
          background: none;
          border: none;
          color: #D4AF37;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          transition: all 0.3s;
        }

        .toggle-auth button:hover {
          color: #0D47A1;
        }
      `}</style>
    </div>
  );
}
