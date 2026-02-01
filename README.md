# Event Management Suite

A full-stack event management suite built for real-world use, designed to be scalable, secure, and modular. It supports varied user roles including attendees, organizers, admins, and super admins, featuring robust authentication, Role-Based Access Control (RBAC), and a modern event management interface.

## 🚀 Features

- **Multi-Role Support:** Dedicated interfaces for Attendees, Organizers, Admins, and Super Admins.
- **Secure Authentication:** 
  - Email/Password login with JWT (Access & Refresh Tokens).
  - Google OAuth integration.
  - Secure password hashing with bcryptjs.
- **Role-Based Access Control (RBAC):** Protects routes and resources based on user permissions.
- **Event Management:** Create, update, delete, and list events.
- **Email Notifications:** Integrated with SendGrid and Nodemailer for transactional emails.
- **Real-time Data:** (Implied by Redis and potential future websocket use, though currently for caching/sessions).
- **Modern UI:** Built with React, Tailwind CSS, and Framer Motion for a smooth user experience.

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL (with Prisma ORM)
- **Caching:** Redis
- **Authentication:** JWT, Google Auth Library
- **Validation:** Zod

### Frontend
- **Framework:** React (via Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **State/Animations:** Framer Motion

### Infrastructure
- **Docker:** Containerized Database (PostgreSQL) and Cache (Redis).

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Docker](https://www.docker.com/) & Docker Compose
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## 📦 Installation

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/nahom1011/event-management-suite.git
    cd event-management-suite
    ```

2.  **Setup Backend**

    Navigate to the backend directory and install dependencies:

    ```bash
    cd backend
    npm install
    ```

    Create a `.env` file in the `backend` directory based on `.env.example`:

    ```env
    PORT=3000
    DATABASE_URL="postgresql://admin:password@localhost:5433/event_db?schema=public" # Note port 5433 to match docker-compose
    REDIS_URL="redis://localhost:6379"
    GOOGLE_CLIENT_ID="your-client-id"
    GOOGLE_CLIENT_SECRET="your-client-secret"
    JWT_SECRET="your-secret-key"
    JWT_REFRESH_SECRET="your-refresh-secret-key"
    
    # Email Configuration
    EMAIL_HOST="smtp.gmail.com"
    EMAIL_PORT="587"
    EMAIL_USER="your-email@gmail.com"
    EMAIL_PASS="your-gmail-app-password"
    EMAIL_FROM="your-email@gmail.com"
    EMAIL_FROM_NAME="Event Management Suite"
    
    FRONTEND_URL="http://localhost:5173"
    ```

3.  **Setup Frontend**

    Navigate to the frontend directory and install dependencies:

    ```bash
    cd ../frontend
    npm install
    ```

    Create a `.env` file if needed (usually for VITE_ prefixed variables, check usage in code if necessary).

4.  **Start Infrastructure**

    From the root directory, start PostgreSQL and Redis using Docker Compose:

    ```bash
    cd ..
    docker-compose up -d
    ```

5.  **Database Migration**

    Run Prisma migrations to set up the database schema:

    ```bash
    cd backend
    npx prisma migrate dev
    ```

## 🚀 Running the Application

### Backend

To start the backend development server:

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3000` (or the port defined in your `.env`).

### Frontend

To start the frontend development server:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`.

## 📂 Project Structure

```
event-management-suite/
├── backend/                # Backend API (Node.js/Fastify)
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes definition
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript type definitions
│   │   └── server.ts       # Entry point
│   ├── prisma/             # Database schema and migrations
│   └── ...
├── frontend/               # Frontend App (React/Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── router.tsx      # Routing configuration
│   │   └── ...
│   └── ...
├── docker-compose.yml      # Docker services (DB, Redis)
└── README.md
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
