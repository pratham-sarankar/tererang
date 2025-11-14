# Phone Number Login Integration Guide

## Overview

This guide explains how to set up and use the phone number login feature with OTP authentication for the Tererang e-commerce platform.

## Architecture

The authentication system consists of:

1. **Backend API** (Express + MongoDB)
   - OTP generation and storage
   - User management
   - JWT token generation
   - Authentication middleware

2. **Frontend** (React)
   - Phone number input
   - OTP verification
   - Token storage in localStorage
   - Authenticated API requests

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Step 1: Install MongoDB (if not already installed)

#### For Ubuntu/Debian:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### For macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### For Windows:
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

Alternatively, use **MongoDB Atlas** (cloud-hosted):
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env` with your Atlas connection string

### Step 2: Configure Backend Environment

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file (you can copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/tererang
   JWT_SECRET=your_secure_random_string_here
   PORT=5000
   NODE_ENV=development
   ```

   **Important**: 
   - For production, use a strong random string for `JWT_SECRET`
   - Use MongoDB Atlas or a secure MongoDB instance for production

### Step 3: Install Dependencies

From the root directory:
```bash
npm install
```

### Step 4: Start the Backend Server

Open a terminal and run:
```bash
npm run server
```

Or for development with auto-reload:
```bash
npm run server:dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: localhost
```

### Step 5: Start the Frontend Development Server

Open another terminal and run:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Using the Login Feature

### User Flow

1. **Enter Phone Number**
   - User enters a 10-digit phone number
   - Clicks "Send OTP"
   - Backend generates a 6-digit OTP and stores it in the database

2. **Enter OTP**
   - User receives OTP (in development mode, it's displayed in the response and backend console)
   - User enters the OTP and optionally their name
   - Clicks "Verify & Login"

3. **Authentication**
   - Backend verifies the OTP
   - Creates or updates user record
   - Generates JWT token
   - Frontend stores token in localStorage
   - User is redirected to home page

### Development Mode Features

In development mode (`NODE_ENV=development`):
- OTP is included in the API response for easy testing
- OTP is logged to the backend console
- No actual SMS is sent

### Testing the Integration

1. Open the frontend at `http://localhost:5173/login`

2. Enter a phone number (e.g., `9876543210`)

3. Click "Send OTP"

4. Check the backend console or the success message to see the OTP

5. Enter the OTP in the form

6. (Optional) Enter your name

7. Click "Verify & Login"

8. You should be redirected to the home page

9. Check localStorage in browser DevTools to see the stored token:
   ```javascript
   localStorage.getItem('token')
   localStorage.getItem('user')
   ```

## API Endpoints

### 1. Send OTP
```http
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development
}
```

### 2. Verify OTP
```http
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "otp": "123456",
  "name": "John Doe"  // Optional
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "phoneNumber": "9876543210",
    "name": "John Doe",
    "isVerified": true
  }
}
```

### 3. Get Current User (Protected Route)
```http
GET http://localhost:5000/api/auth/user
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "phoneNumber": "9876543210",
    "name": "John Doe",
    "isVerified": true
  }
}
```

## Frontend Integration

### Making Authenticated Requests

To make authenticated API requests from the frontend:

```javascript
// Get token from localStorage
const token = localStorage.getItem('token');

// Make authenticated request
const response = await fetch('http://localhost:5000/api/auth/user', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

### Checking Authentication Status

```javascript
// Check if user is logged in
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get current user
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
```

## Security Considerations

### Development vs Production

**Development Mode:**
- OTP is visible in API response and console logs
- No actual SMS sending
- Basic validation only

**Production Mode:**
- Must integrate with SMS service (Twilio, AWS SNS, etc.)
- OTP should NOT be in API response
- Implement rate limiting
- Use HTTPS only
- Secure MongoDB instance
- Strong JWT secret
- Environment variables properly secured

### Production Checklist

- [ ] Integrate SMS service for OTP delivery
- [ ] Remove OTP from API response
- [ ] Implement rate limiting for OTP requests
- [ ] Use HTTPS for all API calls
- [ ] Secure MongoDB with authentication
- [ ] Use environment-specific configuration
- [ ] Implement proper error logging
- [ ] Add CORS restrictions
- [ ] Set up monitoring and alerts
- [ ] Add request validation and sanitization
- [ ] Implement session management
- [ ] Add brute-force protection

## Troubleshooting

### Backend doesn't start
- Check if MongoDB is running: `sudo systemctl status mongodb`
- Check if port 5000 is available: `lsof -i :5000`
- Verify `.env` file exists in backend directory

### Frontend can't connect to backend
- Check if backend is running on port 5000
- Check browser console for CORS errors
- Verify API_URL in Login.jsx is correct

### OTP not working
- Check backend console logs for the generated OTP
- Verify phone number format (10 digits)
- Check MongoDB connection
- Verify OTP hasn't expired (10-minute window)

### Authentication issues
- Clear localStorage and try again
- Check JWT token validity
- Verify MongoDB is storing user records

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  phoneNumber: String (unique, required),
  name: String,
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Collection
```javascript
{
  _id: ObjectId,
  phoneNumber: String (required),
  otp: String (required),
  expiresAt: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

Note: OTPs automatically expire and are removed from the database after the `expiresAt` time.

## Next Steps

1. **SMS Integration**: Integrate with Twilio or AWS SNS for production OTP delivery
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **User Profile**: Create user profile page to view/edit information
4. **Protected Routes**: Add authentication middleware to frontend routes
5. **Session Management**: Implement token refresh mechanism
6. **Password Recovery**: Add phone number verification for password reset
7. **Multi-factor Authentication**: Add additional security layers

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `npm run server`
3. Check browser console for frontend errors
4. Verify MongoDB is running and accessible

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [React Documentation](https://react.dev/)
- [Mongoose Documentation](https://mongoosejs.com/)
