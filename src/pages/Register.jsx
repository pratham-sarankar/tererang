import React, { useState } from "react";
import { usePhoneAuth } from "../hooks/usePhoneAuth.js";

const Register = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { recaptchaContainerRef, sendOtp, confirmOtp, loading } = usePhoneAuth();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await sendOtp(phoneNumber);
      setOtpSent(true);
      setMessage("OTP sent successfully");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await confirmOtp(otp, name);
      setMessage("Registration Successful ✅");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-400 px-4">
      <form
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Create an Account</h2>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 px-4 py-2 rounded-md bg-green-50 border border-green-200 text-green-600 text-sm">
            {message}
          </div>
        )}

        {!otpSent ? (
          <>
            <label className="block mb-2 font-medium">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <label className="block mb-2 font-medium">Phone Number</label>
            <input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              pattern="[0-9]{10}"
              title="Please enter a 10-digit phone number"
              disabled={loading}
              className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <label className="block mb-2 font-medium">OTP</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              pattern="[0-9]{6}"
              maxLength="6"
              disabled={loading}
              className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {loading ? "Verifying..." : "Verify & Register"}
            </button>
          </>
        )}

        <p className="mt-4 text-center text-gray-600">
          Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
        </p>
      </form>
      <div ref={recaptchaContainerRef} />
    </div>
  );
};

export default Register;
