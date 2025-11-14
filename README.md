# Tererang E-Commerce Platform

A modern e-commerce platform built with React, Vite, Express, and MongoDB, featuring phone number authentication with OTP.

## 🌟 Features

- **Phone Number Authentication**: Secure login with OTP verification
- **React Frontend**: Fast and responsive UI built with React and Vite
- **Express Backend**: RESTful API with JWT authentication
- **MongoDB Database**: Scalable NoSQL database for user and product data
- **Modern UI**: Styled with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tererang
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up backend environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   cd ..
   ```

4. **Start MongoDB**
   ```bash
   # For Ubuntu/Debian
   sudo systemctl start mongodb
   
   # For macOS
   brew services start mongodb-community
   ```

5. **Start the backend server**
   ```bash
   npm run server
   ```

6. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📖 Documentation

- **[Integration Guide](INTEGRATION_GUIDE.md)**: Complete setup and usage instructions
- **[Backend README](backend/README.md)**: Backend API documentation

## 🏗️ Project Structure

```
tererang/
├── backend/                 # Backend API server
│   ├── config/             # Configuration files
│   │   └── db.js          # MongoDB connection
│   ├── middleware/         # Express middleware
│   │   └── authMiddleware.js
│   ├── models/            # Database models
│   │   ├── User.js
│   │   └── OTP.js
│   ├── routes/            # API routes
│   │   └── authRoutes.js
│   ├── utils/             # Utility functions
│   │   ├── generateOTP.js
│   │   └── generateToken.js
│   ├── server.js          # Express server entry point
│   ├── .env.example       # Environment variables template
│   └── README.md          # Backend documentation
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/             # Page components
│   │   └── Login.jsx      # Login page with phone number authentication
│   ├── css/               # Stylesheets
│   ├── App.jsx            # Main App component
│   └── main.jsx           # Entry point
├── public/                 # Static assets
├── package.json           # Project dependencies and scripts
├── vite.config.js        # Vite configuration
├── INTEGRATION_GUIDE.md  # Complete integration guide
└── README.md             # This file
```

## 🔐 Authentication Flow

1. User enters phone number
2. Backend generates and stores 6-digit OTP
3. OTP is sent to user (displayed in dev mode)
4. User enters OTP and optional name
5. Backend verifies OTP
6. JWT token is generated and returned
7. Frontend stores token in localStorage
8. User is authenticated for subsequent requests

## 🛠️ Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run server` - Start backend server
- `npm run server:dev` - Start backend with auto-reload

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/user` - Get current user (protected)

### Health Check

- `GET /api/health` - Server health status

For detailed API documentation, see [Backend README](backend/README.md).

## 🔧 Environment Variables

Create a `backend/.env` file with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/tererang
JWT_SECRET=your_secure_random_string
PORT=5000
NODE_ENV=development
```

## 🧪 Testing

### Backend Structure Test
```bash
./backend/test-backend-structure.sh
```

### Manual API Testing
```bash
# Start the backend server first
npm run server

# In another terminal
node backend/test-api.js
```

## 🌐 Production Deployment

Before deploying to production:

1. **Update environment variables**
   - Use strong JWT secret
   - Use MongoDB Atlas or secure MongoDB instance
   - Set `NODE_ENV=production`

2. **Integrate SMS service**
   - Add Twilio, AWS SNS, or similar for OTP delivery
   - Remove OTP from API response

3. **Enable security features**
   - Add rate limiting
   - Enable HTTPS
   - Implement CORS restrictions
   - Add input validation and sanitization

4. **Build frontend**
   ```bash
   npm run build
   ```

5. **Deploy**
   - Backend: Deploy to services like Heroku, Railway, or AWS
   - Frontend: Deploy to Vercel, Netlify, or similar

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React + Vite template
- Express.js
- MongoDB
- Tailwind CSS

## 📞 Support

For issues and questions, please check:
- [Integration Guide](INTEGRATION_GUIDE.md)
- [Backend README](backend/README.md)
- GitHub Issues

---

Built with ❤️ using React, Express, and MongoDB
