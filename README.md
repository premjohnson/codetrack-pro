# 🚀 CodeTrack Pro

> A production-grade MERN-based Student Management & Coding Platform designed to streamline coding education through task management, analytics, authentication, real-time notifications, and role-based access control.

<p align="center">

![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![Express](https://img.shields.io/badge/Express.js-Backend-black)
![React](https://img.shields.io/badge/React-Frontend-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-success)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![Socket.IO](https://img.shields.io/badge/Socket.IO-RealTime-lightgrey)
![License](https://img.shields.io/badge/License-MIT-success)

</p>

---

# ✨ Features

### 👨‍🎓 Student Features

- Secure Authentication
- Student Dashboard
- Coding Playground
- Daily Coding Tasks
- Progress Tracking
- Streak System
- Submission History
- Real-Time Notifications
- Profile Management

---

### 👨‍🏫 Admin Features

- Student Management
- Task Management
- Analytics Dashboard
- Performance Monitoring
- Role-Based Access Control (RBAC)
- Announcement Management
- User Activity Tracking

---

### ⚙️ Backend Features

- JWT Authentication
- Refresh Token Rotation
- Secure Password Hashing
- Redis Caching
- Socket.IO Real-Time Events
- RESTful APIs
- Request Validation
- Error Handling Middleware
- Logging
- Modular Architecture

---

# 🏗️ Tech Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Cache | Redis |
| Authentication | JWT, Refresh Tokens |
| Real-Time | Socket.IO |
| Validation | Zod |
| Logging | Winston |
| Version Control | Git & GitHub |

---

# 🏛️ System Architecture

```mermaid
flowchart TD

Student["👨‍🎓 Student"]

Admin["👨‍🏫 Admin"]

Frontend["⚛️ React Frontend"]

Backend["🌐 Express Backend"]

Auth["🔐 Authentication"]

Task["📝 Task Service"]

Analytics["📊 Analytics"]

Notification["🔔 Socket.IO"]

Redis["⚡ Redis"]

Mongo["🍃 MongoDB"]

Student --> Frontend

Admin --> Frontend

Frontend --> Backend

Backend --> Auth

Backend --> Task

Backend --> Analytics

Backend --> Notification

Backend --> Redis

Backend --> Mongo
```

---

# 🔐 Authentication Flow

```mermaid
sequenceDiagram

actor User

participant Client

participant Backend

participant JWT

participant MongoDB

User->>Client: Login

Client->>Backend: Credentials

Backend->>MongoDB: Verify User

MongoDB-->>Backend: User

Backend->>JWT: Generate Access & Refresh Tokens

JWT-->>Backend: Tokens

Backend-->>Client: Login Success
```

---

# 📚 Coding Task Flow

```mermaid
sequenceDiagram

actor Student

participant Frontend

participant Backend

participant Database

Student->>Frontend: Solve Task

Frontend->>Backend: Submit Solution

Backend->>Database: Save Submission

Database-->>Backend: Success

Backend-->>Frontend: Updated Progress

Frontend-->>Student: Result
```

---

# 📊 Analytics Flow

```mermaid
flowchart LR

Student

Tasks

Submissions

Backend

Analytics

Dashboard

Student --> Tasks

Tasks --> Submissions

Submissions --> Backend

Backend --> Analytics

Analytics --> Dashboard
```

---

# 📂 Project Structure

```text
CodeTrack-Pro
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── sockets
│   │   ├── utils
│   │   └── app.js
│   │
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── store
│   │   ├── services
│   │   └── App.tsx
│   │
│   └── package.json
│
└── README.md
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/premjohnson/codetrack-pro.git
```

Install Backend

```bash
cd backend

npm install
```

Install Frontend

```bash
cd frontend

npm install
```

---

# ⚙️ Environment Variables

```env
PORT=5000

MONGODB_URI=your_database_url

JWT_SECRET=your_secret

REDIS_URL=your_redis_url
```

---

# ▶️ Run the Project

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

---

# 📡 Core APIs

## Authentication

```http
POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout
```

---

## Students

```http
GET /api/students

POST /api/students

PUT /api/students/:id

DELETE /api/students/:id
```

---

## Tasks

```http
GET /api/tasks

POST /api/tasks

PUT /api/tasks/:id

DELETE /api/tasks/:id
```

---

## Analytics

```http
GET /api/analytics
```

---

# 🔒 Security

- JWT Authentication
- Refresh Token Rotation
- Password Hashing
- Input Validation
- RBAC Authorization
- Redis Session Management
- Secure API Design
- Environment Variable Protection

---

# 🛣️ Roadmap

- [ ] AI Code Review
- [ ] Contest Module
- [ ] Leaderboard
- [ ] Multi-language Code Execution
- [ ] Email Notifications
- [ ] Docker Deployment
- [ ] Kubernetes Support
- [ ] CI/CD Pipeline
- [ ] API Documentation (Swagger)

---

# 🤝 Contributing

Contributions are welcome!

Please read **CONTRIBUTING.md** before submitting a Pull Request.

---

# 📜 Code of Conduct

Please read **CODE_OF_CONDUCT.md**.

---

# 🔒 Security Policy

Please read **SECURITY.md**.

---

# 📄 License

Licensed under the MIT License.

---

# 👨‍💻 Author

**Prem Johnson**

GitHub: https://github.com/premjohnson

---

<p align="center">

⭐ If you like this project, please give it a star!

</p>
