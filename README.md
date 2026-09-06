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
PORT=3001
NODE_ENV=development
```

Create a project-level `.env.local` (or copy `.env.example`) for the frontend:

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_ASSET_BASE_URL=http://localhost:3001
VITE_UPI_ID=tererang@upi
VITE_UPI_PAYEE_NAME=Tere Rang
```

Adjust the values to match your deployment (for example, set `VITE_UPI_ID` to the live UPI handle that should appear on the checkout page).

The local API uses port 3001 because macOS AirPlay can occupy port 5000 and
return `403 Forbidden` responses. Backend settings are loaded from `backend/.env`
whether you start the server from the project root or the backend directory.
If you change the port, update both `PORT` and `VITE_BACKEND_URL` (and
`VITE_ASSET_BASE_URL` if set), then restart the backend and Vite.

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

### Run locally with Docker

With Docker running, configure the frontend `.env` and `backend/.env`, and place
your Firebase service account at `backend/serviceAccountKey.json`. Then run:

```bash
docker compose up --build -d
docker compose ps
node scripts/docker-smoke.mjs
```

Open http://localhost:8081. Nginx forwards `/backend/` requests to the backend
on container port 8080. The backend connects to `MONGODB_URI` from `backend/.env`;
Compose does not override it or start a database container. For deployment, set
this to your reachable MongoDB connection URL, including credentials as required.
For a database running on your Mac with Docker Desktop, use
`mongodb://host.docker.internal:27017/tererang` and ensure MongoDB accepts that
connection. `localhost` inside a container refers to the container itself.
The frontend's public Vite configuration is supplied through a build secret;
backend environment settings and the Firebase key are supplied only at runtime.
After changing frontend `.env` values, run `docker compose build --no-cache frontend`
and `docker compose up -d` (BuildKit secrets do not invalidate cached layers).
Set `DOCKER_WEB_PORT` to override the default host port 8081. Docker build arguments
`VITE_BACKEND_URL` and `VITE_ASSET_BASE_URL` default to `/backend`.

Use `docker compose down` to stop the application containers. The external
database is managed independently. After changing `backend/.env`, run
`docker compose up -d --force-recreate backend` to load the new settings.
If migrating from the previous bundled MongoDB setup, its existing Docker
volume is preserved; data is not automatically migrated to the configured URL.

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
