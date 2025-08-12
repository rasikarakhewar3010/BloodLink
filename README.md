# 🩸 Blood Link

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-blueviolet)](https://render.com/)

## ✨ Connect, Verify, Save Lives.

A secure and efficient web application designed to streamline blood donation management, connecting donors with doctors in urgent need.

---

## 🚀 Live Demo

Experience the Blood Donation Management System live:
**[Visit the Live Application Here](https://bloodlink-qmva.onrender.com)**

---

## 🌟 Key Features

*   **Donor Registration:** Secure form with **unique contact number validation**.
*   **First-Time Donor Option:** Easy indication for new donors.
*   **Robust Validation:** 360-degree server-side and client-side validation for all donor fields (name, contact, city, dates).
*   **Admin-Controlled Doctor Accounts:** Doctors are securely created and managed by an Administrator.
*   **City-Based Doctor Access:** Doctors only view/manage donors from their **assigned city**.
*   **Donor Verification Workflow:** Doctors verify donors *after* an in-person health check. Only verified donors are fully eligible.
*   **Dynamic Donor Status:** Doctors update donor availability (e.g., "Contacted", "Unavailable") with notes.
*   **Intuitive Dashboard:** Doctors filter donors by blood group, city, verification, and availability status.
*   **Professional UI:** Clean, responsive design (Bootstrap) with a **red & blue** theme.
*   **Secure Authentication:** Powered by Passport.js and `bcryptjs` for doctor logins.

---

## 💡 How It Works (Simplified Flow)

1.  **Donor:** Registers online with details & health declarations. Gets listed as "Unverified," waiting for doctor contact for a full health check.
2.  **Doctor:** Logs into their secure, **city-specific** dashboard. They **verify** donors after in-person checks, and **update statuses** (e.g., "Contacted," "Unavailable") after reaching out. They search for "Verified" and "Available" donors.
3.  **Administrator:** Logs into a special admin panel (password: `supersecretadmin123`). Their role is to **create new doctor accounts** and **assign each doctor to a specific city**.

---

## 🛠 Tech Stack

*   **Backend:** `Node.js`, `Express.js`
*   **Database:** `MongoDB Atlas` (via `Mongoose.js` ODM)
*   **Frontend:** `EJS` (templating), `Bootstrap 5` (CSS Framework)
*   **Authentication:** `Passport.js`, `bcryptjs`
*   **Session Management:** `express-session`, `connect-flash`
*   **Environment Variables:** `dotenv`
*   **Development:** `nodemon`

---

## 🚀 Getting Started (Local Development)

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/rasikarakhewar3010/BloodLink.git
    cd BloodLink
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure `.env`:** Create a `.env` file in the root with:
    ```env
    MONGO_URI="your_mongodb_atlas_connection_string"
    SESSION_SECRET="aLongRandomStringForSession"
    ADMIN_PASSWORD=supersecretadmin123
    ```
    *(Ensure your MongoDB Atlas network access is configured.)*
4.  **Start the app:**
    ```bash
    npm run dev
    ```
5.  **Access:** Open `http://localhost:3000` in your browser.
6.  **Admin Setup:** Go to `http://localhost:3000/admin/login` and use `password` to create your first doctor account (remember to assign a city!).

---

## ☁️ Deployment (Render)

1.  **Prepare:** Push your code to a GitHub/GitLab repository. Ensure your `.env` is NOT committed.
2.  **Render Account:** Sign up/Login to [Render.com](https://render.com/).
3.  **New Web Service:** Connect your Git repo.
4.  **Configure:**
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
    *   **Environment Variables:** Add `MONGO_URI`, `SESSION_SECRET`, `ADMIN_PASSWORD` (and optionally `NODE_ENV=production`) as environment variables on Render.
5.  **Deploy:** Click 'Create Web Service'.
6.  **Post-Deployment:** Access your app via the provided Render URL and use the Admin panel to create doctor accounts.

---

