# Firebase Phone Authentication - Testing Guide

## Setup Instructions

### 1. Firebase Configuration
Before testing, you need to set up your Firebase credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tererang-f1083`
3. Go to Project Settings > General > Your apps
4. If you haven't created a Web app, click "Add app" and select Web
5. Copy the Firebase configuration values

### 2. Environment Setup
Create a `.env` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env
```

Then fill in your Firebase credentials in the `.env` file.

### 3. Enable Phone Authentication in Firebase

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable "Phone" authentication provider
3. Add your domain to authorized domains (for testing, `localhost` should already be there)

### 4. Testing with Firebase Test Phone Numbers (Recommended for Development)

For testing without using real phone numbers:

1. Go to Firebase Console > Authentication > Settings > Phone numbers for testing
2. Add test phone numbers with test verification codes, for example:
   - Phone: `+919999999999`
   - Code: `123456`

## Running the Application

```bash
npm install
npm run dev
```

Navigate to `http://localhost:5173/login`

## Testing Checklist

### Happy Path
- [ ] Enter a valid 10-digit phone number
- [ ] Click "Get OTP & Continue"
- [ ] Verify that OTP screen appears
- [ ] Enter the 6-digit OTP received
- [ ] Click "Verify & Access Your Account"
- [ ] Verify successful login and redirect to home page

### Edge Cases

#### Phone Number Validation
- [ ] Try submitting with less than 10 digits - button should be disabled
- [ ] Try submitting with more than 10 digits - input should prevent it
- [ ] Try entering non-numeric characters - should be filtered out

#### OTP Validation
- [ ] Try submitting incomplete OTP (less than 6 digits) - button should be disabled
- [ ] Enter incorrect OTP - should show error message
- [ ] Wait for OTP to expire - should show appropriate error

#### Network Errors
- [ ] Disconnect network and try to send OTP - should show connection error
- [ ] Reconnect and try again - should work

#### Rate Limiting
- [ ] Try sending OTP multiple times quickly - should show rate limit error

#### Resend OTP
- [ ] Wait for timer to expire (30 seconds)
- [ ] Click "Resend OTP"
- [ ] Verify new OTP is sent and timer restarts

#### Navigation
- [ ] Click back arrow on OTP screen - should return to phone number entry
- [ ] Click "Change number" link - should return to phone number entry
- [ ] Verify all state is cleared when going back

#### Session Management
- [ ] Enter phone number and receive OTP
- [ ] Refresh the page
- [ ] Try to verify OTP - should handle session properly

## Expected Behavior

### Success Flow
1. Enter phone number → Shows loading state → Navigates to OTP screen
2. Enter OTP → Shows loading state → Redirects to home page

### Error Handling
- Invalid phone number: Red error banner with clear message
- Too many requests: Red error banner suggesting to try later
- Invalid OTP: Red error banner with option to try again
- Expired OTP: Red error banner with option to resend
- Network error: Red error banner with retry instructions

### UI/UX
- Loading states: Spinner with descriptive text
- Disabled states: Buttons disabled when input is incomplete
- Auto-focus: OTP inputs auto-focus for smooth entry
- Timer: Countdown timer for resend OTP
- Error clearing: Errors clear when user starts typing

## Security Considerations

✅ Phone numbers are formatted correctly with country code (+91)
✅ OTP is verified server-side via Firebase
✅ reCAPTCHA prevents automated abuse
✅ Session expiration is handled
✅ Rate limiting is enforced by Firebase
✅ Sensitive data is not logged

## Troubleshooting

### reCAPTCHA Issues
- Ensure the domain is authorized in Firebase Console
- Check browser console for reCAPTCHA errors
- Try refreshing the page

### SMS Not Received
- Check that Phone authentication is enabled in Firebase
- Verify the phone number format is correct
- Check Firebase Console > Authentication > Users for verification

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check that Firebase credentials are correctly set in `.env`

## Notes

- The application uses invisible reCAPTCHA for security
- Phone numbers are stored with +91 country code for India
- Authentication state is managed by Firebase
- On successful login, user is redirected to home page
