import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import { MdOutlineStickyNote2, MdCheckCircle, MdBook, MdDelete, MdAdd, MdClose, MdLocalFireDepartment, MdOutlineDashboard, MdSchool, MdCalendarToday } from "react-icons/md";
import FlowerDecor from "../../components/FlowerDecor/FlowerDecor";
import NotebookPaper from "../../components/NotebookPaper/NotebookPaper";
import Tilt3D from "../../components/Tilt3D/Tilt3D";
import moment from "moment";
import StickerManager from "../../components/StickerManager/StickerManager";
import NotebookEditor from "../../components/NotebookEditor/NotebookEditor";
import { useSettings } from "../../components/Settings/SettingsProvider";

const MOODS = [
  { value: "happy", emoji: "😄", label: "Happy" },
  { value: "productive", emoji: "💪", label: "Productive" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "sad", emoji: "😢", label: "Sad" }
];

function DiaryPage() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);

  const [entries, setEntries] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { defaultPaper, defaultFont, defaultPenColor } = useSettings();

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [color, setColor] = useState("#ffffff");
  const [paperType, setPaperType] = useState(defaultPaper);
  const [fontFamily, setFontFamily] = useState(defaultFont);
  const [penColor, setPenColor] = useState(defaultPenColor);
  const [stickers, setStickers] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchEntries();
    }
  }, [currentUser]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/diary/all", { withCredentials: true });
      if (res.data.success) {
        setEntries(res.data.entries || []);
      }
    } catch (error) {
      alert.error(error.message || "Failed to fetch diary entries");
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert.error("Title and Content are required");
      return;
    }

    try {
       const res = await axios.post("http://localhost:3000/api/diary/add", {
         title,
         content,
         mood,
         date: date ? new Date(date) : new Date(),
         color,
         paperType,
         fontFamily,
         penColor,
         stickers
       }, { withCredentials: true });

      if (res.data.success) {
        alert.success("Diary entry saved!");
        setTitle(""); setContent(""); setMood("neutral"); setDate(moment().format("YYYY-MM-DD"));
        setColor("#ffffff"); setPaperType("lined"); setFontFamily("Outfit"); setPenColor("#1e293b"); setStickers([]);
        setIsAddOpen(false); fetchEntries();
      }
    } catch (error) {
      alert.error(error.message || "Failed to add entry");
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const res = await axios.delete(`http://localhost:3000/api/diary/delete/${entryId}`, { withCredentials: true });
      if (res.data.success) {
        alert.success("Entry deleted");
        fetchEntries();
      }
    } catch (error) {
      alert.error(error.message || "Failed to delete entry");
    }
  };

  const getMoodEmoji = (moodVal) => {
    const found = MOODS.find(m => m.value === moodVal);
    return found ? found.emoji : "😐";
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-purple-400/10 dark:bg-purple-500/5 blur-[90px] pointer-events-none" />
      <FlowerDecor position="bottom-right" size="md" opacity={0.13} />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1 overflow-hidden">
        {/* Left Sidebar Layout */}
        <aside className="w-64 border-r border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 flex flex-col gap-6 shrink-0 max-md:hidden transition-colors overflow-y-auto">
          <div>
            <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Workspace</h5>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdOutlineDashboard className="text-lg text-blue-500/70 dark:text-blue-400/80" />
                Dashboard
              </button>
              <button
                onClick={() => navigate("/notes")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdOutlineStickyNote2 className="text-lg text-emerald-500/70 dark:text-emerald-400/80" />
                Notes Grid
              </button>
              <button
                onClick={() => navigate("/tasks")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdCheckCircle className="text-lg text-violet-500/70 dark:text-violet-400/80" />
                My Tasks
              </button>
              <button
                onClick={() => navigate("/diary")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-pink-500/10 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400 w-full text-left transition-all border border-pink-500/20 shadow-sm"
              >
                <MdBook className="text-lg text-pink-500" />
                Daily Diary
              </button>
              <button
                onClick={() => navigate("/habits")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdLocalFireDepartment className="text-lg text-orange-500/70 dark:text-orange-400/80" />
                Habit Tracker
              </button>
              <button
                onClick={() => navigate("/calendar")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdCalendarToday className="text-lg text-blue-500/70 dark:text-blue-400/80" />
                Calendar
              </button>
              <button
                onClick={() => navigate("/subjects")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdSchool className="text-lg text-slate-400" />
                Subjects
              </button>
            </div>
          </div>
        </aside>

        {/* Diary Main Checklist Grid */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Diary</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Capture your moods, thoughts, and memories</p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2BB5FF] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-sm"
              >
                <MdAdd className="text-lg" />
                Write Log
              </button>
            </div>
            {/* Write Log modal-card */}
            {isAddOpen && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-xl relative transition-colors">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 z-30 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <MdClose className="text-xl" />
                </button>
                
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-6">Write Today's Diary Entry</h3>
                
                {/* Notebook Style Selectors Header */}
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    {/* Paper Type Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Paper Style</label>
                        <select 
                            value={paperType} 
                            onChange={(e) => setPaperType(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border-none outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                            <option value="lined">📝 Ruled Lines</option>
                            <option value="grid">📐 Grid Math</option>
                            <option value="dotted">⚪ Dotted Grid</option>
                            <option value="pink-gingham">🌸 Pink Checked</option>
                            <option value="plain">📄 Clean Plain</option>
                        </select>
                    </div>

                    {/* Font Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ink Font</label>
                        <select 
                            value={fontFamily} 
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border-none outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                            <option value="Outfit">Outfit (Sans)</option>
                            <option value="Kalam">Kalam (Handwriting)</option>
                            <option value="Patrick Hand">Patrick Hand (Cute)</option>
                            <option value="Playpen Sans">Playpen (Comic)</option>
                            <option value="Special Elite">Special Elite (Typewriter)</option>
                            <option value="Architects Daughter">Architect (Draft)</option>
                            <option value="Great Vibes">Great Vibes (Cursive)</option>
                            <option value="Sacramento">Sacramento (Elegant)</option>
                            <option value="Rochester">Rochester (Script)</option>
                            <option value="Reenie Beanie">Reenie Beanie (Artist)</option>
                        </select>
                    </div>

                    {/* Pen Ink Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pen Color</label>
                        <div className="flex gap-1.5 items-center h-8">
                            {[
                                { name: "Slate", value: "#1e293b" },
                                { name: "Royal Blue", value: "#1d4ed8" },
                                { name: "Ruby Red", value: "#dc2626" },
                                { name: "Forest Green", value: "#15803d" },
                                { name: "Violet", value: "#7c3aed" },
                                { name: "Hot Pink", value: "#db2777" }
                            ].map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPenColor(p.value)}
                                    className={`w-5 h-5 rounded-full border transition-all ${penColor === p.value ? 'ring-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                    style={{ backgroundColor: p.value }}
                                    title={p.name}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleAddEntry} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Date</label>
                      <input
                        type="date"
                        className="border border-slate-250 dark:border-slate-700 px-4 py-2.5 rounded-xl w-full outline-none bg-transparent text-slate-800 dark:text-slate-100 text-sm font-medium"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>

                    {/* Mood Selector */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mood</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {MOODS.map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setMood(m.value)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              mood === m.value
                                ? "bg-blue-600 border-transparent text-white"
                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            <span>{m.emoji}</span>
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notebook Paper Surface Editor */}
                  <NotebookPaper
                    paperType={paperType}
                    fontFamily={fontFamily}
                    penColor={penColor}
                    bgColor={color}
                    className="w-full"
                  >
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Log Title (e.g. My Sunny Day Walk)"
                        className="text-xl font-bold outline-none bg-transparent w-full"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ color: penColor }}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <NotebookEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Start writing your diary thoughts..."
                        fontFamily={fontFamily}
                        penColor={penColor}
                        setPenColor={setPenColor}
                      />
                    </div>

                    {/* Notebook Stickers Showcase */}
                    {stickers && stickers.length > 0 && (
                      <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-slate-200/25">
                        {stickers.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            alt="sticker"
                            className="max-w-[80px] max-h-[80px] object-contain rotate-[-3deg] hover:rotate-[3deg] transition-all cursor-default"
                            style={{
                              filter: "drop-shadow(2.5px 0 0 white) drop-shadow(-2.5px 0 0 white) drop-shadow(0 2.5px 0 white) drop-shadow(0 -2.5px 0 white) drop-shadow(0 4px 8px rgba(0,0,0,0.18))"
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </NotebookPaper>

                  {/* Sticker Upload and Management Panel */}
                  <StickerManager stickers={stickers} setStickers={setStickers} penColor={penColor} />

                  <div className="flex justify-between items-center gap-4 flex-wrap mt-2">
                    {/* Paper Color Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Paper Color</label>
                      <div className="flex gap-2 items-center">
                        {[
                          { name: 'White', value: '#ffffff' },
                          { name: 'Yellow', value: '#fff9db' },
                          { name: 'Blue', value: '#e7f5ff' },
                          { name: 'Green', value: '#e6fcf5' },
                          { name: 'Pink', value: '#fff0f6' },
                          { name: 'Purple', value: '#f3f0ff' },
                          { name: 'Orange', value: '#fff4e6' }
                        ].map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            className={`w-7 h-7 rounded-full border transition-all cursor-pointer hover:scale-105 ${color === c.value ? 'scale-110 border-slate-900 dark:border-white shadow-md ring-2 ring-blue-400' : 'border-slate-350 dark:border-slate-800'}`}
                            style={{ backgroundColor: c.value }}
                            onClick={() => setColor(c.value)}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-blue-500/20 transition-all uppercase tracking-wider"
                    >
                      Save Entry
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List logs in a timeline-style or card grid */}
            {entries.length > 0 ? (
              <div className="flex flex-col gap-8">
                {entries.map((entry) => (
                  <Tilt3D key={entry._id} className="w-full">
                    <NotebookPaper
                      paperType={entry.paperType || "lined"}
                      fontFamily={entry.fontFamily || "Outfit"}
                      penColor={entry.penColor || "#1e293b"}
                      bgColor={entry.color || "#ffffff"}
                      className="w-full shadow-lg"
                    >
                      <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-2 border-b border-slate-200/20">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl" title={`Mood: ${entry.mood}`}>{getMoodEmoji(entry.mood)}</span>
                            <h3 className="text-lg font-bold leading-tight" style={{ color: entry.penColor }}>{entry.title}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100/40 border border-slate-200/30">
                              {moment(entry.date).format("Do MMMM YYYY")}
                            </span>
                            <button
                              onClick={() => handleDeleteEntry(entry._id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete log"
                            >
                              <MdDelete className="text-lg" />
                            </button>
                          </div>
                        </div>
                        <div 
                          className="text-sm leading-relaxed opacity-90 select-text" 
                          style={{ color: entry.penColor }}
                          dangerouslySetInnerHTML={{ __html: entry.content }}
                        />

                        {/* Render stickers inside diary log preview */}
                        {entry.stickers && entry.stickers.length > 0 && (
                          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-200/20">
                            {entry.stickers.map((src, idx) => (
                              <img
                                key={idx}
                                src={src}
                                alt="sticker"
                                className="max-w-[70px] max-h-[70px] object-contain rotate-[-3deg] hover:rotate-[3deg] transition-all cursor-default"
                                style={{
                                  filter: "drop-shadow(2px 0 0 white) drop-shadow(-2px 0 0 white) drop-shadow(0 2px 0 white) drop-shadow(0 -2px 0 white) drop-shadow(0 3px 6px rgba(0,0,0,0.15))"
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </NotebookPaper>
                  </Tilt3D>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 italic">
                No logs recorded yet. Start writing down your day!
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DiaryPage;
