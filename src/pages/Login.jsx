import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { ArrowLeft, ArrowRight, Phone, Smartphone } from "lucide-react";

const Login = () => {
  const [step, setStep] = useState(1); // 1: phone number, 2: OTP
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef([]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.length === 10) {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Sending OTP to:", phoneNumber);
      setStep(2);
      startTimer();
      setIsLoading(false);
      alert(`OTP sent to +91 ${phoneNumber} ✅ (Demo only)`);
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Verifying OTP:", otpValue);
      setIsLoading(false);
      alert("Login Successful ✅ (Demo only)");
    }
  };

  const startTimer = () => {
    setCanResend(false);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    if (canResend) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Resending OTP to:", phoneNumber);
      alert("OTP resent ✅ (Demo only)");
      setOtp(["", "", "", "", "", ""]);
      startTimer();
      setIsLoading(false);
      otpRefs.current[0]?.focus();
    }
  };

  const goBack = () => {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setTimer(30);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tererang
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {step === 1 ? "Login / Signup" : "Verify OTP"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Mobile Number
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">+91</span>
                    <div className="w-px h-4 bg-gray-300"></div>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Enter your mobile number"
                    className="pl-20 h-12 text-base"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                disabled={phoneNumber.length !== 10 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                We'll send you a verification code via SMS
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={goBack}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h3 className="font-semibold text-lg">Verify OTP</h3>
                  <p className="text-sm text-gray-500">
                    Code sent to +91 {phoneNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Enter 6-digit OTP</Label>
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-blue-500"
                      maxLength="1"
                      inputMode="numeric"
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                disabled={otp.join("").length !== 6 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              <div className="text-center">
                {canResend ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={resendOtp}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Resend OTP
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Resend OTP in {timer}s
                  </p>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
