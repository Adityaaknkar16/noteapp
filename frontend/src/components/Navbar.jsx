import React, { useState, useEffect } from 'react';
import { MdOutlineDarkMode, MdOutlineLightMode, MdSettings } from 'react-icons/md';
import SearchBar from './SearchBar/SearchBar';
import ProfileInfo from './Cards/ProfileInfo';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signoutFailure,
  signoutStart,
  signoutSuccess,
} from '../redux/userslice/userSlice';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSettings } from './Settings/SettingsProvider';
import PersonalizationModal from './Settings/PersonalizationModal';
import FlipClock from './FlipClock/FlipClock';

function Navbar({ userInfo, handleClearSearch, onSearchNote }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.user);
  const authToken = token || localStorage.getItem('token');

  const { theme, setTheme, playPageFlip } = useSettings();
  const isDarkMode = theme === "dark" || theme === "midnight";

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
    playPageFlip();
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    if (typeof onSearchNote === 'function') {
      onSearchNote(searchQuery);
    } else {
      console.warn('onSearchNote is not a function');
    }
  };

  const onClearSearch = () => {
    setSearchQuery('');
    if (typeof handleClearSearch === 'function') {
      handleClearSearch();
    }
  };

  const onLogout = async () => {
    try {
      dispatch(signoutStart());

      if (!authToken) {
        toast.error('You are not logged in');
        dispatch(signoutFailure('No authentication token'));
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const logoutAttempts = [
        {
          method: 'get',
          url: 'http://localhost:3000/api/auth/signOut',
          config: {
            headers: { Authorization: `Bearer ${authToken}` },
            withCredentials: true,
            timeout: 10000,
          },
        },
        {
          method: 'post',
          url: 'http://localhost:3000/api/auth/signOut',
          config: {
            withCredentials: true,
            timeout: 10000,
          },
        },
        {
          method: 'delete',
          url: 'http://localhost:3000/api/auth/signOut',
          config: {
            headers: { Authorization: `Bearer ${authToken}` },
            withCredentials: true,
            timeout: 10000,
          },
        },
        {
          method: 'post',
          url: 'http://localhost:3000/api/auth/signOut',
          config: {
            headers: {
              'x-auth-token': authToken,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            timeout: 10000,
          },
        },
      ];

      for (const attempt of logoutAttempts) {
        try {
          const res = await axios[attempt.method](attempt.url, {}, attempt.config);
          if (res.data.success !== false) {
            toast.success(res.data.message || 'Logged out successfully');
            dispatch(signoutSuccess());
            localStorage.removeItem('token');
            navigate('/login');
            return;
          } else {
            toast.error(res.data.message || 'Logout failed');
          }
        } catch (err) {
          toast.error(`${attempt.method.toUpperCase()} logout method failed`);
        }
      }

      toast.warning('Logged out locally (server logout failed)');
      dispatch(signoutSuccess());
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 500) {
        toast.error('Server error occurred during logout');
        dispatch(signoutFailure(error.message));
      } else if (error.code === 'ECONNREFUSED') {
        toast.error('Unable to connect to server');
        dispatch(signoutFailure('Connection failed'));
      } else {
        toast.warning('Logged out locally (server error)');
      }

      dispatch(signoutSuccess());
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className="bg-white/40 dark:bg-slate-900/30 border-b border-white/20 dark:border-slate-800/60 backdrop-blur-md justify-between flex items-center px-6 py-2 drop-shadow transition-colors duration-300">
      <Link to="/">
        <h2 className="text-xl font-bold py-2 tracking-tight">
          <span className="text-blue-500">Task</span>
          <span className="text-slate-800 dark:text-slate-100">Note</span>
        </h2>
      </Link>

      <SearchBar
        value={searchQuery}
        onChange={({ target }) => setSearchQuery(target.value)}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />

      <div className="flex items-center gap-4">
        <FlipClock />

        {/* Settings gear button */}
        <button
          onClick={() => {
            setIsSettingsOpen(true);
            playPageFlip();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-705 dark:text-slate-350"
          title="Personalization & Themes Settings"
        >
          <MdSettings className="text-lg" />
        </button>

        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <MdOutlineLightMode className="text-lg" /> : <MdOutlineDarkMode className="text-lg" />}
        </button>
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>

      <PersonalizationModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

Navbar.defaultProps = {
  onSearchNote: () => {},
  handleClearSearch: () => {},
};

export default Navbar;