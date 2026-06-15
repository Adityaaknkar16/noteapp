import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import PageDecor from "../../components/Doodles/PageDecor";
import BottomBar from "../../components/BottomBar/BottomBar";
import { 
  LuPlus, 
  LuX, 
  LuTrash2, 
  LuFlame, 
  LuCalendar,
  LuSparkles,
  LuPencil
} from "react-icons/lu";
import moment from "moment";

function HabitsPage() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);
  
  const [habits, setHabits] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("var(--accent-rust)");
  const [editHabitId, setEditHabitId] = useState(null);

  // Custom Frequency states
  const [frequencyType, setFrequencyType] = useState("daily"); // 'daily', 'weekdays', 'weekly'
  const [selectedWeekdays, setSelectedWeekdays] = useState([]); // Array of 'Mon', 'Tue', etc.
  const [timesPerWeek, setTimesPerWeek] = useState(3);

  // Local storage cache for habit frequencies
  const [habitFrequencies, setHabitFrequencies] = useState(() => {
    return JSON.parse(localStorage.getItem("inkwell_habit_frequencies") || "{}");
  });

  // Generate last 15 days for quick checklist
  const [lastDays, setLastDays] = useState([]);
  // Generate last 90 days for heatmap
  const [last90Days, setLast90Days] = useState([]);

  useEffect(() => {
    const dates = [];
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        dateStr: d.toLocaleDateString('en-CA'),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
        dayNum: d.getDate()
      });
    }
    setLastDays(dates);

    const heatmapDates = [];
    for (let i = 89; i >= 0; i--) {
      const d = moment().subtract(i, 'days');
      heatmapDates.push({
        dateStr: d.format("YYYY-MM-DD"),
        dayNum: d.date()
      });
    }
    setLast90Days(heatmapDates);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchHabits();
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("inkwell_habit_frequencies", JSON.stringify(habitFrequencies));
  }, [habitFrequencies]);

  const fetchHabits = async () => {
    try {
      const res = await axios.get("/api/habit/all", { withCredentials: true });
      if (res.data.success) {
        setHabits(res.data.habits || []);
      }
    } catch (error) {
      alert.error(error.message || "Failed to fetch habits");
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!title) { alert.error("Habit title is required"); return; }

    try {
      const res = await axios.post("/api/habit/add", {
        title,
        description,
        color
      }, { withCredentials: true });

      if (res.data.success) {
        const newHabit = res.data.habit;
        // Save frequency settings locally
        setHabitFrequencies(prev => ({
          ...prev,
          [newHabit._id]: {
            type: frequencyType,
            weekdays: selectedWeekdays,
            times: timesPerWeek
          }
        }));

        alert.success("Habit added!");
        resetForm(); setIsAddOpen(false); fetchHabits();
      }
    } catch (error) {
      alert.error(error.message || "Failed to add habit");
    }
  };

  const handleEditHabit = async (e) => {
    e.preventDefault();
    if (!title) { alert.error("Habit title is required"); return; }

    try {
      const res = await axios.post(`/api/habit/edit/${editHabitId}`, {
        title,
        description,
        color
      }, { withCredentials: true });

      if (res.data.success) {
        // Update frequency settings locally
        setHabitFrequencies(prev => ({
          ...prev,
          [editHabitId]: {
            type: frequencyType,
            weekdays: selectedWeekdays,
            times: timesPerWeek
          }
        }));

        alert.success("Habit updated!");
        resetForm(); setIsEditOpen(false); fetchHabits();
      }
    } catch (error) {
      alert.error(error.message || "Failed to update habit");
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) return;
    try {
      const res = await axios.delete(`/api/habit/delete/${habitId}`, { withCredentials: true });
      if (res.data.success) {
        alert.success("Habit deleted");
        const updatedFreqs = { ...habitFrequencies };
        delete updatedFreqs[habitId];
        setHabitFrequencies(updatedFreqs);
        fetchHabits();
      }
    } catch (error) {
      alert.error(error.message || "Failed to delete habit");
    }
  };

  const toggleDate = async (habitId, dateStr) => {
    try {
      const res = await axios.post(`/api/habit/toggle/${habitId}`, { date: dateStr }, { withCredentials: true });
      if (res.data.success) {
        setHabits(prev => prev.map(h => h._id === habitId ? res.data.habit : h));
      }
    } catch (error) {
      alert.error(error.message || "Failed to update habit progress");
    }
  };

  const openEditModal = (habit) => {
    setEditHabitId(habit._id);
    setTitle(habit.title);
    setDescription(habit.description);
    setColor(habit.color);

    const freq = habitFrequencies[habit._id] || { type: 'daily', weekdays: [], times: 3 };
    setFrequencyType(freq.type);
    setSelectedWeekdays(freq.weekdays);
    setTimesPerWeek(freq.times);

    setIsEditOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setColor("var(--accent-rust)");
    setEditHabitId(null);
    setFrequencyType("daily");
    setSelectedWeekdays([]);
    setTimesPerWeek(3);
  };

  const toggleWeekday = (day) => {
    if (selectedWeekdays.includes(day)) {
      setSelectedWeekdays(prev => prev.filter(d => d !== day));
    } else {
      setSelectedWeekdays(prev => [...prev, day]);
    }
  };

  const colorsList = [
    "var(--accent-rust)",
    "var(--accent-sage)",
    "var(--accent-ochre)",
    "var(--accent-blue)",
    "var(--accent-red)",
  ];

  return (
    <div className="h-screen bg-bg flex flex-col text-ink transition-colors duration-300 relative overflow-hidden">
      <PageDecor variant="habits" />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1 overflow-hidden">
        <Sidebar />

        {/* Habits Main Area */}
        <main className="flex-1 p-4 sm:p-8 pb-24 sm:pb-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">Habit Tracker</h1>
                <p className="text-xs text-ink-muted mt-1 font-medium">Consistency builds character. Monitor your streaks daily!</p>
              </div>
              <button
                onClick={() => { resetForm(); setIsAddOpen(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent-rust text-white rounded-lg text-xs font-bold cursor-pointer hover:brightness-110 shadow-sm"
              >
                <LuPlus className="text-sm" /> Add Habit
              </button>
            </div>

            {/* Add Habit Modal */}
            {isAddOpen && (
              <div className="bg-surface border border-border rounded-lg p-5 mb-6 shadow-md relative transition-colors max-w-xl text-ink">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
                >
                  <LuX className="text-lg" />
                </button>
                <h3 className="font-display font-bold text-ink text-sm mb-4">Create New Habit</h3>
                <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Habit name (e.g. Read 10 Pages, Drink 3L Water)"
                      className="input-box"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Description/Why this is important (optional)"
                      className="input-box"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Frequency Customizer */}
                  <div className="border border-border p-3.5 rounded-lg bg-bg">
                    <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest block mb-2">Configure Frequency</label>
                    <div className="flex gap-2 mb-3">
                      {['daily', 'weekdays', 'weekly'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFrequencyType(type)}
                          className={`px-3 py-1 rounded text-xs font-semibold capitalize border ${
                            frequencyType === type ? 'bg-accent-rust border-accent-rust text-white' : 'bg-surface border-border text-ink-muted'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {frequencyType === 'weekdays' && (
                      <div className="flex gap-1.5 flex-wrap">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWeekday(day)}
                            className={`w-9 h-8 rounded text-xs font-bold border ${
                              selectedWeekdays.includes(day) ? 'bg-accent-sage border-accent-sage text-white' : 'bg-surface border-border text-ink-muted'
                            }`}
                          >
                            {day.slice(0, 1)}
                          </button>
                        ))}
                      </div>
                    )}

                    {frequencyType === 'weekly' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-muted">Times per week:</span>
                        <input
                          type="number"
                          min="1"
                          max="7"
                          value={timesPerWeek}
                          onChange={(e) => setTimesPerWeek(Number(e.target.value))}
                          className="w-16 bg-surface border border-border rounded px-2.5 py-1 text-xs text-ink outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1.5">Color Tag</label>
                    <div className="flex gap-2.5">
                      {colorsList.map((col) => (
                        <button
                          key={col}
                          type="button"
                          className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer"
                          style={{
                            backgroundColor: col,
                            borderColor: color === col ? "var(--ink)" : "transparent"
                          }}
                          onClick={() => setColor(col)}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                  >
                    Save Habit
                  </button>
                </form>
              </div>
            )}

            {/* Edit Habit Modal */}
            {isEditOpen && (
              <div className="bg-surface border border-border rounded-lg p-5 mb-6 shadow-md relative transition-colors max-w-xl text-ink">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
                >
                  <LuX className="text-lg" />
                </button>
                <h3 className="font-display font-bold text-ink text-sm mb-4">Edit Habit Details</h3>
                <form onSubmit={handleEditHabit} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      className="input-box"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="input-box"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Frequency Customizer */}
                  <div className="border border-border p-3.5 rounded-lg bg-bg">
                    <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest block mb-2">Configure Frequency</label>
                    <div className="flex gap-2 mb-3">
                      {['daily', 'weekdays', 'weekly'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFrequencyType(type)}
                          className={`px-3 py-1 rounded text-xs font-semibold capitalize border ${
                            frequencyType === type ? 'bg-accent-rust border-accent-rust text-white' : 'bg-surface border-border text-ink-muted'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {frequencyType === 'weekdays' && (
                      <div className="flex gap-1.5 flex-wrap">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWeekday(day)}
                            className={`w-9 h-8 rounded text-xs font-bold border ${
                              selectedWeekdays.includes(day) ? 'bg-accent-sage border-accent-sage text-white' : 'bg-surface border-border text-ink-muted'
                            }`}
                          >
                            {day.slice(0, 1)}
                          </button>
                        ))}
                      </div>
                    )}

                    {frequencyType === 'weekly' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-muted">Times per week:</span>
                        <input
                          type="number"
                          min="1"
                          max="7"
                          value={timesPerWeek}
                          onChange={(e) => setTimesPerWeek(Number(e.target.value))}
                          className="w-16 bg-surface border border-border rounded px-2.5 py-1 text-xs text-ink outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1.5">Color Tag</label>
                    <div className="flex gap-2.5">
                      {colorsList.map((col) => (
                        <button
                          key={col}
                          type="button"
                          className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer"
                          style={{
                            backgroundColor: col,
                            borderColor: color === col ? "var(--ink)" : "transparent"
                          }}
                          onClick={() => setColor(col)}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                  >
                    Update Habit
                  </button>
                </form>
              </div>
            )}

            {/* Habits Grid list */}
            {habits.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {habits.map((habit) => {
                  const freq = habitFrequencies[habit._id] || { type: 'daily', weekdays: [], times: 3 };
                  return (
                    <div
                      key={habit._id}
                      className="paper-card p-5 border border-border flex flex-col md:flex-row justify-between gap-6"
                      style={{ borderLeft: `4px solid ${habit.color}` }}
                    >
                      {/* Left: Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-ink leading-snug">{habit.title}</h3>
                            {habit.description && (
                              <p className="text-xs text-ink-muted mt-0.5">{habit.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => openEditModal(habit)}
                              className="p-1 text-ink-muted hover:text-accent-rust transition-colors rounded hover:bg-bg cursor-pointer"
                              title="Edit"
                            >
                              <LuPencil className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDeleteHabit(habit._id)}
                              className="p-1 text-ink-muted hover:text-accent-red transition-colors rounded hover:bg-bg cursor-pointer"
                              title="Delete"
                            >
                              <LuTrash2 className="text-base" />
                            </button>
                          </div>
                        </div>

                        {/* Streak & Frequency Badge */}
                        <div className="flex items-center gap-3 text-xs mb-4 flex-wrap">
                          <span className="flex items-center gap-1 text-accent-rust font-bold bg-accent-rust/10 px-2 py-0.5 rounded">
                            <LuFlame className="text-sm animate-pulse" />
                            {habit.streak} Day Streak
                          </span>
                          <span className="text-ink-muted font-mono bg-bg border border-border px-2 py-0.5 rounded capitalize">
                            🔁 {freq.type === 'weekdays' ? `Weekdays (${freq.weekdays.join(', ')})` : (freq.type === 'weekly' ? `${freq.times}x/week` : 'Daily')}
                          </span>
                        </div>

                        {/* Checklist last 15 days */}
                        <div className="mt-4">
                          <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider mb-2">Quick Log (Last 15 Days)</div>
                          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                            {lastDays.map((day) => {
                              const isCompleted = habit.completedDates.includes(day.dateStr);
                              return (
                                <button
                                  key={day.dateStr}
                                  onClick={() => toggleDate(habit._id, day.dateStr)}
                                  className={`min-w-[32px] h-10 rounded flex flex-col items-center justify-center border transition-all cursor-pointer select-none ${
                                    isCompleted
                                      ? "text-white border-transparent"
                                      : "border-border text-ink-muted hover:bg-bg"
                                  }`}
                                  style={{
                                    backgroundColor: isCompleted ? (habit.color || 'var(--accent-sage)') : "transparent"
                                  }}
                                  title={day.dateStr}
                                >
                                  <span className={`text-[7px] font-bold ${isCompleted ? 'text-white/80' : 'text-ink-muted'}`}>{day.dayName}</span>
                                  <span className="text-[10px] font-bold leading-none mt-0.5">{day.dayNum}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right: GitHub style 90-Day Contribution Heatmap */}
                      <div className="md:w-[280px] shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
                        <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest block mb-2">90-Day Streak Heatmap</span>
                        <div className="grid grid-cols-15 gap-1.5">
                          {last90Days.map((day) => {
                            const isCompleted = habit.completedDates.includes(day.dateStr);
                            return (
                              <div
                                key={day.dateStr}
                                className={`w-3.5 h-3.5 rounded-sm transition-all ${
                                  isCompleted ? '' : 'bg-bg border border-border'
                                }`}
                                style={{
                                  backgroundColor: isCompleted ? (habit.color || 'var(--accent-sage)') : undefined
                                }}
                                title={`${day.dateStr}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-ink-muted mt-2">
                          <span>90 days ago</span>
                          <span>Today</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-ink-muted italic">
                You haven't added any habits yet. Start tracking a new habit to build consistency!
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}

export default HabitsPage;
