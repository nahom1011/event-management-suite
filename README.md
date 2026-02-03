# 🌟 Event Management Suite

[![Mastering the Event Experience](https://img.shields.io/badge/Status-In%20Development-blueviolet?style=for-the-badge)](https://github.com/nahom1011/event-management-suite)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Fastify-000000?style=for-the-badge&logo=fastify)](https://www.fastify.io/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

A professional-grade, multi-role event management ecosystem designed for reliability and scalability. From attendees booking their next big experience to organizers managing complex schedules, this suite provides a seamless end-to-end flow.

---

## ✨ Features at a Glance

### 👥 Multi-Role Ecosystem
- **Attendees:** Browse events, book tickets, and manage individual orders.
- **Organizers:** Create/edit events, track attendee lists, and manage ticket inventory.
- **Admins:** Oversee platform activity, manage users, and approve events.
- **Super Admins:** Deep-level system configuration and global oversight.

### 🔐 Enterprise-Grade Security
- **Modern Auth:** JWT-based sessions with Access & Refresh tokens.
- **Social Integration:** One-tap Google OAuth login.
- **RBAC:** Fine-grained Role-Based Access Control protecting every route and action.
- **Verification:** Built-in email verification flow for new users.

### 💳 Payments & Ecommerce
- **Stripe Integration:** Secureized payment processing with Stripe Checkout.
- **Tiered Ticketing:** Support for multiple ticket types (Early Bird, Standard, VIP).
- **Auto-Notifications:** Automated transactional emails via SendGrid/Nodemailer.

### 🎨 Stunning User Interface
- **Dynamic Animations:** Fluid transitions powered by Framer Motion.
- **Modern Styling:** Responsive, utility-first design with Tailwind CSS.
- **Rich Feedback:** Intuitive loading states and interactive UI components.

---

## 🛠️ Tech Stack

<div align="center">

| Area | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Axios |
| **Backend** | Node.js, Fastify, TypeScript, Zod (Validation), IORedis |
| **Persistence** | PostgreSQL, Prisma ORM |
| **DevOps** | Docker, Docker Compose |
| **Services** | Stripe (Payments), SendGrid (Email), Google OAuth |

</div>

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** (v18+)
- **Docker** & **Docker Compose**
- **npm** or **pnpm**

### ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nahom1011/event-management-suite.git
   cd event-management-suite
   ```

2. **Spin up Infrastructure** (Database & Caching)
   ```bash
   docker-compose up -d
   ```

3. **Backend Configuration**
   ```bash
   cd backend
   npm install
   cp .env.example .env # Update with your credentials
   npx prisma migrate dev
   npm run dev
   ```

4. **Frontend Configuration**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 📂 Architecture & Directory Structure

```yml
event-management-suite/
├── backend/                # Fastify API Service
│   ├── prisma/             # Database Schemas & Migrations
│   ├── src/
│   │   ├── auth/           # JWT & OAuth Logic
│   │   ├── events/         # Event Management Logic
│   │   ├── payments/       # Stripe Service Integration
│   │   └── server.ts       # Application Entry Point
├── frontend/               # React (Vite) Application
│   ├── src/
│   │   ├── components/     # UI Design System
│   │   ├── pages/          # Layouts & View Logic
│   │   └── store/          # Context & State Management
└── docker-compose.yml      # Infrastructure as Code
```

---

## 📡 API Overview (v1)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register new user | No |
| `GET` | `/api/v1/events` | List all live events | Yes |
| `POST` | `/api/v1/events` | Create a new event | Yes (Organizer+) |
| `POST` | `/api/v1/payments/checkout` | Initiate Stripe Checkout | Yes |

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
Built with ❤️ by [Nahom](https://github.com/nahom1011)
</div>
