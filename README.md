# NoteApp — Intelligent MERN Note Taking, Kanban & Analytics Suite

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Adityaaknkar16/noteapp.git)
[![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Backend-Express_5.1-green?logo=express)](https://expressjs.com/)
[![Vite 7](https://img.shields.io/badge/Bundler-Vite_7-646CFF?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Mongoose_8-brightgreen?logo=mongodb)](https://mongoosejs.com/)
[![Redux Toolkit](https://img.shields.io/badge/State-Redux_Toolkit-764ABC?logo=redux)](https://redux-toolkit.js.org/)

**NoteApp** is a full-featured personal knowledge management, Kanban task board, and note analytics suite built on the MERN stack. Designed with React 19, Express 5, and Vite 7, it features rich-text notes, drag-and-drop Kanban organization via `@dnd-kit`, Recharts productivity analytics, instant search, and one-click PDF and Excel export.

---

## 🔗 Repository Information

- **GitHub Repository**: [https://github.com/Adityaaknkar16/noteapp.git](https://github.com/Adityaaknkar16/noteapp.git)

---

## 🌟 Key Features

- **Rich Note Taking & Categorization**:
  - Create, format, color-code, and pin critical notes.
  - Tag-based filtering and instant real-time search.
- **Interactive Drag-and-Drop Kanban Board**:
  - Built with `@dnd-kit/core` for fluid 60fps drag-and-drop card movements between stages.
- **Productivity Analytics & Visualizations**:
  - Interactive charts powered by **Recharts** displaying note creation velocity, category distributions, and completion trends.
- **Multi-Format Export**:
  - Export notes and tasks to high-resolution vector PDF using **jsPDF** and **html2canvas**.
  - Export structured task summaries directly to Excel spreadsheets with **xlsx**.
- **State Persistence & Offline Hydration**:
  - Powered by **Redux Toolkit** and **Redux Persist** to retain user state and filters seamlessly.
- **Secure Authentication**:
  - Express 5 REST API secured with salted **BCrypt** password hashing and **JSON Web Tokens (JWT)**.
- **Production Cloud Deployment**:
  - Configured for multi-tier Vercel serverless deployment (`vercel.json`).

---

## 🛠️ Tech Stack & Dependencies

### Frontend (`frontend/`)
- **Framework & Bundler**: React 19 with Vite 7 (SWC compiler)
- **State Management**: Redux Toolkit & Redux Persist
- **Drag & Drop**: `@dnd-kit/core`
- **Charts & Metrics**: `recharts` 3.8
- **Export Engines**: `jspdf` 4.2, `html2canvas` 1.4, `xlsx` 0.18
- **Styling**: Tailwind CSS & React Icons
- **Notifications**: `react-toastify`

### Backend (`backend/`)
- **Framework**: Express.js 5.1 (ES Modules)
- **Database**: MongoDB with Mongoose 8.17 ODM
- **Authentication**: `jsonwebtoken` 9.0, `bcryptjs` 3.0, `cookie-parser` 1.4
- **Utilities**: `cors`, `moment`, `dotenv`

---

## 📁 Monorepo Structure

```text
noteapp/
├── package.json               # Root monorepo workspace configuration
├── vercel.json                # Vercel deployment routing and configuration
├── DEPLOYMENT.md              # Cloud deployment guide
├── setup.md                   # Quick copy-paste setup guide
├── backend/                   # Express 5 REST backend
│   ├── index.js               # Server entrypoint and DB connection
│   ├── models/                # User, Note, and Category schemas
│   ├── routes/                # Auth and Notes API routes
│   └── package.json           # Backend dependencies
└── frontend/                  # React 19 client application
    ├── src/
    │   ├── components/        # NoteCard, KanbanBoard, AnalyticsModal, Header
    │   ├── redux/             # Redux Toolkit slices (authSlice, notesSlice)
    │   ├── pages/             # Dashboard, Login, Register, Archive
    │   └── App.jsx
    ├── vite.config.js
    └── package.json           # Frontend dependencies
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/noteapp?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Installation & Running

### Option A: Monorepo Root Script
Run concurrently from the root directory:
```bash
# Install all dependencies (root, backend, frontend)
npm install
npm install --prefix backend
npm install --prefix frontend

# Run both backend and frontend concurrently
npm run dev
```

### Option B: Separate Terminals
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```
- Frontend runs at `http://localhost:5173`
- Backend API runs at `http://localhost:5000`
