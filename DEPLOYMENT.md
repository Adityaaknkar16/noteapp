# Deployment Guide: Vercel & Railway / Render

This guide details how to deploy the NoteApp monorepo: **Frontend on Vercel** and **Backend on Railway/Render**.

---

## 1. Local Monorepo Usage

With NPM Workspaces configured in the root directory:
* **Bootstrap Dependencies**: Run `npm install` in the root folder.
* **Run App**: Run `npm run dev` to start both frontend and backend concurrently in one terminal.

---

## 2. Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New** > **Project**.
2. Import your GitHub repository.
3. In the project configuration screen:
   * **Framework Preset**: Vercel should auto-detect `Vite`.
   * **Root Directory**: You can choose **`frontend`** (recommended) or keep `.` (root) as both now have `vercel.json` SPA routing configured.
4. Expand **Environment Variables** and add:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://your-backend-domain.up.railway.app` (your actual backend URL without trailing slash).
   *(Note: `VITE_API_BASE_URL` and `NEXT_PUBLIC_API_URL` are also supported as aliases).*
5. Click **Deploy** (or **Redeploy** after setting environment variables).

---

## 3. Backend Deployment on Railway (or Render)

1. Log in to [Railway](https://railway.app) and click **New Project** > **Deploy from GitHub repo**.
2. Select your repository.
3. In the service **Settings**:
   * Under **General**, find **Root Directory** and set it to **`backend`**.
4. In the service **Variables** tab, add:
   * `MONGO_URL`: Your MongoDB Atlas connection URI (`mongodb+srv://...`).
   * `JWT_SECRET`: A strong random string for signing auth tokens (e.g., `openssl rand -hex 32`).
   * `CLIENT_URL`: `https://noteapp-mu-ashy.vercel.app` (your Vercel frontend URL, without trailing slash).
   * `NODE_ENV`: `production`
   * `PORT`: `3000` (Railway automatically injects `PORT`).
5. In **Networking** (or **Settings**), generate a domain (e.g. `https://your-backend-domain.up.railway.app`).
6. Copy that URL and paste it into your Vercel project's `VITE_API_URL` environment variable, then trigger a redeploy on Vercel!
