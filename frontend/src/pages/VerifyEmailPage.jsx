import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import "../styles/VerifyEmail.css";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [expiryTs, setExpiryTs] = useState(null); // ms timestamp when OTP expires
  const [tick, setTick] = useState(0); // used to update countdown every second
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchParams] = useSearchParams();

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // If email present in query (from signup), mark OTP as sent and start expiry
  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) {
      setEmail(qEmail);
      setOtpSent(true);
      setExpiryTs(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    }
  }, [searchParams]);

  // Tick every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const { verifyEmail } = useContext(AuthContext);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim()) {
      setError("Please enter email and OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyEmail(email, otp);
      setError("");
      navigate("/todos");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/resend-verify-email", { email });
      // Show toast notification instead of success message
      setToastMessage(`OTP resent to ${email}`);
      setShowToast(true);
      setError("");
      setResendCooldown(response.data.nextResendTime || 60);
      // Mark OTP sent and set expiry for 10 minutes
      setOtpSent(true);
      setExpiryTs(Date.now() + 10 * 60 * 1000);
      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-email-container">
      {showToast && (
        <div className="toast-notification">
          ✓ {toastMessage}
        </div>
      )}
      <div className="verify-email-card">
        <h1>Email Verification</h1>

        {success && (
          <div className="alert alert-success">
            ✓ Email sent to <strong>{email}</strong>! Check your inbox.
          </div>
        )}

        {error && <div className="alert alert-error">✗ {error}</div>}

        {loading && !success && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Verifying your email...</p>
          </div>
        )}

        {!loading && !success && (
          <form onSubmit={handleVerifySubmit} className="verify-form">
            {!otpSent && (
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {otpSent && (
              <div className="sent-info">
                <p>OTP sent to <strong>{email}</strong></p>
                <p>
                  Expires in:{' '}
                  {expiryTs && Math.max(0, Math.ceil((expiryTs - Date.now()) / 1000)) > 0
                    ? `${Math.floor(Math.max(0, Math.ceil((expiryTs - Date.now()) / 1000)) / 60)}:${String(Math.max(0, Math.ceil((expiryTs - Date.now()) / 1000)) % 60).padStart(2,'0')}`
                    : 'Expired'}
                </p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={4}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              Verify OTP
            </button>

            <div style={{ marginTop: 16 }}>
              <button
                onClick={handleResendEmail}
                disabled={loading || resendCooldown > 0}
                className="btn btn-secondary"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {success && !loading && (
          <div className="success-message">
            <h2>✓ Email Verified!</h2>
            <p>Redirecting to login page...</p>
          </div>
        )}

        <p className="help-text">
          Didn't receive the email? Check your spam folder or request a new verification
          link above.
        </p>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
