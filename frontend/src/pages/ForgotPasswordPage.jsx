import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgotPassword', { email });
      // Set cooldown timer from backend response
      if (response.data.nextResendTime) {
        setResendCooldown(response.data.nextResendTime);
      }
      // Automatically redirect to OTP verification page
      navigate('/verify-reset-otp', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendOTP = async () => {
    if (!email.trim()) {
      setError('Please enter email first');
      return;
    }

    try {
      const response = await api.post('/auth/forgotPassword', { email });
      if (response.data.nextResendTime) {
        setResendCooldown(response.data.nextResendTime);
      }
      setError('');
      console.log('OTP resent successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand auth-brand-center">
          <div className="auth-logo" aria-hidden="true">
            <img src="/to-do-list%20Logo.png" alt="Task Flow logo" className="auth-logo-img" />
          </div>
          <div className="brand-text">Task Flow</div>
        </div>
        
        <h1>Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to receive OTP</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <div className="form-actions">
          <button 
            onClick={handleResendOTP} 
            disabled={resendCooldown > 0 || loading || !email.trim()}
            className="btn btn-link"
          >
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
          </button>
          <button onClick={handleBackToLogin} className="btn btn-link">
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
