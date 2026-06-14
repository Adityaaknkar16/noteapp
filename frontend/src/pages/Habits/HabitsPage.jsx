import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import FlowerDecor from "../../components/FlowerDecor/FlowerDecor";
import { 
  MdOutlineStickyNote2, 
  MdCheckCircle, 
  MdBook, 
  MdDelete, 
  MdAdd, 
  MdClose, 
  MdModeEditOutline,
  MdLocalFireDepartment,
  MdOutlineDashboard
} from "react-icons/md";

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
  const [color, setColor] = useState("#3B82F6");
  const [editHabitId, setEditHabitId] = useState(null);

  // Generate last 15 days for completion grid display
  const [lastDays, setLastDays] = useState([]);

  useEffect(() => {
    // Generate dates in YYYY-MM-DD format (local timezone)
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
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchHabits();
    }
  }, [currentUser]);

  const fetchHabits = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/habit/all", { withCredentials: true });
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
      const res = await axios.post("http://localhost:3000/api/habit/add", {
        title,
        description,
        color
      }, { withCredentials: true });

      if (res.data.success) {
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
      const res = await axios.post(`http://localhost:3000/api/habit/edit/${editHabitId}`, {
        title,
        description,
        color
      }, { withCredentials: true });

      if (res.data.success) {
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
      const res = await axios.delete(`http://localhost:3000/api/habit/delete/${habitId}`, { withCredentials: true });
      if (res.data.success) {
        alert.success("Habit deleted");
        fetchHabits();
      }
    } catch (error) {
      alert.error(error.message || "Failed to delete habit");
    }
  };

  const toggleDate = async (habitId, dateStr) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/habit/toggle/${habitId}`, { date: dateStr }, { withCredentials: true });
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
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setColor("#3B82F6");
    setEditHabitId(null);
  };

  const colorsList = [
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#06B6D4", // Cyan
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-purple-400/10 dark:bg-purple-500/5 blur-[90px] pointer-events-none" />
      <FlowerDecor position="bottom-right" size="md" opacity={0.13} />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1">
        {/* Left Sidebar Layout */}
        <aside className="w-64 border-r border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 flex flex-col gap-6 shrink-0 max-md:hidden transition-colors">
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
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdBook className="text-lg text-pink-500/70 dark:text-pink-400/80" />
                Daily Diary
              </button>
              <button
                onClick={() => navigate("/habits")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 w-full text-left transition-all border border-orange-500/20 shadow-sm"
              >
                <MdLocalFireDepartment className="text-lg text-orange-500" />
                Habit Tracker
              </button>
              <button
                onClick={() => navigate("/calendar")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdOutlineDashboard className="text-lg text-blue-500/70 dark:text-blue-400/80" />
                Calendar
              </button>
              <button
                onClick={() => navigate("/subjects")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdOutlineDashboard className="text-lg text-slate-400" />
                Subjects
              </button>
            </div>
          </div>
        </aside>

        {/* Habits Main Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Habit Tracker</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Consistency builds character. Monitor your streaks daily!</p>
              </div>
              <button
                onClick={() => { resetForm(); setIsAddOpen(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2BB5FF] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-sm transition-all"
              >
                <MdAdd className="text-lg" />
                Add Habit
              </button>
            </div>

            {/* Add Habit Modal */}
            {isAddOpen && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-md relative transition-colors max-w-xl">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <MdClose className="text-lg" />
                </button>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Create New Habit</h3>
                <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Habit name (e.g. Read 10 Pages, Drink 3L Water)"
                      className="input-box border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-lg w-full outline-none bg-transparent text-slate-800 dark:text-slate-100"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Description/Why this is important (optional)"
                      className="input-box border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-lg w-full outline-none bg-transparent text-slate-800 dark:text-slate-100"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Theme Color</label>
                    <div className="flex gap-2">
                      {colorsList.map((col) => (
                        <button
                          key={col}
                          type="button"
                          className="w-8 h-8 rounded-full border-2 transition-all"
                          style={{
                            backgroundColor: col,
                            borderColor: color === col ? "#fff" : "transparent",
                            boxShadow: color === col ? "0 0 0 2px " + col : "none"
                          }}
                          onClick={() => setColor(col)}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm cursor-pointer shadow transition-all"
                  >
                    Save Habit
                  </button>
                </form>
              </div>
            )}

            {/* Edit Habit Modal */}
            {isEditOpen && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-md relative transition-colors max-w-xl">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <MdClose className="text-lg" />
                </button>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Edit Habit</h3>
                <form onSubmit={handleEditHabit} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Habit name"
                      className="input-box border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-lg w-full outline-none bg-transparent text-slate-800 dark:text-slate-100"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Description/Why this is important"
                      className="input-box border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-lg w-full outline-none bg-transparent text-slate-800 dark:text-slate-100"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Theme Color</label>
                    <div className="flex gap-2">
                      {colorsList.map((col) => (
                        <button
                          key={col}
                          type="button"
                          className="w-8 h-8 rounded-full border-2 transition-all"
                          style={{
                            backgroundColor: col,
                            borderColor: color === col ? "#fff" : "transparent",
                            boxShadow: color === col ? "0 0 0 2px " + col : "none"
                          }}
                          onClick={() => setColor(col)}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm cursor-pointer shadow transition-all"
                  >
                    Update Habit
                  </button>
                </form>
              </div>
            )}

            {/* Habits Grid list */}
            {habits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {habits.map((habit) => (
                  <div
                    key={habit._id}
                    className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    style={{ borderTop: `4px solid ${habit.color}` }}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{habit.title}</h3>
                          {habit.description && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{habit.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(habit)}
                            className="p-1 text-slate-400 hover:text-blue-500 transition-colors rounded"
                            title="Edit"
                          >
                            <MdModeEditOutline className="text-base" />
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(habit._id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded"
                            title="Delete"
                          >
                            <MdDelete className="text-base" />
                          </button>
                        </div>
                      </div>

                      {/* Streak Status */}
                      <div className="flex items-center gap-1.5 text-orange-500 font-extrabold text-sm mb-4">
                        <MdLocalFireDepartment className="text-lg animate-pulse" />
                        <span>{habit.streak} Day Streak</span>
                      </div>
                    </div>

                    {/* Progress Checklist Grid (last 15 days) */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Last 15 Days Progress</div>
                      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-2">
                        {lastDays.map((day) => {
                          const isCompleted = habit.completedDates.includes(day.dateStr);
                          return (
                            <button
                              key={day.dateStr}
                              onClick={() => toggleDate(habit._id, day.dateStr)}
                              className={`w-10 h-12 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer select-none group relative ${
                                isCompleted
                                  ? "text-white border-transparent"
                                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                              style={{
                                backgroundColor: isCompleted ? habit.color : "transparent"
                              }}
                              title={day.dateStr}
                            >
                              <span className={`text-[8px] uppercase font-bold tracking-tight opacity-70 group-hover:opacity-100 ${isCompleted ? 'text-white/80' : 'text-slate-400'}`}>{day.dayName}</span>
                              <span className="text-xs font-bold leading-none mt-0.5">{day.dayNum}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 italic">
                You haven't added any habits yet. Start tracking a new habit to build consistency!
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default HabitsPage;
