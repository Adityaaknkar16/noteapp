import React, { useState } from 'react';
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

function Navbar({ userInfo, handleClearSearch, onSearchNote }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.user);
  const authToken = token || localStorage.getItem('token');

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
    <div className="bg-white justify-between flex items-center px-6 py-2 drop-shadow">
      <Link to="/">
        <h2 className="text-xl font-medium text-black py-2">
          <span className="text-slate-500">Task</span>
          <span className="text-slate-900">Note</span>
        </h2>
      </Link>

      <SearchBar
        value={searchQuery}
        onChange={({ target }) => setSearchQuery(target.value)}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />

      <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
    </div>
  );
}

Navbar.defaultProps = {
  onSearchNote: () => {},
  handleClearSearch: () => {},
};

export default Navbar;