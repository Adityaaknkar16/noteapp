import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../Settings/SettingsProvider';
import {
  LuLayoutDashboard,
  LuStickyNote,
  LuSquareCheck,
  LuBookOpen,
  LuFlame,
  LuCalendar,
  LuGraduationCap,
  LuWallet,
  LuX,
  LuShoppingCart,
  LuSparkles,
  LuPencil
} from 'react-icons/lu';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { isSidebarOpen, setIsSidebarOpen } = useSettings();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LuLayoutDashboard, color: 'text-accent-rust' },
    { path: '/notes', label: 'Notes Grid', icon: LuStickyNote, color: 'text-accent-sage' },
    { path: '/sketchpad', label: 'Sketchpad', icon: LuPencil, color: 'text-accent-ochre' },
    { path: '/tasks', label: 'My Tasks', icon: LuSquareCheck, color: 'text-accent-rust' },
    { path: '/diary', label: 'Daily Diary', icon: LuBookOpen, color: 'text-accent-ochre' },
    { path: '/habits', label: 'Habit Tracker', icon: LuFlame, color: 'text-accent-rust' },
    { path: '/calendar', label: 'Calendar', icon: LuCalendar, color: 'text-accent-blue' },
    { path: '/subjects', label: 'Subjects', icon: LuGraduationCap, color: 'text-ink-muted' },
    { path: '/budget', label: 'Budget Tracker', icon: LuWallet, color: 'text-accent-sage' },
    { path: '/shopping', label: 'Shopping List', icon: LuShoppingCart, color: 'text-accent-rust' },
    { path: '/pantry', label: 'Pantry', icon: LuSparkles, color: 'text-accent-ochre' },
    { path: '/bills', label: 'Bills & Reminders', icon: LuWallet, color: 'text-accent-blue' },
  ];

  const handleNav = (path) => {
    navigate(path);
    setIsSidebarOpen(false); // Close mobile drawer on link click
  };

  return (
    <>
      {/* ── Desktop Sidebar View ── */}
      <aside className="w-64 border-r border-border bg-surface p-6 flex flex-col gap-6 shrink-0 max-md:hidden transition-colors h-full">
        <div>
          <h5 className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-4">Workspace</h5>
          <div className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg text-sm font-semibold w-full text-left transition-all border-l-3 cursor-pointer ${
                    isActive
                      ? 'bg-accent-rust/10 border-accent-rust text-accent-rust'
                      : 'border-transparent text-ink-muted hover:bg-bg hover:text-ink'
                  }`}
                >
                  <Icon className={`text-lg ${isActive ? 'text-accent-rust' : item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop Mask */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Drawer content */}
        <aside 
          className={`absolute top-0 bottom-0 left-0 w-64 bg-surface border-r border-border p-6 flex flex-col gap-6 shadow-2xl transition-transform duration-300 select-none text-ink ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h5 className="text-xs font-bold text-ink-muted uppercase tracking-widest">Workspace</h5>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-full hover:bg-bg text-ink-muted hover:text-ink cursor-pointer"
            >
              <LuX className="text-lg" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg text-sm font-semibold w-full text-left transition-all border-l-3 cursor-pointer ${
                    isActive
                      ? 'bg-accent-rust/10 border-accent-rust text-accent-rust'
                      : 'border-transparent text-ink-muted hover:bg-bg hover:text-ink'
                  }`}
                >
                  <Icon className={`text-lg ${isActive ? 'text-accent-rust' : item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
