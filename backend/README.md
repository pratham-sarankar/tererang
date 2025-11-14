# Tererang Backend API

## Overview
Backend API for Tererang e-commerce platform with phone number authentication using OTP.

## Features
- Phone number authentication with OTP
- JWT-based user sessions
- MongoDB database integration
- Secure OTP generation and verification

## Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Create a `.env` file in the `backend` directory based on `.env.example`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Update the `.env` file with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Server port (default: 5000)

3. Make sure dependencies are installed:
   ```bash
   npm install
   ```

4. Start the backend server:
   ```bash
   npm run server
   ```

   Or with auto-reload for development:
   ```bash
   npm run server:dev
   ```

## API Endpoints

### Authentication

#### 1. Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "1234567890"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"  // Only in development mode
}
```

#### 2. Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "1234567890",
  "otp": "123456",
  "name": "John Doe"  // Optional
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "phoneNumber": "1234567890",
    "name": "John Doe",
    "isVerified": true
  }
}
```

#### 3. Get Current User
```
GET /api/auth/user
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "phoneNumber": "1234567890",
    "name": "John Doe",
    "isVerified": true
  }
}
```

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "message": "Server is running"
}
```

## Database Models

### User
- `phoneNumber`: String (required, unique)
- `name`: String (optional)
- `isVerified`: Boolean (default: false)
- `timestamps`: createdAt, updatedAt

### OTP
- `phoneNumber`: String (required)
- `otp`: String (required)
- `expiresAt`: Date (required, 10 minutes from creation)
- `timestamps`: createdAt, updatedAt

## Security Notes

1. **OTP in Response**: The OTP is included in the send-otp response only in development mode. In production, it should only be sent via SMS.

2. **JWT Secret**: Make sure to use a strong, random string for `JWT_SECRET` in production.

3. **Rate Limiting**: Consider adding rate limiting to prevent abuse of OTP sending.

4. **SMS Service**: In production, integrate with an SMS service provider (Twilio, AWS SNS, etc.) to send OTPs.

## Development Notes

- OTPs expire after 10 minutes
- JWT tokens expire after 30 days
- In development mode, OTPs are logged to the console and included in the API response for testing
