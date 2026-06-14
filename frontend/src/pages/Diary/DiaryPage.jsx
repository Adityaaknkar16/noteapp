import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import { 
  LuPlus, 
  LuX, 
  LuTrash2, 
  LuBookOpen, 
  LuCalendar,
  LuSmile,
  LuZap,
  LuMeh,
  LuCoffee,
  LuFrown,
  LuImage,
  LuSparkles
} from "react-icons/lu";
import PageDecor from "../../components/Doodles/PageDecor";
import BottomBar from "../../components/BottomBar/BottomBar";
import NotebookPaper from "../../components/NotebookPaper/NotebookPaper";
import Tilt3D from "../../components/Tilt3D/Tilt3D";
import moment from "moment";
import StickerManager from "../../components/StickerManager/StickerManager";
import NotebookEditor from "../../components/NotebookEditor/NotebookEditor";
import VoiceInput from "../../components/VoiceInput/VoiceInput";
import diaryPrompts from "../../data/diaryPrompts";
import { useSettings } from "../../components/Settings/SettingsProvider";

const MOODS = [
  { value: "happy", icon: LuSmile, label: "Happy", color: "bg-accent-ochre text-white border-accent-ochre" },
  { value: "productive", icon: LuZap, label: "Productive", color: "bg-accent-sage text-white border-accent-sage" },
  { value: "neutral", icon: LuMeh, label: "Neutral", color: "bg-accent-blue text-white border-accent-blue" },
  { value: "tired", icon: LuCoffee, label: "Tired", color: "bg-ink-muted text-white border-ink-muted" },
  { value: "sad", icon: LuFrown, label: "Sad", color: "bg-accent-red text-white border-accent-red" }
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
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchEntries();
      // Select random prompt from imported prompts list
      const idx = Math.floor(Math.random() * diaryPrompts.length);
      setCurrentPrompt(diaryPrompts[idx]);
    }
  }, [currentUser]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/diary/all", { withCredentials: true });
      if (res.data.success) {
        setEntries(res.data.entries || []);
      }
    } catch (error) {
      alert.error("Failed to fetch diary entries");
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
    });
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
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
         stickers,
         photos
       }, { withCredentials: true });

      if (res.data.success) {
        alert.success("Diary entry saved!");
        setTitle(""); setContent(""); setMood("neutral"); setDate(moment().format("YYYY-MM-DD"));
        setColor("#ffffff"); setPaperType(defaultPaper); setFontFamily(defaultFont); setPenColor(defaultPenColor); setStickers([]);
        setPhotos([]);
        setIsAddOpen(false); fetchEntries();
        // Select new prompt
        const idx = Math.floor(Math.random() * diaryPrompts.length);
        setCurrentPrompt(diaryPrompts[idx]);
      }
    } catch (error) {
      alert.error("Failed to save entry");
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
      alert.error("Failed to delete entry");
    }
  };

  const getMoodIcon = (moodVal) => {
    const found = MOODS.find(m => m.value === moodVal);
    if (found) {
      const Icon = found.icon;
      return <Icon className="text-xl" title={found.label} />;
    }
    return <LuMeh className="text-xl" />;
  };

  const getMoodBadgeColor = (moodVal) => {
    const found = MOODS.find(m => m.value === moodVal);
    return found ? found.color : "bg-bg text-ink-muted border-border";
  };

  const getMonthlyHeatmap = () => {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    const daysInMonth = endOfMonth.date();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = startOfMonth.clone().date(i);
      const dateStr = currentDate.format("YYYY-MM-DD");
      const entry = entries.find(e => moment(e.date).format("YYYY-MM-DD") === dateStr);
      days.push({
        dayNum: i,
        dayLabel: currentDate.format("ddd"),
        dateStr,
        mood: entry ? entry.mood : null
      });
    }
    return days;
  };

  const heatmapDays = getMonthlyHeatmap();

  return (
    <div className="h-screen bg-bg flex flex-col text-ink transition-colors duration-300 relative overflow-hidden">
      <PageDecor variant="diary" />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 pb-24 sm:pb-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">Daily Diary</h1>
                <p className="text-xs text-ink-muted mt-1 font-medium">Capture your moods, thoughts, memories, and reflection prompts.</p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent-rust text-white rounded-lg text-xs font-bold cursor-pointer hover:brightness-110 shadow-sm"
              >
                <LuPlus className="text-sm" /> Write Log
              </button>
            </div>

            {/* Monthly Mood Heatmap Grid */}
            <div className="paper-card p-4 sm:p-6 mb-8 border border-border">
              <h3 className="text-xs font-mono font-bold text-ink-muted uppercase tracking-widest mb-4">
                Mood Tracker - {moment().format("MMMM YYYY")}
              </h3>
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-16 gap-2">
                {heatmapDays.map((day) => {
                  let cellColor = "bg-surface border border-border";
                  if (day.mood) {
                    const match = MOODS.find(m => m.value === day.mood);
                    if (match) {
                      cellColor = match.color.split(' ')[0] + " text-white border-transparent";
                    }
                  }
                  return (
                    <div
                      key={day.dateStr}
                      className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center select-none font-mono text-[10px] ${cellColor}`}
                      title={`${day.dateStr} ${day.mood ? `(${day.mood})` : ''}`}
                    >
                      <span className="opacity-60">{day.dayNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write Log panel */}
            {isAddOpen && (
              <div className="bg-surface border border-border rounded-lg p-6 mb-8 shadow-xl relative transition-colors">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="absolute top-4 right-4 text-ink-muted hover:text-ink z-30 w-8 h-8 rounded-full flex items-center justify-center hover:bg-bg cursor-pointer"
                >
                  <LuX className="text-xl" />
                </button>
                
                <h3 className="font-display font-bold text-ink text-base mb-6">Write Today's Diary Entry</h3>
                
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-border">
                    {/* Paper Style Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Paper Style</label>
                        <select 
                            value={paperType} 
                            onChange={(e) => setPaperType(e.target.value)}
                            className="bg-surface text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border outline-none text-ink cursor-pointer"
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
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Ink Font</label>
                        <select 
                            value={fontFamily} 
                            onChange={(e) => setFontFamily(e.target.value)}
                            className="bg-surface text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border outline-none text-ink cursor-pointer"
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
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Pen Color</label>
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
                                    className={`w-5 h-5 rounded-full border transition-all ${penColor === p.value ? 'ring-2 ring-accent-rust scale-110' : 'opacity-70 hover:opacity-100'}`}
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
                      <label className="text-[10px] uppercase font-bold text-ink-muted block mb-1.5">Date</label>
                      <input
                        type="date"
                        className="input-box bg-transparent text-sm text-ink outline-none"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>

                    {/* 5-Point Mood Selector */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-ink-muted block mb-1.5">How are you feeling?</label>
                      <div className="flex gap-2">
                        {MOODS.map((m) => {
                          const Icon = m.icon;
                          const isSelected = mood === m.value;
                          return (
                            <button
                              key={m.value}
                              type="button"
                              onClick={() => setMood(m.value)}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer select-none text-xs font-bold gap-1 ${
                                isSelected
                                  ? m.color + " shadow"
                                  : "border-border text-ink-muted hover:bg-bg"
                              }`}
                            >
                              <Icon className="text-lg" />
                              <span className="text-[9px] font-mono">{m.label}</span>
                            </button>
                          );
                        })}
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
                    <div className="flex items-center gap-3 w-full">
                      <input
                        type="text"
                        placeholder="Log Title (e.g. My Sunny Day Walk)"
                        className="text-xl font-bold outline-none bg-transparent flex-1 border-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ color: penColor }}
                      />
                      <VoiceInput onTranscript={(text) => setTitle(prev => prev + " " + text)} />
                    </div>

                    <div className="flex flex-col gap-2 mt-4 relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest">Diary Content</label>
                        <VoiceInput onTranscript={(text) => setContent(prev => prev + " " + text)} />
                      </div>
                      
                      {/* Reflection prompt helper when empty */}
                      {!content && (
                        <div className="bg-bg/65 border border-dashed border-border p-3 rounded-lg text-xs italic text-ink-muted mb-2 flex items-center justify-between">
                          <span>💡 <strong>Prompt:</strong> {currentPrompt}</span>
                          <button
                            type="button"
                            onClick={() => setContent(currentPrompt + "\n\n")}
                            className="px-2.5 py-0.5 bg-accent-rust text-white text-[9px] font-bold rounded hover:brightness-110 cursor-pointer"
                          >
                            💭 Use Prompt
                          </button>
                        </div>
                      )}
                      <NotebookEditor
                        value={content}
                        onChange={setContent}
                        placeholder={currentPrompt}
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

                  {/* Attach Photos Section */}
                  <div className="flex flex-col gap-2.5 pt-4 border-t border-border/50">
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest block">Attach Photo Memories</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="px-3 py-1.5 border border-dashed border-border rounded-lg text-xs font-semibold hover:bg-bg cursor-pointer inline-flex items-center gap-1.5">
                        <LuImage className="text-sm text-accent-rust" /> Choose Images
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {photos.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {photos.map((src, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded border border-border overflow-hidden bg-bg">
                            <img src={src} alt="thumbnail" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black cursor-pointer"
                            >
                              <LuX className="text-[10px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center gap-4 flex-wrap mt-2 pt-4 border-t border-border/40">
                    {/* Paper Color Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Paper Color</label>
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
                            className={`w-7 h-7 rounded-full border transition-all cursor-pointer hover:scale-105 ${color === c.value ? 'scale-110 border-ink shadow-md ring-2 ring-accent-rust' : 'border-border'}`}
                            style={{ backgroundColor: c.value }}
                            onClick={() => setColor(c.value)}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary flex items-center justify-center gap-2 max-w-[200px] cursor-pointer"
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
                      className="w-full shadow-md"
                    >
                      <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-2 border-b border-border">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg border flex items-center justify-center ${getMoodBadgeColor(entry.mood)}`}>
                              {getMoodIcon(entry.mood)}
                            </span>
                            <h3 className="text-lg font-bold leading-tight" style={{ color: entry.penColor }}>{entry.title}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-bg/50 border border-border">
                              {moment(entry.date).format("Do MMMM YYYY")}
                            </span>
                            <button
                              onClick={() => handleDeleteEntry(entry._id)}
                              className="p-1 text-ink-muted hover:text-accent-red transition-colors cursor-pointer rounded hover:bg-bg"
                              title="Delete log"
                            >
                              <LuTrash2 className="text-lg" />
                            </button>
                          </div>
                        </div>
                        
                        <div 
                          className="text-sm leading-relaxed opacity-90 select-text" 
                          style={{ color: entry.penColor }}
                          dangerouslySetInnerHTML={{ __html: entry.content }}
                        />

                        {/* Photo Memories Gallery */}
                        {entry.photos && entry.photos.length > 0 && (
                          <div className="flex gap-3 flex-wrap mt-4">
                            {entry.photos.map((photo, i) => (
                              <img
                                key={i}
                                src={photo}
                                alt="Memory attachment"
                                className="max-w-[180px] max-h-[140px] object-cover rounded-lg border border-border shadow-sm hover:scale-[1.03] transition-all"
                              />
                            ))}
                          </div>
                        )}

                        {/* Render stickers inside diary log preview */}
                        {entry.stickers && entry.stickers.length > 0 && (
                          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
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
              <div className="text-center py-20 text-ink-muted italic">
                No logs recorded yet. Start writing down your day!
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}

export default DiaryPage;
