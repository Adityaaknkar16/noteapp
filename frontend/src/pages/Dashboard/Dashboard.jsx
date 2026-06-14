import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import BottomBar from "../../components/BottomBar/BottomBar";
import PageDecor from "../../components/Doodles/PageDecor";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  LuLayoutDashboard,
  LuPlus,
  LuCalendar,
  LuSquareCheck,
  LuFlame,
  LuTrendingUp,
  LuTrendingDown,
  LuClock,
  LuMapPin,
  LuGraduationCap,
  LuCircleAlert,
  LuBookOpen
} from "react-icons/lu";
import moment from "moment";
import Modal from "react-modal";
import { LuX } from "react-icons/lu";

function Dashboard() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);
  
  const [subjects, setSubjects] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [stats, setStats] = useState({
    noteCount: 0,
    taskCount: 0,
    completedTaskCount: 0,
    diaryCount: 0,
  });

  const [recentNotes, setRecentNotes] = useState([]);
  
  // New local states for agenda timeline & trend chart
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [quickAddText, setQuickAddText] = useState("");
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Monthly/Yearly Recap States
  const [recapModalOpen, setRecapModalOpen] = useState(false);
  const [recapType, setRecapType] = useState("monthly");
  const [recapData, setRecapData] = useState(null);
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapMonth, setRecapMonth] = useState(moment().format("YYYY-MM"));

  const fetchMonthlyRecap = async (targetMonth = recapMonth) => {
    setRecapLoading(true);
    setRecapType("monthly");
    try {
      const res = await axios.get(`http://localhost:3000/api/diary/recap?month=${targetMonth}`, { withCredentials: true });
      if (res.data.success) {
        setRecapData(res.data.recap);
        setRecapModalOpen(true);
      }
    } catch (err) {
      alert.show("Failed to load monthly recap", "error");
    } finally {
      setRecapLoading(false);
    }
  };

  const fetchYearlyRecap = async () => {
    setRecapLoading(true);
    setRecapType("yearly");
    try {
      const year = moment().format("YYYY");
      const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
      const promises = months.map(m => axios.get(`http://localhost:3000/api/diary/recap?month=${m}`, { withCredentials: true }));
      const results = await Promise.all(promises);

      let totalDiaryCount = 0;
      let totalTasksCompleted = 0;
      let totalHabitCompletions = 0;
      let totalSavedAmount = 0;
      const moodCounts = {};

      results.forEach(res => {
        if (res.data.success) {
          const r = res.data.recap;
          totalDiaryCount += r.diaryCount || 0;
          totalTasksCompleted += r.completedTaskCount || 0;
          totalHabitCompletions += r.habitCompletions || 0;
          totalSavedAmount += r.totalSaved || 0;
          if (r.mostCommonMood && r.mostCommonMood !== "None") {
            moodCounts[r.mostCommonMood] = (moodCounts[r.mostCommonMood] || 0) + 1;
          }
        }
      });

      let topMood = "None";
      let maxMood = 0;
      for (const m in moodCounts) {
        if (moodCounts[m] > maxMood) {
          maxMood = moodCounts[m];
          topMood = m;
        }
      }

      setRecapData({
        diaryCount: totalDiaryCount,
        completedTaskCount: totalTasksCompleted,
        habitCompletions: totalHabitCompletions,
        totalSaved: totalSavedAmount,
        mostCommonMood: topMood
      });
      setRecapModalOpen(true);
    } catch (err) {
      alert.show("Failed to load year in review", "error");
    } finally {
      setRecapLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await axios.get("http://localhost:3000/api/diary/stats", { withCredentials: true });
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // Fetch recent notes
      const notesRes = await axios.get("http://localhost:3000/api/note/all", { withCredentials: true });
      if (notesRes.data.success) {
        setRecentNotes(notesRes.data.notes.slice(0, 3));
      }

      // Fetch subjects
      const subRes = await axios.get("http://localhost:3000/api/academic/subjects/all", { withCredentials: true });
      if (subRes.data.success) {
        setSubjects(subRes.data.subjects || []);
      }

      // Fetch scheduled events for TODAY
      const evRes = await axios.get("http://localhost:3000/api/academic/events/all", { withCredentials: true });
      if (evRes.data.success) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayName = daysOfWeek[new Date().getDay()];
        
        // Filter events for today and sort by start time
        const todayEvs = (evRes.data.events || [])
          .filter(event => event.dayOfWeek === todayName)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        setTodayEvents(todayEvs);
      }

      // Fetch all tasks
      const tasksRes = await axios.get("http://localhost:3000/api/task/all", { withCredentials: true });
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.tasks || []);
      }

      // Fetch all habits
      const habitsRes = await axios.get("http://localhost:3000/api/habit/all", { withCredentials: true });
      if (habitsRes.data.success) {
        setHabits(habitsRes.data.habits || []);
      }

      // Fetch all diary entries for the trend chart
      const diaryRes = await axios.get("http://localhost:3000/api/diary/all", { withCredentials: true });
      if (diaryRes.data.success) {
        setDiaryEntries(diaryRes.data.entries || []);
      }
    } catch (error) {
      console.error("Error fetching academic dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Compile all grades across subjects
  const allGrades = subjects.flatMap(sub => 
    (sub.grades || []).map(val => ({ val, color: sub.color }))
  );

  // Quick Add handler
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickAddText.trim()) return;
    setQuickAddLoading(true);

    const text = quickAddText.trim();
    let type = "task"; // default
    let content = text;

    if (text.startsWith("task:")) {
      type = "task";
      content = text.substring(5).trim();
    } else if (text.startsWith("note:")) {
      type = "note";
      content = text.substring(5).trim();
    } else if (text.startsWith("diary:")) {
      type = "diary";
      content = text.substring(6).trim();
    }

    try {
      if (type === "task") {
        const res = await axios.post("http://localhost:3000/api/task/add", {
          title: content,
          priority: "medium",
          dueDate: moment().format("YYYY-MM-DD")
        }, { withCredentials: true });
        if (res.data.success) {
          alert.success("Task quick-added!");
          setQuickAddText("");
          fetchDashboardData();
        }
      } else if (type === "note") {
        const res = await axios.post("http://localhost:3000/api/note/add", {
          title: "Quick Note",
          content: content,
          tags: ["quick-add"]
        }, { withCredentials: true });
        if (res.data.success) {
          alert.success("Note quick-added!");
          setQuickAddText("");
          fetchDashboardData();
        }
      } else if (type === "diary") {
        const res = await axios.post("http://localhost:3000/api/diary/add", {
          title: "Quick Log",
          content: content,
          mood: "neutral",
          date: new Date()
        }, { withCredentials: true });
        if (res.data.success) {
          alert.success("Diary log quick-added!");
          setQuickAddText("");
          fetchDashboardData();
        }
      }
    } catch (err) {
      alert.error(err.response?.data?.message || err.message || "Quick add failed");
    } finally {
      setQuickAddLoading(false);
    }
  };

  // Compile "Today" Agenda list
  const getTodayAgenda = () => {
    const agenda = [];
    const todayStr = moment().format("YYYY-MM-DD");

    // 1. Classes / Calendar Events
    todayEvents.forEach(ev => {
      agenda.push({
        time: ev.startTime,
        type: 'event',
        title: ev.title,
        subtitle: ev.location ? `Room: ${ev.location}` : 'Class Session',
        color: ev.subjectId?.color || '#5C7A99',
        badge: ev.subjectId?.name || 'Academic'
      });
    });

    // 2. Due Tasks
    tasks.forEach(task => {
      if (task.dueDate && moment(task.dueDate).format("YYYY-MM-DD") === todayStr) {
        agenda.push({
          time: 'Due Today',
          type: 'task',
          title: task.title,
          subtitle: `Priority: ${task.priority}`,
          color: task.priority === 'high' ? '#B3433A' : (task.priority === 'medium' ? '#D6A23C' : '#6F8F6B'),
          badge: 'Task',
          completed: task.completed
        });
      }
    });

    // 3. Habits Checklist
    habits.forEach(habit => {
      const isChecked = habit.completedDates.includes(todayStr);
      agenda.push({
        time: 'Habit',
        type: 'habit',
        title: habit.title,
        subtitle: isChecked ? 'Completed today' : 'Not checked today yet',
        color: habit.color || '#6F8F6B',
        badge: 'Habit',
        completed: isChecked
      });
    });

    // Sort: Classes first (by time if numeric), then tasks, then habits
    return agenda.sort((a, b) => {
      if (a.type === 'event' && b.type !== 'event') return -1;
      if (b.type === 'event' && a.type !== 'event') return 1;
      return 0;
    });
  };

  const todayAgenda = getTodayAgenda();

  // Weekly Trend Chart Data (Last 7 Days)
  const getWeeklyTrendData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const day = moment().subtract(i, 'days');
      const dayStr = day.format("YYYY-MM-DD");
      const label = day.format("ddd");

      // Count tasks completed on this day
      // Note: Since backend task model might only have completed status, let's count currently completed tasks matching this due date as a proxy, or count total due/completed
      const completedTasksCount = tasks.filter(t => t.completed && t.dueDate && moment(t.dueDate).format("YYYY-MM-DD") === dayStr).length;

      // Count diary entries on this day
      const diaryCount = diaryEntries.filter(d => moment(d.date).format("YYYY-MM-DD") === dayStr).length;

      data.push({
        name: label,
        Tasks: completedTasksCount,
        Diary: diaryCount
      });
    }
    return data;
  };

  const weeklyTrendData = getWeeklyTrendData();

  if (loading) {
    return (
      <div className="h-screen bg-bg flex flex-col text-ink transition-colors duration-300 relative overflow-hidden">
        <Navbar userInfo={userInfo} />
        <div className="flex-1 flex max-md:flex-col relative z-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Pulsing Skeleton Header */}
              <div className="h-12 w-64 bg-surface border border-border animate-pulse rounded-lg" />
              {/* Pulsing Skeleton Agenda */}
              <div className="h-28 w-full bg-surface border border-border animate-pulse rounded-lg" />
              {/* Grid Skeletons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64 bg-surface border border-border animate-pulse rounded-lg" />
                <div className="h-64 bg-surface border border-border animate-pulse rounded-lg" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg flex flex-col text-ink transition-colors duration-300 relative overflow-hidden">
      <PageDecor variant="dashboard" />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1 overflow-hidden">
        <Sidebar />

        {/* Dashboard Academic Grid */}
        <main className="flex-1 p-4 sm:p-8 pb-24 sm:pb-8 overflow-y-auto">


          <div className="max-w-6xl mx-auto">
            {/* Greeting Header */}
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight">
                  Overview
                  <span className="text-ink-muted font-mono text-xl ml-3">{getFormattedDate()}</span>
                </h1>
                <p className="text-sm text-ink-muted mt-1.5 font-medium">Welcome back, {userInfo?.username || "Guest"}! Let's check your agenda.</p>
                <div className="flex gap-2.5 mt-3">
                  <button
                    type="button"
                    onClick={() => fetchMonthlyRecap()}
                    className="px-3 py-1.5 bg-accent-rust/10 border border-accent-rust/20 text-accent-rust hover:bg-accent-rust hover:text-white transition-all text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    📊 Monthly Recap
                  </button>
                  <button
                    type="button"
                    onClick={fetchYearlyRecap}
                    className="px-3 py-1.5 bg-accent-sage/10 border border-accent-sage/20 text-accent-sage hover:bg-accent-sage hover:text-white transition-all text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    ✨ Year in Review
                  </button>
                </div>
              </div>

              {/* Quick Add Bar */}
              <form onSubmit={handleQuickAdd} className="flex gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Quick add (e.g. task: Buy milk, note: Ideas...)"
                  className="input-box min-w-[280px] text-xs bg-surface"
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  disabled={quickAddLoading}
                />
                <button type="submit" disabled={quickAddLoading} className="btn-primary flex items-center justify-center gap-1.5 whitespace-nowrap text-xs">
                  <LuPlus className="text-sm" /> Add
                </button>
              </form>
            </div>

            {/* Today Agenda Strip (Timeline Style) */}
            <div className="paper-card p-4 sm:p-6 mb-8 border border-border">
              <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest mb-4">Today's Agenda Timeline</h3>
              {todayAgenda.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {todayAgenda.map((item, idx) => (
                    <div key={idx} className="min-w-[220px] p-3 rounded-lg border border-border bg-surface flex flex-col justify-between" style={{ borderLeft: `4px solid ${item.color}` }}>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-mono text-ink-muted font-bold">{item.time}</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-bg text-ink-muted">{item.badge}</span>
                        </div>
                        <h4 className={`text-xs font-bold ${item.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>{item.title}</h4>
                      </div>
                      <p className="text-[10px] text-ink-muted mt-2 truncate">{item.subtitle}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-muted italic">Nothing scheduled for today. Take a rest or quick-add some items!</p>
              )}
            </div>

            {/* Main Double Column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: Class Schedule list & Weekly Trend Chart */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                
                {/* Recharts Weekly Trend Chart */}
                <div className="paper-card p-4 sm:p-6 border border-border">
                  <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest mb-6">Activity Trends (Last 7 Days)</h3>
                  <div className="h-[220px] w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--ink-muted)" />
                        <YAxis stroke="var(--ink-muted)" allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }} labelStyle={{ color: 'var(--ink)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Tasks" stroke="var(--accent-rust)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Diary" stroke="var(--accent-sage)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Class Schedule (Today) */}
                <div className="paper-card p-4 sm:p-6 border border-border">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest">Class Schedule (Today)</h3>
                    <button onClick={() => navigate("/calendar")} className="text-xs text-accent-rust font-bold hover:underline cursor-pointer">View Calendar</button>
                  </div>

                  {todayEvents.length > 0 ? (
                    <div className="relative border-l border-border ml-3 pl-6 flex flex-col gap-6">
                      {todayEvents.map((ev, idx) => {
                        const subColor = ev.subjectId?.color || "var(--accent-rust)";
                        return (
                          <div key={ev._id} className="relative group">
                            {/* Bullet Node */}
                            <span 
                              className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 bg-surface"
                              style={{ borderColor: subColor }}
                            />
                            
                            <div className="p-3.5 rounded-lg border bg-surface/50 transition-all hover:shadow-sm" style={{ borderColor: `${subColor}25` }}>
                              <span className="text-[10px] font-mono text-ink-muted flex items-center gap-1">
                                <LuClock /> {ev.startTime} - {ev.endTime}
                              </span>
                              <h4 className="font-bold text-xs text-ink mt-1">{ev.title}</h4>
                              
                              <div className="flex justify-between items-center mt-3 text-[10px] text-ink-muted">
                                {ev.location && <span className="flex items-center gap-0.5"><LuMapPin /> {ev.location}</span>}
                                {ev.subjectId && (
                                  <span className="font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-[8px] text-white" style={{ backgroundColor: subColor }}>
                                    {ev.subjectId.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-muted italic mt-8 text-center">No classes scheduled for today.</p>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Grid of Subjects, Grades, Countdown (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Subjects Mini-Grid */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest">Core Course Subjects</h3>
                    <button onClick={() => navigate("/subjects")} className="text-xs text-accent-rust font-bold hover:underline cursor-pointer">View All</button>
                  </div>

                  {subjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {subjects.slice(0, 4).map((sub) => (
                        <div 
                           key={sub._id}
                           onClick={() => navigate("/subjects")}
                           className="paper-card p-4 cursor-pointer hover:shadow-md transition-all flex flex-col justify-between min-h-[100px] w-full"
                           style={{ 
                            borderTop: `4px solid ${sub.color}`
                           }}
                        >
                          <div>
                            <h4 className="text-xs font-bold text-ink line-clamp-1">{sub.name}</h4>
                            <span className={`flex items-center gap-0.5 text-[9px] font-bold mt-1 ${sub.performance >= 0 ? "text-accent-sage" : "text-accent-red"}`}>
                              {sub.performance >= 0 ? <LuTrendingUp /> : <LuTrendingDown />}
                              {sub.performance >= 0 ? "+" : ""}{sub.performance}% performance
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-[9px] text-ink-muted font-bold uppercase tracking-wider">Avg Grade</span>
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: sub.color }}>
                              {sub.grades.length > 0 ? (sub.grades.reduce((a,b)=>a+b,0)/sub.grades.length).toFixed(2) : "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      onClick={() => navigate("/subjects")}
                      className="border-2 border-dashed border-border p-8 rounded-lg text-center text-xs text-ink-muted hover:border-accent-rust cursor-pointer"
                    >
                      No subjects configured. Click to set up subjects!
                    </div>
                  )}
                </div>

                {/* Exam Countdown & Grades Ledger Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Countdown Card */}
                  <div className="paper-card p-5 shadow-sm flex flex-col justify-between h-full w-full">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block">Exam Countdown</span>
                      <h4 className="text-sm font-bold text-ink mt-1">Midterm Finals</h4>
                      <p className="text-[10px] text-accent-red font-bold mt-1">14 days remaining!</p>
                    </div>

                    <div className="mt-4">
                      {/* Bar indicator */}
                      <div className="w-full bg-bg h-2 rounded-full overflow-hidden border border-border">
                        <div className="bg-accent-red h-full rounded-full" style={{ width: "35%" }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Grades ledger widget */}
                  <div className="paper-card p-5 shadow-sm h-full w-full">
                    <span className="text-[9px] font-mono font-bold text-accent-sage uppercase tracking-widest block mb-3">Recent Grades</span>
                    
                    {allGrades.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                        {allGrades.slice(-8).map((item, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm transition-all"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.val.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-ink-muted italic mt-2">No grades found.</p>
                    )}
                  </div>
                </div>

                {/* Quick notes previews */}
                <div className="paper-card p-4 sm:p-6 shadow-sm border border-border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest">Quick Notes</h3>
                    <button onClick={() => navigate("/notes")} className="text-xs text-accent-rust font-bold hover:underline cursor-pointer">View notes</button>
                  </div>

                  {recentNotes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {recentNotes.map((note) => (
                        <div 
                          key={note._id}
                          onClick={() => navigate("/notes")}
                          className="p-3 rounded-lg border border-border bg-surface cursor-pointer hover:shadow-sm w-full"
                          style={{ borderLeft: `4px solid ${note.color && note.color !== '#ffffff' ? note.color : 'var(--accent-rust)'}` }}
                        >
                          <h5 className="text-xs font-bold text-ink line-clamp-1">{note.title}</h5>
                          <p className="text-[10px] text-ink-muted mt-1 line-clamp-2 leading-relaxed">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-muted italic">No notes found.</p>
                  )}
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
      {/* Recap & Year in Review Modal */}
      <Modal
        isOpen={recapModalOpen}
        onRequestClose={() => setRecapModalOpen(false)}
        style={{
          overlay: {
            backgroundColor: "rgba(43, 37, 32, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 2000
          }
        }}
        contentLabel="Recap Summary"
        className="w-[450px] max-w-[95%] bg-surface border border-border rounded-lg mx-auto mt-24 p-6 shadow-xl text-ink relative outline-none"
      >
        <button
          onClick={() => setRecapModalOpen(false)}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer border-none bg-transparent"
        >
          <LuX className="text-lg" />
        </button>

        <h3 className="font-display font-extrabold text-lg text-ink mb-1 flex items-center gap-1.5">
          {recapType === "monthly" ? "📊 Monthly Reflection Ledger" : "✨ Year in Review Summary"}
        </h3>
        <p className="text-[10px] text-ink-muted uppercase tracking-widest font-mono mb-4">
          {recapType === "monthly" ? `Reflecting on ${moment(recapMonth, "YYYY-MM").format("MMMM YYYY")}` : "Aggregated across all 12 months"}
        </p>

        {recapLoading ? (
          <p className="text-xs text-ink-muted font-mono py-8 text-center animate-pulse">Aggregating records...</p>
        ) : recapData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="paper-card p-4 text-center">
                <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block">Logs Penned</span>
                <span className="text-2xl font-mono font-bold text-accent-rust block mt-1.5">{recapData.diaryCount}</span>
              </div>
              <div className="paper-card p-4 text-center">
                <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block">Mood Standard</span>
                <span className="text-xl font-bold text-accent-ochre block mt-2 capitalize">{recapData.mostCommonMood}</span>
              </div>
              <div className="paper-card p-4 text-center">
                <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block">Tasks Finished</span>
                <span className="text-2xl font-mono font-bold text-accent-sage block mt-1.5">{recapData.completedTaskCount}</span>
              </div>
              <div className="paper-card p-4 text-center">
                <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block">Habit Completions</span>
                <span className="text-2xl font-mono font-bold text-accent-blue block mt-1.5">{recapData.habitCompletions}</span>
              </div>
            </div>

            <div className="paper-card p-4 text-center bg-accent-sage/5 border-accent-sage/20">
              <span className="text-[10px] font-mono font-bold text-accent-sage uppercase tracking-widest block">Total Capital Saved</span>
              <span className="text-3xl font-mono font-black text-accent-sage block mt-1.5">${recapData.totalSaved.toFixed(2)}</span>
            </div>

            {recapType === "monthly" && (
              <div className="flex gap-2 items-center">
                <label className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest shrink-0">Switch Month:</label>
                <input
                  type="month"
                  value={recapMonth}
                  onChange={(e) => {
                    setRecapMonth(e.target.value);
                    fetchMonthlyRecap(e.target.value);
                  }}
                  className="text-xs px-2.5 py-1.5 bg-bg border border-border text-ink rounded-lg outline-none cursor-pointer flex-1"
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-ink-muted italic text-center py-6">No reflection data found for this period.</p>
        )}
      </Modal>
      <BottomBar />
    </div>
  );
}

export default Dashboard;
