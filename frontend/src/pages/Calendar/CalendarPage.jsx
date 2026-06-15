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
  LuCalendar,
  LuMapPin,
  LuUser,
  LuSquareCheck,
  LuFlame,
  LuCake,
  LuHeart,
  LuSparkles,
  LuInfo
} from "react-icons/lu";
import moment from "moment";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

function CalendarPage() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);

  const [events, setEvents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  
  // Important Dates states
  const [importantDates, setImportantDates] = useState([]);
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [newDateTitle, setNewDateTitle] = useState("");
  const [newDateValue, setNewDateValue] = useState("");
  const [newDateType, setNewDateType] = useState("birthday");
  const [newDateRecurring, setNewDateRecurring] = useState(true);
  const [newDateNotes, setNewDateNotes] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState("month"); // 'month', 'week', 'day', 'agenda'
  const [currentDate, setCurrentDate] = useState(moment());

  // Form states for class events
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [instructor, setInstructor] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchCalendarData();
    }
  }, [currentUser]);

  const fetchCalendarData = async () => {
    try {
      const subRes = await axios.get("/api/academic/subjects/all", { withCredentials: true });
      if (subRes.data.success) {
        setSubjects(subRes.data.subjects || []);
      }
      
      const evRes = await axios.get("/api/academic/events/all", { withCredentials: true });
      if (evRes.data.success) {
        setEvents(evRes.data.events || []);
      }

      const tasksRes = await axios.get("/api/task/all", { withCredentials: true });
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.tasks || []);
      }

      const habitsRes = await axios.get("/api/habit/all", { withCredentials: true });
      if (habitsRes.data.success) {
        setHabits(habitsRes.data.habits || []);
      }

      // Fetch Important Dates
      const datesRes = await axios.get("/api/important-date/all", { withCredentials: true });
      if (datesRes.data.success) {
        setImportantDates(datesRes.data.importantDates || []);
      }

      const upcomingRes = await axios.get("/api/important-date/upcoming", { withCredentials: true });
      if (upcomingRes.data.success) {
        setUpcomingDates(upcomingRes.data.importantDates || []);
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title) { alert.show("Event title is required", "error"); return; }
    if (startTime >= endTime) { alert.show("End time must be after start time", "error"); return; }

    try {
      const res = await axios.post("/api/academic/events/add", {
        title,
        subjectId: subjectId || null,
        dayOfWeek,
        startTime,
        endTime,
        location,
        instructor
      }, { withCredentials: true });

      if (res.data.success) {
        alert.show("Class event created!", "success");
        setTitle(""); setSubjectId(""); setLocation(""); setInstructor("");
        setIsAddOpen(false); fetchCalendarData();
      }
    } catch (error) {
      alert.show("Failed to create event", "error");
    }
  };

  const handleDeleteEvent = async (eventId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this scheduled class?")) return;

    try {
      const res = await axios.delete(`/api/academic/events/delete/${eventId}`, { withCredentials: true });
      if (res.data.success) { alert.show("Event deleted", "success"); fetchCalendarData(); }
    } catch (error) {
      alert.show("Failed to delete event", "error");
    }
  };

  const handleCreateImportantDate = async (e) => {
    e.preventDefault();
    if (!newDateTitle || !newDateValue) {
      alert.show("Title and date are required", "error");
      return;
    }

    try {
      const res = await axios.post("/api/important-date/add", {
        title: newDateTitle,
        date: newDateValue,
        type: newDateType,
        isYearlyRecurring: newDateRecurring,
        notes: newDateNotes
      }, { withCredentials: true });

      if (res.data.success) {
        alert.show("Important date added!", "success");
        setNewDateTitle("");
        setNewDateValue("");
        setNewDateNotes("");
        setIsAddingDate(false);
        fetchCalendarData();
      }
    } catch (error) {
      alert.show("Failed to save important date", "error");
    }
  };

  const handleDeleteImportantDate = async (dateId) => {
    if (!window.confirm("Delete this important date?")) return;

    try {
      const res = await axios.delete(`/api/important-date/delete/${dateId}`, { withCredentials: true });
      if (res.data.success) {
        alert.show("Important date deleted", "success");
        fetchCalendarData();
      }
    } catch (error) {
      alert.show("Failed to delete date", "error");
    }
  };

  // Helper: map a dateStr to items scheduled on that date
  const getItemsForDate = (dateStr) => {
    const items = [];
    const targetMoment = moment(dateStr);
    const dayName = targetMoment.format("dddd"); 

    // 1. Class Events (Recurring by day of week)
    events.forEach(ev => {
      if (ev.dayOfWeek === dayName) {
        items.push({
          type: "event",
          id: ev._id,
          title: ev.title,
          time: `${ev.startTime} - ${ev.endTime}`,
          color: ev.subjectId?.color || "var(--accent-blue)",
          subInfo: ev.location ? `Room: ${ev.location}` : "",
          raw: ev
        });
      }
    });

    // 2. Tasks due today
    tasks.forEach(task => {
      if (task.dueDate && moment(task.dueDate).format("YYYY-MM-DD") === dateStr) {
        items.push({
          type: "task",
          id: task._id,
          title: task.title,
          time: "Task Due",
          color: "var(--accent-rust)",
          subInfo: `Priority: ${task.priority}`,
          completed: task.completed
        });
      }
    });

    // 3. Habit logs completed today
    habits.forEach(habit => {
      if (habit.completedDates.includes(dateStr)) {
        items.push({
          type: "habit",
          id: habit._id,
          title: habit.title,
          time: "Habit Checked",
          color: "var(--accent-sage)",
          subInfo: "Checked"
        });
      }
    });

    // 4. Important dates matching MM-DD or YYYY-MM-DD
    importantDates.forEach(item => {
      const dateParts = item.date.split("-");
      let itemMD;
      if (dateParts.length === 2) {
        itemMD = item.date;
      } else {
        itemMD = `${dateParts[1]}-${dateParts[2]}`; // YYYY-MM-DD -> MM-DD
      }

      const targetMD = targetMoment.format("MM-DD");
      const isMatch = item.isYearlyRecurring 
        ? itemMD === targetMD
        : item.date === dateStr;

      if (isMatch) {
        let emoji = "📅";
        let color = "var(--accent-ochre)";
        if (item.type === "birthday") { emoji = "🎂"; color = "var(--accent-rust)"; }
        else if (item.type === "anniversary") { emoji = "💖"; color = "var(--accent-red)"; }
        else if (item.type === "festival") { emoji = "✨"; color = "var(--accent-sage)"; }

        items.push({
          type: "importantDate",
          id: item._id,
          title: `${emoji} ${item.title}`,
          time: "Important Date",
          color: color,
          subInfo: item.notes || item.type,
        });
      }
    });

    return items;
  };

  // Generate Month View calendar days
  const getMonthDays = () => {
    const start = currentDate.clone().startOf('month').startOf('week');
    const end = currentDate.clone().endOf('month').endOf('week');
    const days = [];
    let day = start.clone();

    while (day.isBefore(end)) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    return days;
  };

  // Generate Week View calendar days
  const getWeekDays = () => {
    const start = currentDate.clone().startOf('week');
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(start.clone().add(i, 'days'));
    }
    return days;
  };

  return (
    <div className="h-screen bg-bg flex flex-col text-ink transition-colors duration-300 relative overflow-hidden">
      <PageDecor variant="calendar" />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1 overflow-hidden">
        <Sidebar />

        {/* Calendar Main Grid Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 sm:pb-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">Calendar Planner</h1>
                <p className="text-xs text-ink-muted mt-1 font-medium">Coordinate your timetable, task deadlines, habit logs, and important family dates.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Selector */}
                <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border">
                  {["month", "week", "day", "agenda"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                        viewMode === mode ? "bg-accent-rust text-white" : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent-rust text-white rounded-lg text-xs font-bold cursor-pointer hover:brightness-110 shadow-sm"
                >
                  <LuPlus className="text-sm" /> Add Class
                </button>
              </div>
            </div>

            {/* Date Navigation Bar */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDate(prev => prev.clone().subtract(1, viewMode === 'month' ? 'month' : (viewMode === 'week' ? 'week' : 'day')))}
                  className="px-3 py-1 bg-surface border border-border rounded text-xs font-bold hover:bg-bg cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={() => setCurrentDate(moment())}
                  className="px-3 py-1 bg-surface border border-border rounded text-xs font-bold hover:bg-bg cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(prev => prev.clone().add(1, viewMode === 'month' ? 'month' : (viewMode === 'week' ? 'week' : 'day')))}
                  className="px-3 py-1 bg-surface border border-border rounded text-xs font-bold hover:bg-bg cursor-pointer"
                >
                  Next
                </button>
              </div>
              <h2 className="text-lg font-display font-bold">
                {viewMode === "day" ? currentDate.format("dddd, Do MMMM YYYY") : currentDate.format("MMMM YYYY")}
              </h2>
            </div>

            {/* Create Event Modal */}
            {isAddOpen && (
              <div className="bg-surface border border-border rounded-lg p-6 mb-6 shadow-md relative transition-colors max-w-2xl text-ink">
                <button onClick={() => setIsAddOpen(false)} className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer">
                  <LuX className="text-lg" />
                </button>
                <h3 className="font-display font-bold text-ink text-sm mb-4">Schedule Class Event</h3>
                <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Class Title (e.g. Algebra I, Physics Lab)"
                      className="input-box"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1">Subject Association</label>
                    <select
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-ink outline-none"
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                    >
                      <option value="">None / Custom</option>
                      {subjects.map((sub) => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1">Day of Week</label>
                    <select
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-ink outline-none"
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1">Start Time</label>
                    <input
                      type="time"
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-ink outline-none"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1">End Time</label>
                    <input
                      type="time"
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-ink outline-none"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Room / Location (e.g. Room 301)"
                      className="input-box"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Instructor Name (e.g. Dr. Stolz)"
                      className="input-box"
                      value={instructor}
                      onChange={(e) => setInstructor(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <button type="submit" className="btn-primary w-full cursor-pointer">
                      Add Class Session
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Layout Grid: Left column (Calendar) + Right column (Important Dates sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Interactive Calendar Views */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* MONTH VIEW */}
                {viewMode === "month" && (
                  <div className="bg-surface border border-border rounded-lg p-4 shadow-sm overflow-x-auto">
                    <div className="min-w-[640px] grid grid-cols-7 gap-2">
                      {DAYS.map(day => (
                        <div key={day} className="text-center font-mono font-bold text-xs text-ink-muted py-2 border-b border-border">
                          {day.slice(0, 3)}
                        </div>
                      ))}
                      {getMonthDays().map((day, idx) => {
                        const dateStr = day.format("YYYY-MM-DD");
                        const items = getItemsForDate(dateStr);
                        const isCurrentMonth = day.month() === currentDate.month();
                        return (
                          <div key={idx} className={`min-h-[90px] border border-border rounded p-1.5 flex flex-col justify-between ${isCurrentMonth ? 'bg-surface' : 'bg-bg opacity-40'}`}>
                            <span className="text-[10px] font-mono font-bold text-ink-muted">{day.date()}</span>
                            <div className="flex flex-col gap-1 mt-1 flex-1 overflow-y-auto max-h-[70px] scrollbar-none">
                              {items.map((item, i) => (
                                <div key={i} className="text-[9px] font-bold p-1 rounded border leading-none truncate" style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30`, color: item.color }}>
                                  {item.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* WEEK VIEW */}
                {viewMode === "week" && (
                  <div className="bg-surface border border-border rounded-lg p-4 sm:p-6 shadow-sm overflow-x-auto">
                    <div className="min-w-[800px] grid grid-cols-7 gap-4">
                      {getWeekDays().map((day) => {
                        const dateStr = day.format("YYYY-MM-DD");
                        const items = getItemsForDate(dateStr);
                        const isToday = day.isSame(moment(), 'day');
                        return (
                          <div key={dateStr} className={`flex-1 min-h-[400px] rounded-lg p-3 border flex flex-col gap-3 ${isToday ? 'border-accent-rust bg-accent-rust/5' : 'border-border bg-surface'}`}>
                            <div className="text-center border-b border-border pb-2">
                              <span className="text-xs font-mono font-bold uppercase tracking-wider block text-ink-muted">{day.format("ddd")}</span>
                              <span className={`text-sm font-bold ${isToday ? 'text-accent-rust font-black' : 'text-ink'}`}>{day.date()}</span>
                            </div>
                            <div className="flex flex-col gap-2.5 flex-grow overflow-y-auto max-h-[350px] scrollbar-none">
                              {items.map((item, idx) => (
                                <div key={idx} className="p-2.5 rounded border text-xs flex flex-col justify-between relative group" style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}25`, borderLeft: `3px solid ${item.color}` }}>
                                  <div>
                                    <span className="text-[9px] font-mono text-ink-muted">{item.time}</span>
                                    <h4 className={`font-bold mt-0.5 ${item.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>{item.title}</h4>
                                    {item.subInfo && <p className="text-[9px] text-ink-muted mt-1">{item.subInfo}</p>}
                                  </div>
                                  {item.type === 'event' && (
                                    <button
                                      onClick={(e) => handleDeleteEvent(item.id, e)}
                                      className="absolute top-1 right-1 text-ink-muted hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                      title="Delete Class"
                                    >
                                      <LuX className="text-[10px]" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* DAY VIEW */}
                {viewMode === "day" && (
                  <div className="paper-card p-4 sm:p-6 border border-border w-full">
                    <div className="flex flex-col gap-4">
                      {getItemsForDate(currentDate.format("YYYY-MM-DD")).length > 0 ? (
                        getItemsForDate(currentDate.format("YYYY-MM-DD")).map((item, idx) => (
                          <div key={idx} className="p-4 rounded-lg border flex justify-between items-center" style={{ backgroundColor: `${item.color}10`, borderColor: `${item.color}20`, borderLeft: `4px solid ${item.color}` }}>
                            <div>
                              <span className="text-[10px] font-mono text-ink-muted font-bold uppercase tracking-widest">{item.time}</span>
                              <h3 className={`font-display font-bold text-base mt-1 ${item.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>{item.title}</h3>
                              {item.subInfo && <p className="text-xs text-ink-muted mt-0.5">{item.subInfo}</p>}
                            </div>
                            {item.type === 'event' && (
                              <button onClick={(e) => handleDeleteEvent(item.id, e)} className="p-2 text-ink-muted hover:text-accent-red hover:bg-bg rounded transition-all cursor-pointer">
                                <LuTrash2 />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-ink-muted italic text-center py-12">Nothing scheduled for today!</p>
                      )}
                    </div>
                  </div>
                )}

                {/* AGENDA VIEW */}
                {viewMode === "agenda" && (
                  <div className="paper-card p-4 sm:p-6 border border-border w-full">
                    <div className="flex flex-col gap-6">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const day = moment().add(i, 'days');
                        const dateStr = day.format("YYYY-MM-DD");
                        const items = getItemsForDate(dateStr);
                        return (
                          <div key={dateStr} className="border-b border-border pb-4 last:border-b-0">
                            <h3 className="text-xs font-mono font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center justify-between">
                              <span>{day.format("dddd, Do MMM YYYY")}</span>
                              {day.isSame(moment(), 'day') && <span className="text-[9px] font-mono bg-accent-rust text-white px-2 py-0.5 rounded uppercase font-bold">Today</span>}
                            </h3>
                            {items.length > 0 ? (
                              <div className="flex flex-col gap-2 pl-2">
                                {items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-surface border border-border" style={{ borderLeft: `3px solid ${item.color}` }}>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-mono text-ink-muted font-bold min-w-[70px]">{item.time}</span>
                                      <span className={`font-semibold ${item.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>{item.title}</span>
                                    </div>
                                    <span className="text-[10px] text-ink-muted font-mono">{item.subInfo}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-ink-muted italic pl-2">No planned items.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Important Dates Panel */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Form Trigger / Add Panel */}
                <div className="paper-card p-4 sm:p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block">
                      Important Family Dates
                    </span>
                    {!isAddingDate && (
                      <button 
                        onClick={() => setIsAddingDate(true)}
                        className="p-1 rounded bg-accent-rust/10 border border-accent-rust/20 text-accent-rust hover:bg-accent-rust hover:text-white transition-all text-[10px] font-bold px-2 py-0.5 cursor-pointer inline-flex items-center gap-1"
                      >
                        <LuPlus /> Add Date
                      </button>
                    )}
                  </div>

                  {isAddingDate ? (
                    <form onSubmit={handleCreateImportantDate} className="space-y-3 pt-2 border-t border-border/40">
                      <div>
                        <label className="text-[9px] font-bold text-ink-muted uppercase tracking-wider block mb-0.5">Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Dad's Birthday, Anniversary"
                          value={newDateTitle}
                          onChange={(e) => setNewDateTitle(e.target.value)}
                          className="w-full bg-surface border border-border text-ink rounded px-2.5 py-1.5 text-xs outline-none focus:border-accent-rust"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-ink-muted uppercase tracking-wider block mb-0.5">Date</label>
                          <input
                            type="text"
                            placeholder="MM-DD or YYYY-MM-DD"
                            value={newDateValue}
                            onChange={(e) => setNewDateValue(e.target.value)}
                            className="w-full bg-surface border border-border text-ink rounded px-2.5 py-1.5 text-xs outline-none focus:border-accent-rust"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-ink-muted uppercase tracking-wider block mb-0.5">Type</label>
                          <select
                            value={newDateType}
                            onChange={(e) => setNewDateType(e.target.value)}
                            className="w-full bg-surface border border-border text-ink rounded px-2.5 py-1.5 text-xs outline-none focus:border-accent-rust"
                          >
                            <option value="birthday">🎂 Birthday</option>
                            <option value="anniversary">💖 Anniversary</option>
                            <option value="festival">✨ Festival</option>
                            <option value="other">📅 Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 py-1">
                        <input
                          type="checkbox"
                          id="newDateRecurring"
                          checked={newDateRecurring}
                          onChange={(e) => setNewDateRecurring(e.target.checked)}
                          className="accent-accent-rust"
                        />
                        <label htmlFor="newDateRecurring" className="text-[10px] font-bold text-ink cursor-pointer">
                          Yearly Recurring event
                        </label>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-ink-muted uppercase tracking-wider block mb-0.5">Notes</label>
                        <input
                          type="text"
                          placeholder="Add special notes..."
                          value={newDateNotes}
                          onChange={(e) => setNewDateNotes(e.target.value)}
                          className="w-full bg-surface border border-border text-ink rounded px-2.5 py-1.5 text-xs outline-none focus:border-accent-rust"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1.5">
                        <button
                          type="button"
                          onClick={() => setIsAddingDate(false)}
                          className="w-full py-1.5 bg-bg border border-border text-ink rounded text-xs font-semibold hover:bg-surface/50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-accent-rust text-white rounded text-xs font-bold hover:brightness-115 cursor-pointer"
                        >
                          Save Date
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-[10px] text-ink-muted italic">Track birthdays, holidays, and custom family events directly on the calendar grid.</p>
                  )}
                </div>

                {/* Upcoming list (next 30 days) */}
                <div className="paper-card p-4 sm:p-5 shadow-sm flex-1">
                  <span className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block mb-4 border-b border-border pb-2">
                    Upcoming (Next 30 Days)
                  </span>

                  {upcomingDates.length === 0 ? (
                    <p className="text-xs text-ink-muted italic">No birthdays or anniversaries in the next 30 days.</p>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {upcomingDates.map((item) => {
                        let badgeColor = "bg-accent-ochre/15 text-accent-ochre border border-accent-ochre/20";
                        let emoji = "📅";
                        if (item.type === "birthday") { badgeColor = "bg-accent-rust/15 text-accent-rust border border-accent-rust/20"; emoji = "🎂"; }
                        else if (item.type === "anniversary") { badgeColor = "bg-accent-red/15 text-accent-red border border-accent-red/20"; emoji = "💖"; }
                        else if (item.type === "festival") { badgeColor = "bg-accent-sage/15 text-accent-sage border border-accent-sage/20"; emoji = "✨"; }

                        return (
                          <div 
                            key={item._id} 
                            className="p-3 bg-surface border border-border rounded-lg flex items-start justify-between group"
                          >
                            <div>
                              <h4 className="text-xs font-bold text-ink flex items-center gap-1">
                                <span>{emoji}</span> {item.title}
                              </h4>
                              <p className="text-[9px] text-ink-muted mt-0.5">
                                Date: {moment(item.upcomingDate).format("MMM Do")} ({item.daysRemaining === 0 ? "Today!" : `${item.daysRemaining} days left`})
                              </p>
                              {item.notes && (
                                <p className="text-[9px] text-ink-muted italic mt-1 bg-bg px-2 py-0.5 rounded border border-border/50 inline-block">
                                  {item.notes}
                                </p>
                              )}
                            </div>

                            <button 
                              onClick={() => handleDeleteImportantDate(item._id)}
                              className="text-ink-muted hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Delete date"
                            >
                              <LuTrash2 className="text-[10px]" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}

export default CalendarPage;
