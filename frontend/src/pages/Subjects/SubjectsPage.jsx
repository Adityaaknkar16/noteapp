import React, { useEffect, useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import PageDecor from "../../components/Doodles/PageDecor";
import BottomBar from "../../components/BottomBar/BottomBar";
import Tilt3D from "../../components/Tilt3D/Tilt3D";
import { 
  LuPlus, 
  LuX, 
  LuTrash2, 
  LuTrendingUp, 
  LuTrendingDown, 
  LuPlay, 
  LuPause, 
  LuRotateCcw,
  LuTimer,
  LuAward,
  LuGraduationCap
} from "react-icons/lu";

function SubjectsPage() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [color, setColor] = useState("var(--accent-rust)");
  const [performance, setPerformance] = useState(0);
  const [icon, setIcon] = useState("school");
  
  // Grade form state
  const [activeGradeInput, setActiveGradeInput] = useState(null); // subjectId
  const [newGrade, setNewGrade] = useState("");

  // Pomodoro Focus Timer state
  const [pomodoroSubject, setPomodoroSubject] = useState("");
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState("work"); // 'work', 'break'
  const timerRef = useRef(null);

  // Local storage for logged pomodoro sessions count
  const [pomoLogs, setPomoLogs] = useState(() => {
    return JSON.parse(localStorage.getItem("inkwell_pomodoro_logs") || "{}");
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchSubjects();
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("inkwell_pomodoro_logs", JSON.stringify(pomoLogs));
  }, [pomoLogs]);

  // Pomodoro Timer tick logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (timerMode === "work") {
      alert.success("Pomodoro session completed! Time for a break.");
      // Log session
      if (pomodoroSubject) {
        setPomoLogs((prev) => ({
          ...prev,
          [pomodoroSubject]: (prev[pomodoroSubject] || 0) + 1,
        }));
      }
      // Switch to break
      setTimerMode("break");
      setTimeLeft(300); // 5 mins break
    } else {
      alert.success("Break over! Let's get back to focus.");
      setTimerMode("work");
      setTimeLeft(1500); // 25 mins work
    }
  };

  const startPauseTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimerMode("work");
    setTimeLeft(1500);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/academic/subjects/all", { withCredentials: true });
      if (res.data.success) {
        setSubjects(res.data.subjects || []);
        // Set default Pomodoro subject if empty
        if (res.data.subjects?.length > 0 && !pomodoroSubject) {
          setPomodoroSubject(res.data.subjects[0]._id);
        }
      }
    } catch (error) {
      alert.error("Failed to fetch subjects");
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!name) { alert.error("Subject name is required"); return; }

    try {
      const res = await axios.post("http://localhost:3000/api/academic/subjects/add", {
        name,
        color,
        performance,
        icon
      }, { withCredentials: true });

      if (res.data.success) {
        alert.success("Subject added!");
        setName(""); setColor("var(--accent-rust)"); setPerformance(0); setIsAddOpen(false); fetchSubjects();
      }
    } catch (error) {
      alert.error("Failed to add subject");
    }
  };

  const handleAddGrade = async (subjectId) => {
    if (!newGrade || isNaN(newGrade)) { alert.error("Please enter a valid number"); return; }

    try {
      const res = await axios.post(`http://localhost:3000/api/academic/subjects/${subjectId}/add-grade`, {
        grade: Number(newGrade)
      }, { withCredentials: true });

      if (res.data.success) {
        alert.success("Grade added!");
        setNewGrade(""); setActiveGradeInput(null); fetchSubjects();
      }
    } catch (error) {
      alert.error("Failed to add grade");
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject? This will delete all calendar events connected to it.")) return;

    try {
      const res = await axios.delete(`http://localhost:3000/api/academic/subjects/delete/${subjectId}`, { withCredentials: true });
      if (res.data.success) { alert.success("Subject deleted"); fetchSubjects(); }
    } catch (error) {
      alert.error("Failed to delete subject");
    }
  };

  const colorsList = [
    "var(--accent-rust)",
    "var(--accent-sage)",
    "var(--accent-ochre)",
    "var(--accent-blue)",
    "var(--accent-red)",
  ];

  const getAverageGrade = (grades) => {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((a, b) => a + b, 0);
    return sum / grades.length;
  };

  // GPA Calculator logic
  const calculateGPA = () => {
    const subjectsWithGrades = subjects.filter(s => s.grades && s.grades.length > 0);
    if (subjectsWithGrades.length === 0) return "N/A";
    const sumOfAverages = subjectsWithGrades.reduce((acc, sub) => acc + getAverageGrade(sub.grades), 0);
    return (sumOfAverages / subjectsWithGrades.length).toFixed(2);
  };

  const totalGradesLogged = subjects.reduce((acc, s) => acc + (s.grades?.length || 0), 0);

  return (
    <div className="h-screen bg-bg flex flex-col text-ink transition-colors duration-300 relative overflow-hidden">
      <PageDecor variant="subjects" />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1 overflow-hidden">
        <Sidebar />

        {/* Subjects Content Area */}
        <main className="flex-1 p-4 sm:p-8 pb-24 sm:pb-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">Subjects & Grades</h1>
                <p className="text-xs text-ink-muted mt-1 font-medium">Track course performance metrics and focus sessions</p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent-rust text-white rounded-lg text-xs font-bold cursor-pointer hover:brightness-110 shadow-sm"
              >
                <LuPlus className="text-sm" /> Add Subject
              </button>
            </div>

            {/* GPA Calculator Summary Card & Pomodoro Focus Timer Panel Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
              
              {/* GPA Calculator Summary */}
              <div className="md:col-span-4 paper-card p-6 border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-accent-rust font-bold text-xs uppercase tracking-wider mb-4">
                    <LuAward className="text-lg" /> gpa summary
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-ink">{calculateGPA()}</span>
                    <span className="text-xs text-ink-muted font-bold">/ 10.00</span>
                  </div>
                  <p className="text-[10px] text-ink-muted mt-2 font-medium">Average across {subjects.filter(s => s.grades?.length > 0).length} subjects ({totalGradesLogged} entries total)</p>
                </div>
                
                <div className="border-t border-border pt-4 mt-6">
                  <span className="text-[9px] uppercase font-mono font-bold text-ink-muted tracking-wider">Academic Honors</span>
                  <div className="text-xs font-bold mt-1 text-accent-rust">
                    {calculateGPA() === "N/A" ? "No Grades Yet" : (Number(calculateGPA()) >= 9.0 ? "🏅 First Class Exemplary" : (Number(calculateGPA()) >= 7.5 ? "🥈 Second Class Honors" : "✔️ Passing Performance"))}
                  </div>
                </div>
              </div>

              {/* Pomodoro Focus Timer Panel */}
              <div className="md:col-span-8 paper-card p-6 border border-border">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-accent-sage font-bold text-xs uppercase tracking-wider">
                    <LuTimer className="text-lg" /> pomodoro study timer
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted font-bold bg-bg px-2 py-0.5 rounded border border-border">
                    {timerMode === 'work' ? "Focus Session" : "Short Break"}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
                  {/* Left: Select Subject & Controls */}
                  <div className="flex flex-col gap-3.5 w-full sm:w-auto">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-ink-muted tracking-wider">Focus Subject Connection</label>
                      <select
                        className="bg-surface text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border outline-none text-ink cursor-pointer"
                        value={pomodoroSubject}
                        onChange={(e) => setPomodoroSubject(e.target.value)}
                      >
                        <option value="">General Study Session</option>
                        {subjects.map((sub) => (
                          <option key={sub._id} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={startPauseTimer}
                        className="btn-primary flex items-center justify-center gap-1 text-xs py-1.5 px-4"
                      >
                        {isRunning ? <><LuPause /> Pause</> : <><LuPlay /> Start Focus</>}
                      </button>
                      <button
                        onClick={resetTimer}
                        className="bg-surface border border-border text-ink-muted hover:text-ink transition-all px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <LuRotateCcw /> Reset
                      </button>
                    </div>
                  </div>

                  {/* Right: Big Clock Render */}
                  <div className="flex flex-col items-center justify-center bg-bg/50 border border-border/80 px-8 py-5 rounded-xl min-w-[200px] text-center shadow-inner">
                    <span className="text-4xl font-extrabold tracking-widest font-mono text-ink leading-none">{formatTime(timeLeft)}</span>
                    {pomodoroSubject && (
                      <span className="text-[9px] font-bold text-ink-muted uppercase tracking-wider mt-2 bg-surface px-2 py-0.5 rounded border border-border">
                        📖 {pomodoroSubject} ({pomoLogs[pomodoroSubject] || 0} completed)
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Create Subject Modal inline panel */}
            {isAddOpen && (
              <div className="bg-surface border border-border rounded-lg p-5 mb-6 shadow-md relative transition-colors max-w-xl text-ink">
                <button onClick={() => setIsAddOpen(false)} className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer">
                  <LuX className="text-lg" />
                </button>
                <h3 className="font-display font-bold text-ink text-sm mb-4">Add Course Subject</h3>
                <form onSubmit={handleCreateSubject} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Subject Name (e.g. Mathematics II, Introduction to Sociology)"
                      className="input-box"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Starting performance (e.g. 85 for +85%)"
                      className="input-box"
                      value={performance}
                      onChange={(e) => setPerformance(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1.5">Color Association</label>
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
                  <button type="submit" className="btn-primary w-full">
                    Create Subject
                  </button>
                </form>
              </div>
            )}

            {/* Subjects Grid */}
            {subjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((sub) => (
                  <Tilt3D key={sub._id} className="w-full flex">
                    <div
                      className="bg-surface border border-border p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative w-full"
                      style={{ borderLeft: `5px solid ${sub.color}` }}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-base font-bold text-ink leading-snug">{sub.name}</h3>
                            <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest">
                              Avg Grade: <span className="text-ink font-bold font-mono">{getAverageGrade(sub.grades) > 0 ? getAverageGrade(sub.grades).toFixed(2) : "N/A"}</span>
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSubject(sub._id)}
                            className="text-ink-muted hover:text-accent-red p-1 cursor-pointer rounded hover:bg-bg"
                            title="Delete Subject"
                          >
                            <LuTrash2 className="text-lg" />
                          </button>
                        </div>

                        {/* Performance Indicators */}
                        <div className={`flex items-center gap-1.5 font-bold text-xs mb-4 ${
                          sub.performance >= 0 ? "text-accent-sage" : "text-accent-red"
                        }`}>
                          {sub.performance >= 0 ? <LuTrendingUp /> : <LuTrendingDown />}
                          <span>{sub.performance >= 0 ? "+" : ""}{sub.performance}% performance</span>
                        </div>

                        {/* Grades tags */}
                        <div className="mb-4">
                          <div className="text-[9px] font-mono uppercase font-bold text-ink-muted mb-2 tracking-wider">Grades Ledger</div>
                          {sub.grades.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {sub.grades.map((gr, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm font-mono"
                                  style={{ backgroundColor: sub.color }}
                                >
                                  {gr.toFixed(2)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-ink-muted italic">No grades recorded.</span>
                          )}
                        </div>
                      </div>

                      {/* Add Grade Form */}
                      <div className="mt-4 border-t border-border pt-3">
                        {activeGradeInput === sub._id ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Grade (e.g. 9.2)"
                              className="bg-bg border border-border px-3 py-1.5 text-xs rounded outline-none w-28 text-ink"
                              value={newGrade}
                              onChange={(e) => setNewGrade(e.target.value)}
                            />
                            <button
                              onClick={() => handleAddGrade(sub._id)}
                              className="px-3 py-1.5 bg-accent-rust text-white rounded text-xs font-bold cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setActiveGradeInput(null)}
                              className="px-3 py-1.5 bg-surface border border-border text-ink-muted hover:text-ink rounded text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setActiveGradeInput(sub._id); setNewGrade(""); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-bg border border-border text-ink-muted hover:text-ink transition-all cursor-pointer"
                          >
                            <LuPlus /> Add Grade Record
                          </button>
                        )}
                      </div>
                    </div>
                  </Tilt3D>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-ink-muted italic">
                No academic subjects found. Create one to begin tracking grades.
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}

export default SubjectsPage;
