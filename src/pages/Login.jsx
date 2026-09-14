import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, ShieldCheck } from "lucide-react";
import { usePhoneAuth } from "../hooks/usePhoneAuth.js";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { recaptchaContainerRef, sendOtp, confirmOtp, loading } = usePhoneAuth();

  const handleSendOTP = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await sendOtp(phoneNumber);
      setOtpSent(true);
      setMessage("OTP sent successfully");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
      console.error("Error sending OTP:", err);
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await confirmOtp(otp, name);
      setMessage("Login successful");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
      console.error("Error verifying OTP:", err);
    }
  };

  const handleReset = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setMessage("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground">
      <form className="w-full max-w-md border border-border bg-card p-8 shadow-[0_24px_70px_rgba(45,41,36,0.08)]" onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.08em] text-accent">Customer atelier</p>
          <h1 className="mt-3 font-serif text-5xl lowercase leading-none">login to tererang</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">Access orders, cart, and checkout with phone OTP.</p>
        </div>

        {error ? <div className="mb-5 border border-red-200 bg-red-50 p-3 text-sm text-destructive">{error}</div> : null}
        {message ? <div className="mb-5 border border-border bg-secondary p-3 text-sm text-primary">{message}</div> : null}

        {!otpSent ? (
          <>
            <label className="mb-2 block text-sm font-semibold">Phone number</label>
            <div className="relative mb-6">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Enter 10-digit phone number"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
                disabled={loading}
                className="w-full border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <button type="submit" className="w-full bg-primary px-6 py-4 text-sm font-semibold lowercase tracking-[0.18em] text-white transition hover:bg-primary/90 disabled:opacity-60" disabled={loading}>
              {loading ? "sending otp..." : "send otp"}
            </button>
          </>
        ) : (
          <>
            <label className="mb-2 block text-sm font-semibold">Phone number</label>
            <input type="tel" value={phoneNumber} disabled className="mb-5 w-full border border-border bg-secondary p-3 text-sm text-muted-foreground" />

            <label className="mb-2 block text-sm font-semibold">Name optional</label>
            <input type="text" name="name" placeholder="Enter your name" value={name} onChange={(event) => setName(event.target.value)} disabled={loading} className="mb-5 w-full border border-border bg-background p-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" />

            <label className="mb-2 block text-sm font-semibold">OTP</label>
            <div className="relative mb-6">
              <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(event) => setOtp(event.target.value)} required pattern="[0-9]{6}" title="Please enter the 6-digit OTP" disabled={loading} maxLength="6" className="w-full border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>

            <button type="submit" className="w-full bg-primary px-6 py-4 text-sm font-semibold lowercase tracking-[0.18em] text-white transition hover:bg-primary/90 disabled:opacity-60" disabled={loading}>
              {loading ? "verifying..." : "verify & login"}
            </button>

            <button type="button" onClick={handleReset} className="mt-3 w-full border border-border px-6 py-3 text-sm font-semibold lowercase tracking-[0.18em] text-foreground transition hover:border-primary hover:text-primary" disabled={loading}>
              change phone number
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Register</Link>
        </p>
      </form>
      <div ref={recaptchaContainerRef} />
    </main>
  );
};

export default Login;
