// src/pages/Login.jsx
import React, { useState } from "react";
import "../css/Login.css";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:3001/api";

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setMessage(data.message + (data.otp ? ` (OTP: ${data.otp})` : ""));
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.");
      console.error("Error sending OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, otp, name }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setMessage("Login Successful ✅");
        
        // Redirect to home page after 1 second
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        setError(data.message || "Failed to verify OTP");
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.");
      console.error("Error verifying OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setMessage("");
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
        <h2>Login to Tererang</h2>

        {error && (
          <div style={{ 
            padding: "10px", 
            marginBottom: "15px", 
            backgroundColor: "#fee", 
            border: "1px solid #fcc", 
            borderRadius: "6px",
            color: "#c33",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ 
            padding: "10px", 
            marginBottom: "15px", 
            backgroundColor: "#efe", 
            border: "1px solid #cfc", 
            borderRadius: "6px",
            color: "#3c3",
            fontSize: "14px"
          }}>
            {message}
          </div>
        )}

        {!otpSent ? (
          <>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter 10-digit phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              pattern="[0-9]{10}"
              title="Please enter a 10-digit phone number"
              disabled={loading}
            />

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <label>Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />

            <label>Name (Optional)</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />

            <label>OTP</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              pattern="[0-9]{6}"
              title="Please enter the 6-digit OTP"
              disabled={loading}
              maxLength="6"
            />

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <button 
              type="button" 
              onClick={handleReset}
              className="btn-login"
              style={{ marginTop: "10px", backgroundColor: "#ddd", color: "#333" }}
              disabled={loading}
            >
              Change Phone Number
            </button>
          </>
        )}

        <p className="redirect">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
