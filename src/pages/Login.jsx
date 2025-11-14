import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { ArrowLeft, ArrowRight, Phone, Smartphone, Shield, Truck, Gift, Star, Clock, CheckCircle, Users, Heart, Percent, Award, Tag } from "lucide-react";

const Login = () => {
  const [step, setStep] = useState(1); // 1: phone number, 2: OTP
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef([]);
  const timerIntervalRef = useRef(null);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    
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
    // Clear any existing interval first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    setCanResend(false);
    setTimer(30);
    timerIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
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
    // Clear the timer interval if it's running
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setTimer(30);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Tererang
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 font-medium">
            {step === 1 ? "Your Fashion Destination - Login or Sign up" : "Secure Verification"}
          </CardDescription>
          
          
        </CardHeader>

        <CardContent className="space-y-8">
          {step === 1 ? (
            <div className="space-y-8">
              {/* Login Form Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Secure Login
                </h3>
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Mobile Number
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">🇮🇳 +91</span>
                        <div className="w-px h-4 bg-gray-300"></div>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter your 10-digit mobile number"
                        className="pl-20 h-12 text-base border-2 focus:border-blue-500"
                        maxLength="10"
                        required
                      />
                    </div>
                    <div className="flex items-start space-x-2 mt-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        Your number is safe with us. We use it only for authentication and order updates.
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    disabled={phoneNumber.length !== 10 || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending OTP...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Get OTP & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>OTP will arrive within 30 seconds</span>
                  </div>
                </form>
              </div>

              {/* Featured Welcome Offer */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-xl shadow-xl relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-yellow-400 text-pink-800 px-3 py-1 rounded-full text-xs font-bold transform rotate-12">
                  NEW USER
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold flex items-center">
                    <Gift className="w-6 h-6 mr-2" />
                    Welcome Offer
                  </h3>
                  <div className="text-3xl font-extrabold">Flat 10% OFF</div>
                  <p className="text-pink-100">Start your journey with Tererang. Exclusive discount on your first purchase!</p>
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg inline-block">
                    <span className="text-xs font-medium">Use Code: </span>
                    <span className="font-bold tracking-wider">WELCOME10</span>
                  </div>
                </div>
              </div>

              {/* Current Offers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-pink-600" />
                  Exclusive Offers Waiting for You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500">
                    <Truck className="w-6 h-6 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-800">Free Shipping</h4>
                      <p className="text-sm text-gray-600 mb-2">Complimentary delivery on all orders</p>
                      <p className="text-xs text-green-700 font-medium">Minimum cart value ₹4,999</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
                    <Gift className="w-6 h-6 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-800">Bundle & Save 15%</h4>
                      <p className="text-sm text-gray-600 mb-2">Mix & match any 2 items</p>
                      <div className="bg-purple-100 px-2 py-1 rounded text-xs font-bold text-purple-800">
                        Code: TERABUNDLE
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500">
                    <Star className="w-6 h-6 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-800">Loyalty Reward</h4>
                      <p className="text-sm text-gray-600 mb-2">₹500 voucher on 5th purchase</p>
                      <p className="text-xs text-yellow-700 font-medium">Automatic credit after delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-500">
                    <Users className="w-6 h-6 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-800">Refer & Earn</h4>
                      <p className="text-sm text-gray-600 mb-2">Friend gets 10% off, you get ₹250</p>
                      <p className="text-xs text-blue-700 font-medium">Credit after friend's first order</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Birthday Special Highlight */}
              <div className="bg-gradient-to-r from-pink-50 to-red-50 border border-pink-200 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                    🎂
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">Birthday Special - 20% OFF</h4>
                    <p className="text-sm text-gray-600">Valid one month before/after your birthday</p>
                    <div className="mt-2 bg-pink-100 px-3 py-1 rounded-full inline-block">
                      <span className="text-xs font-bold text-pink-800">Code: HBD20</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators with Offers */}
              <div className="text-center space-y-4 border-t pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center space-y-1">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">1M+</span>
                    <span className="text-xs text-gray-500">Happy Customers</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">4.8★</span>
                    <span className="text-xs text-gray-500">Rating</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <Percent className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Up to 20%</span>
                    <span className="text-xs text-gray-500">Discounts</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Premium</span>
                    <span className="text-xs text-gray-500">Quality</span>
                  </div>
                </div>
                
                {/* Quick Offer Highlights */}
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm font-semibold text-gray-800 mb-1">🎉 Active Offers</p>
                  <div className="flex justify-center items-center space-x-4 text-xs text-gray-600">
                    <span>• 10% Welcome Discount</span>
                    <span>• Free Shipping ₹4,999+</span>
                    <span>• 15% Bundle Savings</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* OTP Verification Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={goBack}
                    className="h-10 w-10 hover:bg-gray-200"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-gray-800 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-600" />
                      Secure Verification
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      OTP sent to +91 {phoneNumber} • <button onClick={goBack} className="text-blue-600 hover:text-blue-700 underline">Change number</button>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Enter 6-digit verification code
                    </Label>
                    <div className="flex justify-center space-x-3">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-14 h-14 text-center text-xl font-bold border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          maxLength="1"
                          inputMode="numeric"
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      {canResend ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Didn't receive the code?</span>
                          <Button
                            type="button"
                            variant="link"
                            onClick={resendOtp}
                            disabled={isLoading}
                            className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                          >
                            Resend OTP
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500">Resend available in {timer}s</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    disabled={otp.join("").length !== 6 || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying your identity...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Verify & Access Your Account</span>
                      </div>
                    )}
                  </Button>
                </form>
              </div>

              {/* Security Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Your Security Matters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">OTP Verification</h4>
                      <p className="text-sm text-gray-600">This extra step ensures only you can access your account</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Data Protection</h4>
                      <p className="text-sm text-gray-600">Your personal information is encrypted and securely stored</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next Section - Enhanced with More Offers */}
              <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-xl p-6 border-2 border-pink-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-purple-600" />
                  Your Exclusive Rewards Await...
                </h3>
                
                {/* Featured Welcome Offer */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">Welcome Bonus</h4>
                      <p className="text-pink-100 text-sm">Flat 10% OFF your first order</p>
                      <div className="bg-white/20 px-2 py-1 rounded mt-2 inline-block">
                        <span className="text-xs font-bold">WELCOME10</span>
                      </div>
                    </div>
                    <Gift className="w-12 h-12 opacity-80" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg shadow-sm border">
                    <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-800">Free Shipping</p>
                    <p className="text-xs text-gray-500">₹4,999+</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border">
                    <Gift className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-800">Bundle Save</p>
                    <p className="text-xs text-gray-500">15% OFF</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border">
                    <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-800">Loyalty Bonus</p>
                    <p className="text-xs text-gray-500">₹500 Credit</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-800">Refer Friend</p>
                    <p className="text-xs text-gray-500">₹250 Each</p>
                  </div>
                </div>

                {/* Special Birthday Offer */}
                <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎂</span>
                    <div>
                      <p className="font-bold text-sm">Birthday Special: 20% OFF</p>
                      <p className="text-xs">Available during your birthday month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Footer */}
              <div className="text-center space-y-2 border-t pt-4">
                <p className="text-xs text-gray-500">
                  🔒 This is a secure connection. Your data is protected by 256-bit SSL encryption.
                </p>
                <p className="text-xs text-gray-400">
                  Having trouble? Contact our 24/7 support team
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
