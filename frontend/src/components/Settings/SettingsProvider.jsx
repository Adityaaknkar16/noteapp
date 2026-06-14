import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};

// Pastel page flip sound base64 so it works completely offline
const PAGE_FLIP_SFX = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export const SettingsProvider = ({ children }) => {
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem("noteapp_theme") || "light");
  const [flowerOpacity, setFlowerOpacity] = useState(() => Number(localStorage.getItem("noteapp_flower_opacity") ?? "0.15"));
  const [glassBlur, setGlassBlur] = useState(() => Number(localStorage.getItem("noteapp_glass_blur") ?? "16"));
  const [defaultPaper, setDefaultPaper] = useState(() => localStorage.getItem("noteapp_default_paper") || "lined");
  const [defaultFont, setDefaultFont] = useState(() => localStorage.getItem("noteapp_default_font") || "Outfit");
  const [defaultPenColor, setDefaultPenColor] = useState(() => localStorage.getItem("noteapp_default_pen_color") || "#1e293b");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("noteapp_sound_enabled") === "true");

  // Play flip sound when page changes
  useEffect(() => {
    // delay slightly to allow component to render
    const timer = setTimeout(() => {
      playPageFlip();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Sync theme to document body classes
  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("dark", "theme-cream", "theme-lavender", "theme-midnight");
    
    localStorage.setItem("noteapp_theme", theme);

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "cream") {
      root.classList.add("theme-cream");
    } else if (theme === "lavender") {
      root.classList.add("theme-lavender");
    } else if (theme === "midnight") {
      root.classList.add("dark", "theme-midnight");
    }
  }, [theme]);

  // Sync general options
  useEffect(() => {
    localStorage.setItem("noteapp_flower_opacity", flowerOpacity.toString());
    document.documentElement.style.setProperty("--flower-opacity", flowerOpacity.toString());
  }, [flowerOpacity]);

  useEffect(() => {
    localStorage.setItem("noteapp_glass_blur", glassBlur.toString());
    document.documentElement.style.setProperty("--glass-blur", `${glassBlur}px`);
  }, [glassBlur]);

  useEffect(() => {
    localStorage.setItem("noteapp_default_paper", defaultPaper);
  }, [defaultPaper]);

  useEffect(() => {
    localStorage.setItem("noteapp_default_font", defaultFont);
  }, [defaultFont]);

  useEffect(() => {
    localStorage.setItem("noteapp_default_pen_color", defaultPenColor);
  }, [defaultPenColor]);

  useEffect(() => {
    localStorage.setItem("noteapp_sound_enabled", soundEnabled.toString());
  }, [soundEnabled]);

  // Page Flip sound function
  const playPageFlip = () => {
    if (!soundEnabled) return;
    try {
      // A soft, low-volume page-flip synth sound
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = "sine";
      // Slide frequency down to sound like a paper slide/flip
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (e) {
      console.warn("Sound effect error", e);
    }
  };

  return (
    <SettingsContext.Provider value={{
      theme, setTheme,
      flowerOpacity, setFlowerOpacity,
      glassBlur, setGlassBlur,
      defaultPaper, setDefaultPaper,
      defaultFont, setDefaultFont,
      defaultPenColor, setDefaultPenColor,
      soundEnabled, setSoundEnabled,
      playPageFlip
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
