# Setup Guide - NoteApp

This guide provides simple copy-paste terminal commands to install all dependencies and run the application.

---

## 1. Quick Install (One-Line Command)

If you are using **PowerShell** (Windows default), you can run this command in the root directory (`e:\projectss\noteapp`) to install dependencies for the root, backend, and frontend all at once:

```powershell
npm install; cd backend; npm install; cd ../frontend; npm install; cd ..
```

If you are using **Command Prompt (CMD)**, run:

```cmd
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
```

---

## 2. Step-by-Step Installation

If you prefer to run them separately, execute these commands in order:

### Root Directory Dependencies
Run in the root folder (`e:\projectss\noteapp`):
```bash
npm install
```

### Backend Dependencies
Run in the root folder to go to backend and install:
```bash
cd backend
npm install
cd ..
```

### Frontend Dependencies
Run in the root folder to go to frontend and install:
```bash
cd frontend
npm install
cd ..
```

---

## 3. Running the App

After everything is installed, open two terminal windows to run both services:

### Start Backend
In terminal 1:
```bash
cd backend
npm run dev
```

### Start Frontend
In terminal 2:
```bash
cd frontend
npm run dev
```
