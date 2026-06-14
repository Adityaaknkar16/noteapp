import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import FlowerDecor from "../../components/FlowerDecor/FlowerDecor";
import Tilt3D from "../../components/Tilt3D/Tilt3D";
import { 
  MdOutlineDashboard, 
  MdOutlineStickyNote2, 
  MdCheckCircle, 
  MdBook, 
  MdLocalFireDepartment, 
  MdSchool,
  MdOutlineAccessTime,
  MdOutlineLocationOn,
  MdArrowForward,
  MdTrendingUp,
  MdTrendingDown
} from "react-icons/md";

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

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
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
    } catch (error) {
      console.error("Error fetching academic dashboard data:", error);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/15 to-teal-500/5 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/5 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[30%] left-[20%] w-[350px] h-[350px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <FlowerDecor position="bottom-right" size="lg" opacity={0.7} />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1">
        {/* Left Sidebar Layout */}
        <aside className="w-64 border-r border-slate-200/60 dark:border-slate-850 bg-white/60 dark:bg-slate-900/20 backdrop-blur-xl p-6 flex flex-col gap-6 shrink-0 max-md:hidden transition-colors">
          <div>
            <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Workspace</h5>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/15 dark:to-indigo-500/15 text-blue-600 dark:text-blue-400 w-full text-left transition-all border border-blue-500/20 shadow-sm"
              >
                <MdOutlineDashboard className="text-lg text-blue-500" />
                Dashboard
              </button>
              <button
                onClick={() => navigate("/notes")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-[1.02] w-full text-left transition-all"
              >
                <MdOutlineStickyNote2 className="text-lg text-emerald-500/70 dark:text-emerald-400/80" />
                Notes Grid
              </button>
              <button
                onClick={() => navigate("/tasks")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-[1.02] w-full text-left transition-all"
              >
                <MdCheckCircle className="text-lg text-violet-500/70 dark:text-violet-400/80" />
                My Tasks
              </button>
              <button
                onClick={() => navigate("/diary")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-[1.02] w-full text-left transition-all"
              >
                <MdBook className="text-lg text-pink-500/70 dark:text-pink-400/80" />
                Daily Diary
              </button>
              <button
                onClick={() => navigate("/habits")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-[1.02] w-full text-left transition-all"
              >
                <MdLocalFireDepartment className="text-lg text-orange-500/70 dark:text-orange-400/80" />
                Habit Tracker
              </button>
              <button
                onClick={() => navigate("/calendar")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-[1.02] w-full text-left transition-all"
              >
                <MdOutlineDashboard className="text-lg text-blue-500/70 dark:text-blue-400/80" />
                Calendar
              </button>
              <button
                onClick={() => navigate("/subjects")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-[1.02] w-full text-left transition-all"
              >
                <MdSchool className="text-lg text-slate-450" />
                Subjects
              </button>
            </div>
          </div>
        </aside>

        {/* Dashboard Academic Grid */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Greeting Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  <span className="gradient-text-blue">Overview</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal text-xl ml-3">{getFormattedDate()}</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">Welcome back, {userInfo?.username || "Guest"}! Let's check your studies.</p>
              </div>
              <span className="text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 px-5 py-2 rounded-full shadow-lg shadow-purple-500/20 border border-white/20 dark:border-white/10 uppercase tracking-wider scale-95 hover:scale-100 transition-all cursor-default">
                School term active
              </span>
            </div>

            {/* Main Double Column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: Timeline Class Schedule (5 Cols) */}
              <div className="lg:col-span-5 glass-card p-6 shadow-sm flex flex-col justify-between min-h-[500px] glow-blue">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Class Schedule (Today)</h3>
                    <button onClick={() => navigate("/calendar")} className="text-xs text-blue-500 font-bold hover:underline cursor-pointer">View Calendar</button>
                  </div>

                  {todayEvents.length > 0 ? (
                    <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-6 flex flex-col gap-6">
                      {todayEvents.map((ev, idx) => {
                        const subColor = ev.subjectId?.color || "#3B82F6";
                        return (
                          <div key={ev._id} className="relative group">
                            {/* Bullet Node */}
                            <span 
                              className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-900"
                              style={{ borderColor: subColor }}
                            />
                            
                            <div className="p-3.5 rounded-xl border bg-slate-50/50 dark:bg-slate-950/20 transition-all hover:shadow-sm" style={{ borderColor: `${subColor}25` }}>
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <MdOutlineAccessTime /> {ev.startTime} - {ev.endTime}
                              </span>
                              <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 mt-1">{ev.title}</h4>
                              
                              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-450">
                                {ev.location && <span className="flex items-center gap-0.5"><MdOutlineLocationOn /> {ev.location}</span>}
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
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-8 text-center">No classes scheduled for today.</p>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200/40 dark:border-slate-800 flex justify-center">
                  <button 
                    onClick={() => navigate("/calendar")}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    Go to Planner Calendar <MdArrowForward />
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Grid of Subjects, Grades, Countdown (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Subjects Mini-Grid (Matches Image 1 Dashboard widgets) */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Core Course Subjects</h3>
                    <button onClick={() => navigate("/subjects")} className="text-xs text-blue-500 font-bold hover:underline cursor-pointer">View All</button>
                  </div>

                  {subjects.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {subjects.slice(0, 5).map((sub) => (
                        <Tilt3D key={sub._id} className="flex">
                          <div 
                            onClick={() => navigate("/subjects")}
                            className="bg-white/80 dark:bg-slate-900/30 backdrop-blur-md border border-white/40 dark:border-slate-800 p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all flex flex-col justify-between min-h-[100px] w-full"
                            style={{ 
                              borderTop: `4px solid ${sub.color}`,
                              boxShadow: `0 10px 20px -10px ${sub.color}50`
                            }}
                          >
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">{sub.name}</h4>
                              <span className={`flex items-center gap-0.5 text-[9px] font-bold mt-1 ${sub.performance >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {sub.performance >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                                {sub.performance >= 0 ? "+" : ""}{sub.performance}% performance
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Avg Grade</span>
                              <span className="text-xs font-extrabold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: sub.color }}>
                                {sub.grades.length > 0 ? (sub.grades.reduce((a,b)=>a+b,0)/sub.grades.length).toFixed(2) : "N/A"}
                              </span>
                            </div>
                          </div>
                        </Tilt3D>
                      ))}

                      {/* Sparkle card showing +x subjects */}
                      {subjects.length > 5 && (
                        <Tilt3D className="flex">
                          <div 
                            onClick={() => navigate("/subjects")}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-2xl cursor-pointer hover:shadow-lg flex flex-col justify-center items-center text-center w-full"
                          >
                            <h4 className="text-base font-black">+{subjects.length - 5} subjects</h4>
                            <p className="text-[10px] opacity-70 mt-1">Manage performance</p>
                          </div>
                        </Tilt3D>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => navigate("/subjects")}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-800/80 p-8 rounded-2xl text-center text-xs text-slate-450 hover:border-blue-500 cursor-pointer"
                    >
                      No subjects configured. Click here to set up your subjects!
                    </div>
                  )}
                </div>

                {/* Exam Countdown & Grades Ledger Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Countdown Card */}
                  <Tilt3D className="flex flex-col">
                    <div className="glass-card p-5 shadow-sm flex flex-col justify-between h-full w-full glow-purple">
                      <div>
                        <span className="text-[9px] font-bold text-purple-500 uppercase tracking-widest block">Exam Countdown</span>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">Midterm Finals</h4>
                        <p className="text-xs text-red-500 font-bold mt-1.5">Only 14 days remaining!</p>
                      </div>

                      <div className="mt-4">
                        {/* Bar indicator */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full animate-pulse" style={{ width: "35%" }}></div>
                        </div>
                      </div>
                    </div>
                  </Tilt3D>

                  {/* Grades ledger widget */}
                  <Tilt3D className="flex flex-col">
                    <div className="glass-card p-5 shadow-sm h-full w-full glow-emerald">
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block mb-3">Recent Grades ledger</span>
                      
                      {allGrades.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                          {allGrades.slice(-10).map((item, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white shadow-sm hover:scale-115 transition-all cursor-default"
                              style={{ backgroundColor: item.color }}
                            >
                              {item.val.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-450 italic mt-2">No grade records found.</p>
                      )}
                    </div>
                  </Tilt3D>
                </div>

                {/* Quick notes previews */}
                <div className="glass-card p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-extrabold text-slate-450 dark:text-slate-400 uppercase tracking-widest">Quick Notes</h3>
                    <button onClick={() => navigate("/notes")} className="text-xs text-blue-500 font-bold hover:underline cursor-pointer">View notes</button>
                  </div>

                  {recentNotes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {recentNotes.map((note) => (
                        <Tilt3D key={note._id} className="flex">
                          <div 
                            onClick={() => navigate("/notes")}
                            className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 cursor-pointer hover:shadow-sm w-full"
                            style={{ borderLeft: `4px solid ${note.color && note.color !== '#ffffff' ? note.color : '#3B82F6'}` }}
                          >
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{note.title}</h5>
                            <p className="text-[10px] text-slate-450 mt-1 line-clamp-2 leading-relaxed">{note.content}</p>
                          </div>
                        </Tilt3D>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-450 italic">No notes found.</p>
                  )}
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
