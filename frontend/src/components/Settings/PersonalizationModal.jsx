import React, { useState } from "react";
import Modal from "react-modal";
import { 
  LuX, 
  LuPalette, 
  LuVolume2, 
  LuSettings, 
  LuImage, 
  LuDatabase,
  LuDownload,
  LuUpload
} from "react-icons/lu";
import { useSettings } from "./SettingsProvider";
import axios from "axios";
import { useAlert } from "../Alert/AlertProvider";

export default function PersonalizationModal({ isOpen, onClose }) {
  const alert = useAlert();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

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
    { id: "light", name: "☀️ Classic Light", desc: "Warm paper sheets" },
    { id: "dark", name: "☕ Espresso Dark", desc: "Cozy dark graphite pages" },
    { id: "cream", name: "🍦 Sepia Cream", desc: "Vintage warm aesthetic" },
    { id: "lavender", name: "🌸 Soft Lavender", desc: "Cute light purple aura" },
    { id: "midnight", name: "🌌 Space Midnight", desc: "Deep dark espresso aura" }
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

  // Export JSON Data
  const handleExportData = async () => {
    setExporting(true);
    try {
      const [notesRes, tasksRes, diaryRes, habitsRes, subjectsRes, eventsRes] = await Promise.all([
        axios.get("/api/note/all", { withCredentials: true }),
        axios.get("/api/task/all", { withCredentials: true }),
        axios.get("/api/diary/all", { withCredentials: true }),
        axios.get("/api/habit/all", { withCredentials: true }),
        axios.get("/api/academic/subjects/all", { withCredentials: true }),
        axios.get("/api/academic/events/all", { withCredentials: true })
      ]);

      const backupData = {
        notes: notesRes.data.notes || [],
        tasks: tasksRes.data.tasks || [],
        diary: diaryRes.data.entries || [],
        habits: habitsRes.data.habits || [],
        subjects: subjectsRes.data.subjects || [],
        events: eventsRes.data.events || []
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inkwell_backup_${moment().format("YYYY-MM-DD")}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert.success("Data exported successfully!");
    } catch (err) {
      alert.error("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  // Import JSON Data
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      setImporting(true);
      try {
        const data = JSON.parse(event.target.result);
        
        // Loop and import each item sequentially
        if (data.notes) {
          for (const note of data.notes) {
            await axios.post("/api/note/add", {
              title: note.title,
              content: note.content,
              tags: note.tags,
              color: note.color,
              paperType: note.paperType,
              fontFamily: note.fontFamily,
              penColor: note.penColor,
              stickers: note.stickers
            }, { withCredentials: true });
          }
        }

        if (data.tasks) {
          for (const task of data.tasks) {
            await axios.post("/api/task/add", {
              title: task.title,
              priority: task.priority,
              dueDate: task.dueDate
            }, { withCredentials: true });
          }
        }

        if (data.diary) {
          for (const entry of data.diary) {
            await axios.post("/api/diary/add", {
              title: entry.title,
              content: entry.content,
              mood: entry.mood,
              date: entry.date,
              color: entry.color,
              paperType: entry.paperType,
              fontFamily: entry.fontFamily,
              penColor: entry.penColor,
              stickers: entry.stickers
            }, { withCredentials: true });
          }
        }

        if (data.habits) {
          for (const habit of data.habits) {
            await axios.post("/api/habit/add", {
              title: habit.title,
              description: habit.description,
              color: habit.color
            }, { withCredentials: true });
          }
        }

        if (data.subjects) {
          for (const sub of data.subjects) {
            await axios.post("/api/academic/subjects/add", {
              name: sub.name,
              color: sub.color,
              performance: sub.performance,
              icon: sub.icon
            }, { withCredentials: true });
          }
        }

        alert.success("Data imported successfully! Please refresh pages to sync.");
        onClose();
        window.location.reload();
      } catch (err) {
        alert.error("Import failed. Verify JSON format.");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: "rgba(43, 37, 32, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 1000
        }
      }}
      contentLabel="Personalization Settings"
      className="w-[500px] max-h-[85vh] bg-surface border border-border rounded-lg mx-auto mt-14 p-6 overflow-y-auto max-sm:w-[90%] shadow-xl transition-colors select-none text-ink"
    >
      <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
        <h3 className="font-display font-bold text-ink text-base flex items-center gap-2">
          <LuSettings className="text-xl text-accent-rust" />
          Personalization & Style
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bg transition-colors text-ink-muted cursor-pointer"
        >
          <LuX className="text-xl" />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Theme Grid */}
        <div>
          <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <LuPalette className="text-sm" /> Workspace Theme
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
                className={`p-3 rounded-lg border text-left transition-all hover:scale-102 flex flex-col justify-between cursor-pointer ${
                  theme === t.id
                    ? "bg-accent-rust/10 border-accent-rust text-accent-rust"
                    : "border-border hover:bg-bg text-ink"
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
          <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <LuImage className="text-sm" /> Aesthetics Controls
          </label>
          
          <div className="bg-bg border border-border p-4 rounded-lg flex flex-col gap-4">
            {/* Flower opacity */}
            <div>
              <div className="flex justify-between text-xs font-bold text-ink mb-1">
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
                className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent-rust"
              />
            </div>
          </div>
        </div>

        {/* Audio Effects */}
        <div className="flex items-center justify-between p-3 bg-bg border border-border rounded-lg">
          <div className="flex items-center gap-2.5">
            <LuVolume2 className="text-lg text-accent-rust" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink">Auditory Page Flip SFX</span>
              <span className="text-[10px] text-ink-muted leading-tight">Plays soft page transitions</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => handleSoundToggle(e.target.checked)}
            className="w-9 h-5 rounded-full appearance-none bg-border checked:bg-accent-rust relative cursor-pointer outline-none transition-colors before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-all checked:before:translate-x-4"
          />
        </div>

        {/* Default Note Settings */}
        <div>
          <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1.5 mb-3">
            ✏️ Default Note Presets
          </label>
          
          <div className="grid grid-cols-2 gap-4 bg-bg border border-border p-4 rounded-lg">
            {/* Paper */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Default Paper</span>
              <select
                value={defaultPaper}
                onChange={(e) => setDefaultPaper(e.target.value)}
                className="bg-surface text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border outline-none text-ink cursor-pointer"
              >
                {papers.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Font */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Default Font</span>
              <select
                value={defaultFont}
                onChange={(e) => setDefaultFont(e.target.value)}
                className="bg-surface text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border outline-none text-ink cursor-pointer"
              >
                {fonts.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Pen Ink color */}
            <div className="col-span-2 flex flex-col gap-1.5 pt-2 border-t border-border">
              <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Default Pen Ink</span>
              <div className="flex gap-2 items-center">
                {penColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setDefaultPenColor(c.value)}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                      defaultPenColor === c.value
                        ? "ring-2 ring-accent-rust border-surface"
                        : "border-border"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div>
          <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <LuDatabase className="text-sm" /> Data Management
          </label>
          <div className="bg-bg border border-border p-4 rounded-lg flex flex-col gap-3">
            <p className="text-[10px] text-ink-muted leading-relaxed">
              Export all your Inkwell notes, tasks, diary sessions, habits, and schedules into a single JSON file. You can import it later to recover your space.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                disabled={exporting}
                onClick={handleExportData}
                className="btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <LuDownload className="text-sm" /> {exporting ? "Exporting..." : "Export JSON"}
              </button>

              <label className="btn-primary py-2 text-xs flex items-center justify-center gap-1.5 bg-accent-sage text-white cursor-pointer hover:brightness-110">
                <LuUpload className="text-sm" /> {importing ? "Importing..." : "Import JSON"}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
