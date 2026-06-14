import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './pages/Home/Home'; 
import Dashboard from './pages/Dashboard/Dashboard';
import TasksPage from './pages/Tasks/TasksPage';
import DiaryPage from './pages/Diary/DiaryPage';
import HabitsPage from './pages/Habits/HabitsPage';
import CalendarPage from './pages/Calendar/CalendarPage';
import SubjectsPage from './pages/Subjects/SubjectsPage';
import { AlertProvider } from './components/Alert/AlertProvider';
import { SettingsProvider } from './components/Settings/SettingsProvider';

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AlertProvider>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/notes' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/tasks' element={<TasksPage />} />
            <Route path='/diary' element={<DiaryPage />} />
            <Route path='/habits' element={<HabitsPage />} />
            <Route path='/calendar' element={<CalendarPage />} />
            <Route path='/subjects' element={<SubjectsPage />} />
          </Routes>
        </AlertProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;