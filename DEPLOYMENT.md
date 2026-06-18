# Deployment Guide: Vercel & Railway

This guide details how to deploy the NoteApp monorepo: **Frontend on Vercel** and **Backend on Railway**.

---

## 1. Local Monorepo Usage

With the updated folder structure and **NPM Workspaces** configured in the root directory:
* **Bootstrap Dependencies**: Run `npm install` in the root folder. This automatically installs dependencies for both `frontend` and `backend` using workspaces.
* **Run App**: Run `npm run dev` to start both frontend and backend concurrently in one terminal.

---

## 2. Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New** > **Project**.
2. Import your GitHub repository.
3. In the project configuration screen:
   * **Framework Preset**: Vercel should auto-detect `Vite`. If not, select it manually.
   * **Root Directory**: Click **Edit** next to Root Directory and choose **`frontend`**. *This is crucial so Vercel only builds the frontend.*
4. Expand **Environment Variables** and add:
   * **Key**: `VITE_API_BASE_URL`
   * **Value**: `https://your-backend-domain.up.railway.app` (replace with your actual Railway backend URL once deployed).
5. Click **Deploy**.

---

## 3. Backend Deployment on Railway

1. Log in to [Railway](https://railway.app) and click **New Project** > **Deploy from GitHub repo**.
2. Select your repository.
3. Once the service is created, go to the service **Settings**:
   * Under **General**, find **Root Directory** (or **Watch Paths** / **Subdirectory**) and set it to **`backend`**. This tells Railway to build and run the code from the `backend/` folder.
4. Go to the service **Variables** tab and add the following:
   * `MONGO_URL`: Your MongoDB connection URI (e.g., MongoDB Atlas connection string).
   * `FRONTEND_URL`: `https://your-frontend-domain.vercel.app` (your Vercel app URL, without trailing slash, to allow CORS requests).
   * `PORT`: Railway automatically injects the `PORT` variable. Our backend code `process.env.PORT || 3000` is fully compatible.
5. In the **Settings** tab, generate a domain (under **Networking**) so you have a public endpoint (e.g., `https://your-backend-domain.up.railway.app`). Copy this URL and save it in your Vercel project's `VITE_API_BASE_URL` environment variable.
