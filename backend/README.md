# Tererang Backend API

## Overview

Backend API for Tererang e-commerce platform with phone number authentication powered by Twilio Verify.

## Features

- Phone number authentication with OTP (delivered via Twilio Verify SMS)
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
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`: Credentials from your Twilio console
- `TWILIO_VERIFY_SERVICE_SID`: The Verify Service ID (starts with `VA...`) for OTP delivery
- `TWILIO_DEFAULT_COUNTRY_CODE`: (Optional) Country code prefix, defaults to `+91`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: SMTP credentials for sending emails (Gmail, etc.)
- `ORDER_NOTIFICATION_EMAIL`: Email address to receive order notifications and contact form submissions
- `COMPANY_SUPPORT_EMAIL`: Support email displayed in emails and contact information

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
  "delivery": {
    "status": "pending",
    "sid": "VEXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }
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
    "email": "john@example.com",
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
    "email": "john@example.com",
    "isVerified": true
  }
}

#### 4. Update Profile (name/email)

```

PATCH /api/auth/user
Authorization: Bearer <token>
Content-Type: application/json

{
"email": "john@example.com"
}

````

**Response:**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "phoneNumber": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true
  }
}
````

```

### Contact Form

#### Send Contact Message

```

POST /api/contact
Content-Type: application/json

{
"name": "John Doe",
"email": "john@example.com",
"message": "I have a question about your products..."
}

````

**Response:**

```json
{
  "success": true,
  "message": "Your message has been sent successfully! We will get back to you soon."
}
```

### Health Check

```

GET /api/health

````

**Response:**

```json
{
  "message": "Server is running"
}
```

### Admin Order Management

- `GET /api/admin/orders` – List every order (filter with `?status=` if needed)
- `GET /api/admin/orders/:id` – Fetch a single order with buyer snapshot
- `PUT /api/admin/orders/:id` – Update status, payment state, references, or notes
- `POST /api/admin/orders/:id/confirm` – Mark confirmed, lock payment as paid, and email the buyer a GST invoice
- `POST /api/admin/orders/:id/cancel` – Cancel with optional message that’s emailed to the buyer (refund guidance references `COMPANY_SUPPORT_EMAIL`)
- `DELETE /api/admin/orders/:id` – Permanently remove an order document

## Database Models

### User

- `phoneNumber`: String (required, unique)
- `name`: String (optional)
- `email`: String (optional, unique when provided)
- `isVerified`: Boolean (default: false)
- `timestamps`: createdAt, updatedAt

### Product

- `name`: String (required)
- `price`: Number (required)
- `image`: String (primary image URL)
- `images`: Array of Strings (filenames for deletion purposes)
- `imageUrls`: Array of Strings (full public URLs for frontend)
- `description`: String
- `category`: String (default: 'kurti')
- `inStock`: Boolean
- `sizeStock`: Array of size/quantity objects
- `timestamps`: createdAt, updatedAt

## File Storage

This application uses Google Cloud Storage for product images:

- **Storage**: All product images are stored in Google Cloud Storage
- **URLs**: Full public URLs are stored in the database
- **Formats**: Supports common image formats (JPG, PNG, WebP, etc.)
- **Size Limit**: 5MB per image file
- **Multiple Images**: Each product can have up to 8 images

### Setup Google Cloud Storage

1. Follow the detailed setup guide in `GOOGLE_CLOUD_STORAGE_SETUP.md`
2. Configure environment variables in your `.env` file
3. Test the connection using: `node test-gcs.js`

## Email Service Configuration

This application uses SMTP to send emails for order notifications and contact form submissions.

### Supported Email Providers

- **Gmail**: Use App Passwords (not your regular password)
- **Outlook/Hotmail**: Enable SMTP in settings
- **Custom SMTP**: Any SMTP server

### Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
3. Update your `.env` file:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ORDER_NOTIFICATION_EMAIL=tererang.official@gmail.com
   ```

### Email Features

- **Order Notifications**: Sends detailed order emails to admin
- **Customer Confirmations**: Sends order confirmation with GST invoice to customers
- **Contact Form**: Forwards contact form submissions to support email
- **Reply-To Support**: Contact form emails include customer's email as reply-to

### Testing Email Service

The email service will log to console if SMTP credentials are missing or invalid. To test:

1. Configure SMTP credentials in `.env`
2. Restart the server
3. Submit the contact form or place a test order
4. Check console logs and email inbox

### Setup Google Cloud Storage

1. Follow the detailed setup guide in `GOOGLE_CLOUD_STORAGE_SETUP.md`
2. Configure environment variables in your `.env` file
3. Test the connection using: `node test-gcs.js`

### Image Migration

If migrating from local file storage, use the migration script:

```bash
node migrate-images.js
```

## Security Notes

1. **OTP Exposure**: OTP values are never included in API responses or stored on the server—Twilio Verify handles generation and validation.

2. **JWT Secret**: Make sure to use a strong, random string for `JWT_SECRET` in production.

3. **Rate Limiting**: Consider adding rate limiting to prevent abuse of OTP sending.

4. **SMS Service**: The project uses Twilio Verify in production to send and validate OTPs.

## Development Notes

- JWT tokens expire after 30 days
- Twilio handles OTP expiration and retry policies via the configured Verify Service

```

```
