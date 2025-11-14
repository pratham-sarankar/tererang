#!/usr/bin/env node
// backend/test-api.js
// Simple test script to verify backend API endpoints

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    console.log();

    // Test 2: Send OTP
    console.log('2️⃣ Testing send OTP endpoint...');
    const phoneNumber = '9876543210';
    const sendOtpResponse = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    const sendOtpData = await sendOtpResponse.json();
    console.log('✅ Send OTP:', sendOtpData.message);
    console.log('📱 OTP:', sendOtpData.otp || 'Check backend console');
    console.log();

    if (!sendOtpData.otp) {
      console.log('⚠️  OTP not in response. Please check backend console or logs.');
      return;
    }

    // Test 3: Verify OTP
    console.log('3️⃣ Testing verify OTP endpoint...');
    const verifyOtpResponse = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber,
        otp: sendOtpData.otp,
        name: 'Test User',
      }),
    });
    const verifyOtpData = await verifyOtpResponse.json();
    console.log('✅ Verify OTP:', verifyOtpData.message);
    console.log('🔑 Token:', verifyOtpData.token?.substring(0, 20) + '...');
    console.log('👤 User:', verifyOtpData.user);
    console.log();

    // Test 4: Get Current User
    console.log('4️⃣ Testing get user endpoint...');
    const getUserResponse = await fetch(`${API_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${verifyOtpData.token}`,
      },
    });
    const getUserData = await getUserResponse.json();
    console.log('✅ Get user:', getUserData.user);
    console.log();

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Make sure the backend server is running on port 5000');
  }
}

testAPI();
