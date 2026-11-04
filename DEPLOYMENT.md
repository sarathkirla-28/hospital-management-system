# Deployment & Execution Guide

**Project:** Intelligent Hospital Management System  
**Configured Local Port:** **8082** (matching internship presentation Slide 9)  

---

## 1. Local Execution Instructions

### Prerequisites
* **Node.js:** v18.0.0 or higher (v24 LTS recommended)
* **npm:** v9.0.0 or higher

### Step-by-Step Setup

1. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

3. **Build the Production Frontend:**
   ```bash
   npm run build
   ```
   *(This outputs the compiled SPA bundle to `client/dist`, which Express serves automatically).*

4. **Launch the Full-Stack Server:**
   ```bash
   cd ../server
   node src/index.js
   ```
   * The server initializes the SQLite database (`data/hospital.db`), runs initial seeding, and starts listening on **http://localhost:8082**.
   * Open **http://localhost:8082** in your web browser.

---

## 2. Demonstration Tunneling via ngrok (Slide 9 Specification)

The presentation highlights ngrok for exposing the local Apache/Tomcat/Node server for live stakeholder evaluation:

1. Download and install ngrok from [ngrok.com](https://ngrok.com).
2. With the local server running on port 8082, open a separate terminal and execute:
   ```bash
   ngrok http 8082
   ```
3. Copy the secure public forwarding URL (e.g., `https://xxxx-xx-xx.ngrok-free.app`) and share it with reviewers or evaluation committees.

---

## 3. Production Cloud Hosting Options

### Option A: Render (Free Web Service + Managed PostgreSQL)
1. Fork or push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), create a **New Web Service**:
   * **Root Directory:** `server`
   * **Build Command:** `npm install && cd ../client && npm install && npm run build`
   * **Start Command:** `node src/index.js`
   * **Environment Variables:**
     * `NODE_ENV=production`
     * `PORT=10000`
     * `JWT_SECRET=your_production_secret_key`
     * `DATABASE_URL=postgres://user:password@host/dbname` (Optional: if using managed Postgres)

### Option B: Static Frontend on GitHub Pages
1. The frontend client includes a complete resilient LocalDataStore layer.
2. Set `base: '/hospital-management-system/'` in `client/vite.config.js`.
3. Deploy `client/dist` to GitHub Pages via `gh-pages` or GitHub Actions workflow.
4. The site operates with 100% interactive fidelity across all pages, patient booking, doctor queues, and admin CSV exports!

---

## 4. Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8082` | HTTP listening port for Express backend. |
| `JWT_SECRET` | `hospital_secure_jwt_secret_demo_2026` | Secret key used for signing session tokens. |
| `DATABASE_URL` | *(None / SQLite)* | PostgreSQL connection URI. If omitted, uses self-contained SQLite database. |
| `NODE_ENV` | `development` | Runtime mode (`development` or `production`). |
| `VITE_API_URL` | `/api` | Base URL used by the client for backend API communication. |
