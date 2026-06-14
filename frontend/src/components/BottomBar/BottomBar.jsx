import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettings } from "../Settings/SettingsProvider";
import {
  LuLayoutDashboard,
  LuStickyNote,
  LuSquareCheck,
  LuBookOpen,
  LuMenu
} from "react-icons/lu";

export default function BottomBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { setIsSidebarOpen } = useSettings();

  const tabs = [
    { path: "/", label: "Home", icon: LuLayoutDashboard },
    { path: "/notes", label: "Notes", icon: LuStickyNote },
    { path: "/tasks", label: "Tasks", icon: LuSquareCheck },
    { path: "/diary", label: "Diary", icon: LuBookOpen },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border z-40 sm:hidden flex items-center justify-around px-4 pb-safe shadow-[0_-2px_10px_rgba(43,37,32,0.06)] transition-colors text-ink select-none">
      {tabs.map((tab) => {
        const isActive = currentPath === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              isActive ? "text-accent-rust scale-105" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Icon className="text-xl" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        );
      })}
      
      {/* Drawer Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="flex flex-col items-center justify-center gap-1 text-ink-muted hover:text-ink cursor-pointer"
      >
        <LuMenu className="text-xl" />
        <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
      </button>
    </div>
  );
}
