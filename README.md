# Altis Homes — Premium Real Estate Portal

Altis Homes is a modern real estate listing and lead management platform. It features an interactive client-facing search dashboard (with financial calculators, dynamic maps, and a video-supported media gallery) and a secured administrative control panel.

## Project Structure

This repository is structured as a monorepo:
* **[`/frontend`](./frontend)**: React + Vite client application styled with vanilla CSS.
* **[`/backend`](./backend)**: Node.js + Express web API connected to MongoDB Atlas and utilizing GridFS for database-backed file storage.

---

## Quick Start (Local Run)

To run the full application locally, you must run both the backend API server and the frontend development server.

### 1. Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the example environment file and configure your credentials (e.g., your MongoDB Atlas connection string):
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```
   *The backend will run on `http://localhost:3001`.*

### 2. Start the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*
