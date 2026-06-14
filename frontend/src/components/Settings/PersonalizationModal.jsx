import React from "react";
import Modal from "react-modal";
import { MdClose, MdPalette, MdVolumeUp, MdSettings, MdWallpaper } from "react-icons/md";
import { useSettings } from "./SettingsProvider";

export default function PersonalizationModal({ isOpen, onClose }) {
  const {
    theme, setTheme,
    flowerOpacity, setFlowerOpacity,
    glassBlur, setGlassBlur,
    defaultPaper, setDefaultPaper,
    defaultFont, setDefaultFont,
    defaultPenColor, setDefaultPenColor,
    soundEnabled, setSoundEnabled,
    playPageFlip
  } = useSettings();

  const themes = [
    { id: "light", name: "☀️ Classic Light", desc: "Clean lined sheets" },
    { id: "dark", name: "🌙 Modern Dark", desc: "Dark graphite pages" },
    { id: "cream", name: "🍦 Pastel Cream", desc: "Vintage sepia aesthetic" },
    { id: "lavender", name: "🌸 Lavender fields", desc: "Cute light purple aura" },
    { id: "midnight", name: "🌌 Neon Midnight", desc: "Deep space cyber look" }
  ];

  const fonts = [
    "Outfit", "Kalam", "Patrick Hand", "Playpen Sans", "Special Elite", 
    "Architects Daughter", "Great Vibes", "Sacramento", "Rochester", "Reenie Beanie"
  ];

  const papers = [
    { value: "lined", label: "📝 Ruled Lines" },
    { value: "grid", label: "📐 Grid Math" },
    { value: "dotted", label: "⚪ Dotted Grid" },
    { value: "pink-gingham", label: "🌸 Pink Checked" },
    { value: "plain", label: "📄 Clean Plain" }
  ];

  const penColors = [
    { name: "Navy/Slate", value: "#1e293b" },
    { name: "Royal Blue", value: "#1d4ed8" },
    { name: "Ruby Red", value: "#dc2626" },
    { name: "Forest Green", value: "#15803d" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Hot Pink", value: "#db2777" }
  ];

  const handleSoundToggle = (val) => {
    setSoundEnabled(val);
    if (val) {
      setTimeout(() => playPageFlip(), 100);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(5px)",
          zIndex: 1000
        }
      }}
      contentLabel="Personalization Settings"
      className="w-[500px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl mx-auto mt-14 p-6 overflow-y-auto max-sm:w-[90%] shadow-2xl transition-colors select-none"
    >
      <div className="flex justify-between items-center mb-6 border-b border-slate-150 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
          <MdSettings className="text-xl text-blue-500" />
          Personalization & Style
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
        >
          <MdClose className="text-xl" />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Theme Grid */}
        <div>
          <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <MdPalette className="text-sm" /> Workspace Theme
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  playPageFlip();
                }}
                className={`p-3 rounded-2xl border text-left transition-all hover:scale-102 flex flex-col justify-between cursor-pointer ${
                  theme === t.id
                    ? "bg-blue-500/10 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-350"
                }`}
              >
                <span className="text-xs font-bold">{t.name}</span>
                <span className="text-[10px] opacity-60 mt-1">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Aesthetics Sliders */}
        <div>
          <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <MdWallpaper className="text-sm" /> Aesthetics Controls
          </label>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl flex flex-col gap-4">
            {/* Flower opacity */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-750 dark:text-slate-300 mb-1">
                <span>Corner Flowers Opacity</span>
                <span>{Math.round(flowerOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={flowerOpacity}
                onChange={(e) => setFlowerOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Glass Blur */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-750 dark:text-slate-300 mb-1">
                <span>Glassmorphism Blur Radius</span>
                <span>{glassBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="2"
                value={glassBlur}
                onChange={(e) => setGlassBlur(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Audio Effects */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <MdVolumeUp className="text-lg text-blue-500" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-750 dark:text-slate-300">Auditory Page Flip SFX</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">Plays soft page transitions</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => handleSoundToggle(e.target.checked)}
            className="w-9 h-5 rounded-full appearance-none bg-slate-300 dark:bg-slate-700 checked:bg-blue-600 relative cursor-pointer outline-none transition-colors before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-all checked:before:translate-x-4"
          />
        </div>

        {/* Default Note Settings */}
        <div>
          <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            ✏️ Default Note Presets
          </label>
          
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl">
            {/* Paper */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Default Paper</span>
              <select
                value={defaultPaper}
                onChange={(e) => setDefaultPaper(e.target.value)}
                className="bg-white dark:bg-slate-950 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 outline-none text-slate-705 dark:text-slate-200 cursor-pointer"
              >
                {papers.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Font */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Default Font</span>
              <select
                value={defaultFont}
                onChange={(e) => setDefaultFont(e.target.value)}
                className="bg-white dark:bg-slate-950 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 outline-none text-slate-705 dark:text-slate-200 cursor-pointer"
              >
                {fonts.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Pen Ink color */}
            <div className="col-span-2 flex flex-col gap-1.5 pt-2 border-t border-slate-150 dark:border-slate-800/60">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Default Pen Ink</span>
              <div className="flex gap-2 items-center">
                {penColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setDefaultPenColor(c.value)}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                      defaultPenColor === c.value
                        ? "ring-2 ring-blue-500 border-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
