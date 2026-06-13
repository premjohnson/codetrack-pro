# CodeTrack - Student Management & Coding Platform

An enterprise-ready, security-hardened MERN full-stack application built using Clean Architecture, strict Controller-Service-Repository separation, Redis caching, BullMQ background queues, and real-time Socket.io state synchronization.

---

## Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS (with glassmorphism configuration)
- **Routing**: React Router DOM (v6)
- **State Management & Sockets**: Context API, Axios, Socket.io-client
- **Charts**: Chart.js, react-chartjs-2
- **Editor**: Monaco Editor

### Backend
- **Engine**: Node.js, Express.js
- **Database**: MongoDB Atlas / Mongoose
- **Caching & Sessions**: Redis, express-session (with connect-mongo)
- **Security**: Helmet, rate-limiter, mongo-sanitize, xss-clean, audit logger
- **Background Queues**: BullMQ + Redis (IORedis)
- **Realtime**: Socket.io
- **Mailers & Storage**: Nodemailer (Ethereal fallback), Cloudinary, Multer

---

## Quick Start (Local Docker Compose)

Make sure you have Docker & Docker Compose installed.

1. **Spin up services**:
   ```bash
   docker-compose up --build
   ```
2. **Access the portal**:
   - Web application: [http://localhost](http://localhost)
   - API endpoints: [http://localhost/api/v1](http://localhost/api/v1)
   - Health check: [http://localhost/api/v1/health](http://localhost/api/v1/health)

3. **Seeded Admin Credentials**:
   - **Email**: `admin@codetrack.com`
   - **Password**: `Admin@123456`

---

## Development Setup

If running locally without Docker:

### 1. Backend Setup
1. Change directory to backend:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Change directory to frontend:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Access web dashboard on `http://localhost:5173`.
