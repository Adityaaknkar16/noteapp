import React, { useState, useEffect } from 'react';
import { LuSun, LuMoon, LuSettings, LuSearch, LuMenu, LuX } from 'react-icons/lu';
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
import Modal from 'react-modal';

function Navbar({ userInfo, handleClearSearch, onSearchNote }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [paletteNotes, setPaletteNotes] = useState([]);
  const [paletteTasks, setPaletteTasks] = useState([]);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.user);
  const authToken = token || localStorage.getItem('token');

  const { theme, setTheme, playPageFlip, isSidebarOpen, setIsSidebarOpen } = useSettings();
  const isDarkMode = theme === "dark" || theme === "midnight";

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
    playPageFlip();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      axios.get("http://localhost:3000/api/note/all", { withCredentials: true })
        .then(res => { if (res.data.success) setPaletteNotes(res.data.notes || []); })
        .catch(err => console.error(err));
      
      axios.get("http://localhost:3000/api/task/all", { withCredentials: true })
        .then(res => { if (res.data.success) setPaletteTasks(res.data.tasks || []); })
        .catch(err => console.error(err));
    }
  }, [isCommandPaletteOpen]);

  const handleSearch = () => {
    if (!searchQuery) return;
    if (typeof onSearchNote === 'function') {
      onSearchNote(searchQuery);
      setIsMobileSearchExpanded(false); // collapse overlay after search
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
    <div className="bg-surface border-b border-border justify-between flex items-center px-4 md:px-6 py-2 shadow-sm transition-colors duration-300 text-ink relative">
      {/* Left items: Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-1.5 rounded-lg hover:bg-bg text-ink cursor-pointer"
          title="Toggle Sidebar Menu"
        >
          <LuMenu className="text-xl" />
        </button>
        <Link to="/">
          <h2 className="text-lg md:text-xl font-display font-bold py-2 tracking-tight">
            <span className="text-accent-rust">Ink</span>
            <span className="text-ink">well</span>
          </h2>
        </Link>
      </div>

      {/* Desktop Search Bar (Hidden on <640px) */}
      <div className="hidden sm:block">
        <SearchBar
          value={searchQuery}
          onChange={({ target }) => setSearchQuery(target.value)}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />
      </div>

      {/* Right control buttons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Search Button (visible only <640px) */}
        <button
          onClick={() => setIsMobileSearchExpanded(true)}
          className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center bg-bg hover:filter hover:brightness-95 transition-all cursor-pointer text-ink"
          title="Search"
        >
          <LuSearch className="text-lg" />
        </button>

        <div className="hidden md:flex">
          <FlipClock />
        </div>

        {/* Settings gear button */}
        <button
          onClick={() => {
            setIsSettingsOpen(true);
            playPageFlip();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-bg hover:filter hover:brightness-95 transition-all cursor-pointer text-ink-muted"
          title="Personalization & Themes Settings"
        >
          <LuSettings className="text-lg text-ink" />
        </button>

        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-bg hover:filter hover:brightness-95 transition-all cursor-pointer text-ink-muted"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <LuSun className="text-lg text-ink" /> : <LuMoon className="text-lg text-ink" />}
        </button>
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>

      {/* Full-width Search Overlay for screens <640px */}
      {isMobileSearchExpanded && (
        <div className="absolute inset-0 bg-surface z-50 flex items-center px-4 gap-3 animate-fade-in">
          <button
            onClick={() => setIsMobileSearchExpanded(false)}
            className="p-1 rounded-lg hover:bg-bg text-ink cursor-pointer"
          >
            <LuX className="text-xl" />
          </button>
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={({ target }) => setSearchQuery(target.value)}
              handleSearch={handleSearch}
              onClearSearch={onClearSearch}
            />
          </div>
        </div>
      )}

      <PersonalizationModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Command Palette Modal */}
      <Modal
        isOpen={isCommandPaletteOpen}
        onRequestClose={() => setIsCommandPaletteOpen(false)}
        style={{
          overlay: {
            backgroundColor: "rgba(43, 37, 32, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 2000
          }
        }}
        contentLabel="Command Palette"
        className="w-[500px] bg-surface border border-border rounded-lg mx-auto mt-24 p-4 shadow-xl text-ink"
      >
        <div className="flex items-center gap-2 border-b border-border pb-2.5 mb-3">
          <LuSearch className="text-ink-muted text-lg shrink-0" />
          <input
            type="text"
            placeholder="Search pages, notes, or tasks... (Ctrl+K)"
            className="w-full bg-transparent outline-none text-xs text-ink"
            value={commandSearch}
            onChange={(e) => setCommandSearch(e.target.value)}
            autoFocus
          />
          <button onClick={() => setIsCommandPaletteOpen(false)} className="text-[10px] text-ink-muted hover:text-ink font-mono bg-bg border border-border px-1.5 py-0.5 rounded">ESC</button>
        </div>

        {/* Search Results */}
        <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
          {/* Quick Navigation links */}
          {!commandSearch && (
            <div>
              <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest block mb-1.5">Quick Navigation</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button onClick={() => { navigate("/"); setIsCommandPaletteOpen(false); }} className="p-2 bg-bg border border-border rounded text-left hover:bg-accent-rust/10 hover:border-accent-rust hover:text-accent-rust font-semibold transition-all">🏠 Dashboard</button>
                <button onClick={() => { navigate("/notes"); setIsCommandPaletteOpen(false); }} className="p-2 bg-bg border border-border rounded text-left hover:bg-accent-rust/10 hover:border-accent-rust hover:text-accent-rust font-semibold transition-all">📓 Notes Grid</button>
                <button onClick={() => { navigate("/tasks"); setIsCommandPaletteOpen(false); }} className="p-2 bg-bg border border-border rounded text-left hover:bg-accent-rust/10 hover:border-accent-rust hover:text-accent-rust font-semibold transition-all">☑️ My Tasks</button>
                <button onClick={() => { navigate("/diary"); setIsCommandPaletteOpen(false); }} className="p-2 bg-bg border border-border rounded text-left hover:bg-accent-rust/10 hover:border-accent-rust hover:text-accent-rust font-semibold transition-all">📖 Daily Diary</button>
                <button onClick={() => { navigate("/habits"); setIsCommandPaletteOpen(false); }} className="p-2 bg-bg border border-border rounded text-left hover:bg-accent-rust/10 hover:border-accent-rust hover:text-accent-rust font-semibold transition-all">🔥 Habit Tracker</button>
                <button onClick={() => { navigate("/calendar"); setIsCommandPaletteOpen(false); }} className="p-2 bg-bg border border-border rounded text-left hover:bg-accent-rust/10 hover:border-accent-rust hover:text-accent-rust font-semibold transition-all">📅 Calendar</button>
                <button onClick={() => { navigate("/subjects"); setIsCommandPaletteOpen(false); }} className="p-2 bg-bg border border-border rounded text-left hover:bg-accent-rust/10 hover:border-accent-rust hover:text-accent-rust font-semibold transition-all">🎓 Subjects</button>
                <button onClick={() => { navigate("/budget"); setIsCommandPaletteOpen(false); }} className="p-2 bg-bg border border-border rounded text-left hover:bg-accent-rust/10 hover:border-accent-rust hover:text-accent-rust font-semibold transition-all">💰 Budget Tracker</button>
              </div>
            </div>
          )}

          {/* Filtered Results */}
          {commandSearch && (
            <div className="space-y-3.5">
              {/* Notes match */}
              {paletteNotes.filter(n => n.title.toLowerCase().includes(commandSearch.toLowerCase()) || n.content.toLowerCase().includes(commandSearch.toLowerCase())).length > 0 && (
                <div>
                  <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest block mb-1.5">Matching Notes</span>
                  <div className="flex flex-col gap-1">
                    {paletteNotes
                      .filter(n => n.title.toLowerCase().includes(commandSearch.toLowerCase()) || n.content.toLowerCase().includes(commandSearch.toLowerCase()))
                      .slice(0, 5)
                      .map(note => (
                        <button
                          key={note._id}
                          onClick={() => { navigate("/notes"); setIsCommandPaletteOpen(false); }}
                          className="w-full text-left p-2 hover:bg-bg border border-transparent hover:border-border rounded text-xs transition-all flex justify-between items-center"
                        >
                          <span className="font-semibold truncate">📓 {note.title}</span>
                          <span className="text-[9px] text-ink-muted font-mono">View notes</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Tasks match */}
              {paletteTasks.filter(t => t.title.toLowerCase().includes(commandSearch.toLowerCase())).length > 0 && (
                <div>
                  <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest block mb-1.5">Matching Tasks</span>
                  <div className="flex flex-col gap-1">
                    {paletteTasks
                      .filter(t => t.title.toLowerCase().includes(commandSearch.toLowerCase()))
                      .slice(0, 5)
                      .map(task => (
                        <button
                          key={task._id}
                          onClick={() => { navigate("/tasks"); setIsCommandPaletteOpen(false); }}
                          className="w-full text-left p-2 hover:bg-bg border border-transparent hover:border-border rounded text-xs transition-all flex justify-between items-center"
                        >
                          <span className="font-semibold truncate">☑️ {task.title}</span>
                          <span className="text-[9px] text-ink-muted font-mono">{task.completed ? "completed" : "pending"}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

Navbar.defaultProps = {
  onSearchNote: () => {},
  handleClearSearch: () => {},
};

export default Navbar;