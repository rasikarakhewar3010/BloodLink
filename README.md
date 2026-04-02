# 🩸 Blood Link — Blood Donation Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-blueviolet)](https://render.com/)

## ✨ Connect, Verify, Save Lives.

A secure, role-based web application designed to streamline blood donation management — connecting verified donors with doctors in urgent need through a city-scoped, multi-tier access control system.

**[🌐 Live Demo](https://bloodlink-qmva.onrender.com)**

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [System Workflow](#-system-workflow)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌟 Key Features

### Donor Management
- **Secure Registration** with unique contact number validation and comprehensive server-side input sanitization
- **12-Point Pre-Screening Health Declaration** — age, weight, hemoglobin, medical history, and lifestyle compliance checks
- **First-Time Donor Support** — conditional logic adapts the form and eligibility calculation for new donors
- **Auto-Eligibility Calculation** — `validUntil` date computed automatically (lastDonation + 60 days)

### Doctor Dashboard
- **City-Scoped Access** — doctors only see and manage donors from their assigned city (enforced at both query and action level)
- **Multi-Criteria Filtering** — filter by blood group, verification status, availability status, and city sub-locality
- **Donor Verification Workflow** — toggle verification after in-person health checks
- **Status Management System** — 5-state availability lifecycle: `available → contacted → donated_elsewhere → temporarily_unavailable → permanently_unavailable`
- **Contact Outcome Tracking** — log notes after each donor interaction with timestamps

### Administration
- **Admin-Controlled Doctor Provisioning** — doctors cannot self-register; admin creates and assigns to cities
- **Secure Admin Authentication** — password-protected admin panel with session management
- **City Assignment System** — each doctor is bound to a specific operational city

### Security
- **Passport.js Authentication** with bcrypt-10 password hashing
- **Session Security** — configurable cookie settings with httpOnly, SameSite, and Secure flags
- **RBAC Enforcement** — route-level middleware + controller-level authorization checks
- **Input Validation** — dual-layer (HTML5 client-side + comprehensive server-side) with regex patterns, length constraints, and type checking

---

## 🏛️ Architecture

```
┌─────────────┐     ┌──────────────────────────────────────────────┐
│   Browser   │────▶│               Express.js Server              │
│  (EJS Views)│◀────│                                              │
└─────────────┘     │  ┌─────────┐  ┌────────────┐  ┌──────────┐  │
                    │  │ Routes  │──│ Controllers │──│ Models   │  │
                    │  └─────────┘  └────────────┘  └──────────┘  │
                    │       │            │               │         │
                    │  ┌─────────┐  ┌────────────┐       │         │
                    │  │Middleware│  │  Passport  │       │         │
                    │  │(Auth/   │  │  (Local    │       │         │
                    │  │ Admin)  │  │  Strategy) │       │         │
                    │  └─────────┘  └────────────┘       │         │
                    └────────────────────────────────────┼─────────┘
                                                         │
                                                    ┌────▼─────┐
                                                    │ MongoDB  │
                                                    │  Atlas   │
                                                    └──────────┘
```

**Data Flow:**
1. **Donors** register via public form → data saved to MongoDB → status: `unverified`
2. **Doctors** log in via Passport.js → view city-scoped dashboard → verify donors after health checks → update availability status
3. **Admins** log in with secure password → create doctor accounts → assign to cities

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js v18+ | Server-side JavaScript execution |
| **Framework** | Express.js v5 | HTTP server, routing, middleware |
| **Database** | MongoDB Atlas (Mongoose v8) | Document database with ODM |
| **Templating** | EJS | Server-side view rendering |
| **UI Framework** | Bootstrap 5.3 | Responsive CSS framework |
| **Icons** | Bootstrap Icons | UI iconography |
| **Authentication** | Passport.js (Local Strategy) | Session-based authentication |
| **Password Hashing** | bcryptjs (10 salt rounds) | Secure password storage |
| **Session Management** | express-session | Server-side session handling |
| **Flash Messages** | connect-flash | User feedback notifications |
| **Validation** | express-validator + Custom | Input sanitization and validation |
| **Environment Config** | dotenv | Environment variable management |
| **Dev Tools** | nodemon | Hot-reload during development |

---

## 🔄 System Workflow

### Donor Lifecycle
```
Register (Public Form)
    │
    ▼
Unverified + Available ─── Doctor Reviews ──▶ Verified ✓
    │                                            │
    │                                            ▼
    │                                    Doctor Contacts
    │                                            │
    ▼                                            ▼
  Expires                              Status Updated:
(validUntil)                    contacted | donated_elsewhere |
                          temporarily_unavailable | permanently_unavailable
```

### Role Permissions Matrix

| Action | Donor (Public) | Doctor | Admin |
|--------|:-:|:-:|:-:|
| Register as Donor | ✅ | — | — |
| View Doctor Dashboard | — | ✅ (own city only) | — |
| Verify/Unverify Donors | — | ✅ (own city only) | — |
| Update Donor Status | — | ✅ (own city only) | — |
| Create Doctor Accounts | — | — | ✅ |
| Assign Doctors to Cities | — | — | ✅ |

---

## 📁 Project Structure

```
BloodLink/
├── app.js                              # Application entry point
├── config/
│   ├── db.js                           # MongoDB connection handler
│   └── passport.js                     # Passport Local Strategy config
├── controllers/
│   ├── adminController.js              # Admin login + doctor CRUD
│   ├── doctorController.js             # Dashboard + donor management
│   └── donorController.js              # Registration + validation engine
├── middleware/
│   ├── auth.js                         # Doctor auth guard
│   └── adminAuth.js                    # Admin auth guard
├── models/
│   ├── Doctor.js                       # Doctor schema (username, password, city)
│   └── Donor.js                        # Donor schema (25+ fields with validators)
├── routes/
│   ├── index.js                        # Public routes (/, /donate)
│   ├── doctor.js                       # Doctor routes (/doctor/*)
│   └── admin.js                        # Admin routes (/admin/*)
├── views/
│   ├── index.ejs                       # Landing page
│   ├── donate.ejs                      # Donor registration form
│   ├── 404.ejs                         # Error page
│   ├── admin/
│   │   ├── login.ejs                   # Admin login
│   │   └── create_doctor.ejs           # Doctor creation form
│   ├── doctor/
│   │   ├── login.ejs                   # Doctor login
│   │   └── dashboard.ejs              # Filterable donor management dashboard
│   └── partials/
│       ├── _header.ejs                 # Navbar + HTML head
│       ├── _footer.ejs                 # Footer + scripts
│       └── _messages.ejs              # Flash message display
├── public/img/                         # Static assets
├── .env.example                        # Environment variable template
├── .gitignore                          # Git ignore rules
├── package.json                        # Dependencies and scripts
└── README.md                           # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or later
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rasikarakhewar3010/BloodLink.git
cd BloodLink

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and secrets (see below)

# 4. Start development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### First-Time Setup
1. Navigate to `http://localhost:3000/admin/login`
2. Enter the admin password (configured in your `.env` file)
3. Create your first doctor account and assign a city
4. The doctor can now log in at `http://localhost:3000/doctor/login`

---

## 🔐 Environment Variables

Create a `.env` file in the project root (see `.env.example`):

| Variable | Required | Description |
|----------|:--------:|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `SESSION_SECRET` | ✅ | Random string for signing session cookies (min 32 chars) |
| `ADMIN_PASSWORD` | ✅ | Secure password for admin panel access |
| `PORT` | ❌ | Server port (default: 3000) |
| `NODE_ENV` | ❌ | `development` or `production` |

> ⚠️ **Security:** Never commit `.env` to version control. Use strong, unique values for all secrets.

---

## 🛡️ Security Features

- **Password Hashing** — bcrypt with 10 salt rounds (Mongoose pre-save hook)
- **Session Security** — configurable httpOnly, SameSite, and Secure cookie flags
- **Authentication Guards** — route-level middleware prevents unauthorized access
- **City-Scoped Authorization** — doctors can only access/modify donors in their assigned city (enforced at query AND action level)
- **Input Sanitization** — comprehensive server-side validation with regex, length bounds, type checks, and enum validation
- **Unique Constraints** — duplicate contact numbers rejected at both validation and database layers
- **Admin Isolation** — separate admin authentication flow with session-based access control

---

## ☁️ Deployment (Render)

1. Push code to GitHub (ensure `.env` is in `.gitignore`)
2. Create a **Web Service** on [Render.com](https://render.com)
3. Connect your GitHub repository
4. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables in Render's dashboard:
   - `MONGO_URI`
   - `SESSION_SECRET`
   - `ADMIN_PASSWORD`
   - `NODE_ENV=production`
6. Deploy and access via the Render URL

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>🩸 Blood Link</strong> — Connecting life-saving donors with those in need.<br>
  Built with ❤️ by <a href="https://github.com/rasikarakhewar3010">Rasika Rakhewar</a>
</p>
