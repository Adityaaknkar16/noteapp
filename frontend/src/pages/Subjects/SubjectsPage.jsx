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
  MdAdd,
  MdClose,
  MdDelete,
  MdSchool,
  MdTrendingUp,
  MdTrendingDown
} from "react-icons/md";

function SubjectsPage() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [performance, setPerformance] = useState(0);
  const [icon, setIcon] = useState("school");
  
  // Grade form state
  const [activeGradeInput, setActiveGradeInput] = useState(null); // subjectId
  const [newGrade, setNewGrade] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchSubjects();
    }
  }, [currentUser]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/academic/subjects/all", { withCredentials: true });
      if (res.data.success) {
        setSubjects(res.data.subjects || []);
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
        setName(""); setColor("#3B82F6"); setPerformance(0); setIsAddOpen(false); fetchSubjects();
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
    "#EF4444", // Red/Coral (Math style)
    "#F59E0B", // Yellow/Amber (Politics style)
    "#3B82F6", // Blue (Deutsch style)
    "#8B5CF6", // Violet (Physics style)
    "#10B981", // Green/Emerald (Chemistry style)
    "#EC4899", // Pink (Biology style)
    "#64748B", // Slate
  ];

  const getAverageGrade = (grades) => {
    if (!grades || grades.length === 0) return "N/A";
    const sum = grades.reduce((a, b) => a + b, 0);
    return (sum / grades.length).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-purple-400/10 dark:bg-purple-500/5 blur-[90px] pointer-events-none" />
      <FlowerDecor position="bottom-right" size="md" opacity={0.12} />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1">
        {/* Left Sidebar Layout */}
        <aside className="w-64 border-r border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 flex flex-col gap-6 shrink-0 max-md:hidden transition-colors">
          <div>
            <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Workspace</h5>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => navigate("/")} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all">
                <MdOutlineDashboard className="text-lg text-blue-500/70 dark:text-blue-400/80" />
                Dashboard
              </button>
              <button onClick={() => navigate("/notes")} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all">
                <MdOutlineStickyNote2 className="text-lg text-emerald-500/70 dark:text-emerald-400/80" />
                Notes Grid
              </button>
              <button onClick={() => navigate("/tasks")} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all">
                <MdCheckCircle className="text-lg text-violet-500/70 dark:text-violet-400/80" />
                My Tasks
              </button>
              <button onClick={() => navigate("/diary")} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all">
                <MdBook className="text-lg text-pink-500/70 dark:text-pink-400/80" />
                Daily Diary
              </button>
              <button onClick={() => navigate("/habits")} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all">
                <MdLocalFireDepartment className="text-lg text-orange-500/70 dark:text-orange-400/80" />
                Habit Tracker
              </button>
              <button onClick={() => navigate("/subjects")} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#2BB5FF]/10 text-blue-600 dark:text-blue-400 shadow-sm w-full text-left transition-all border border-[#2BB5FF]/20">
                <MdSchool className="text-lg text-blue-500" />
                Subjects
              </button>
            </div>
          </div>
        </aside>

        {/* Subjects Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subjects & Grades</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Track course performance metrics and grades</p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2BB5FF] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-sm transition-all"
              >
                <MdAdd className="text-lg" />
                Add Subject
              </button>
            </div>

            {/* Add Subject Card */}
            {isAddOpen && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-md relative transition-colors max-w-xl">
                <button onClick={() => setIsAddOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <MdClose className="text-lg" />
                </button>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Create New Subject</h3>
                <form onSubmit={handleAddSubject} className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Subject Name (e.g. Mathematics, Organic Chemistry)"
                    className="input-box border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-lg w-full outline-none bg-transparent text-slate-800 dark:text-slate-100"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Subject Color Theme</label>
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
                  <button type="submit" className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm cursor-pointer shadow transition-all">
                    Save Subject
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
                      className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative w-full"
                      style={{ borderLeft: `5px solid ${sub.color}` }}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{sub.name}</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Grade: <span className="text-slate-700 dark:text-slate-350">{getAverageGrade(sub.grades)}</span></span>
                          </div>
                          <button
                            onClick={() => handleDeleteSubject(sub._id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Delete Subject"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        </div>

                        {/* Performance Indicators */}
                        <div className={`flex items-center gap-1.5 font-bold text-xs mb-4 ${
                          sub.performance >= 0 ? "text-green-500" : "text-red-500"
                        }`}>
                          {sub.performance >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                          <span>{sub.performance >= 0 ? "+" : ""}{sub.performance}% performance</span>
                        </div>

                        {/* Grades tags */}
                        <div className="mb-4">
                          <div className="text-[9px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Grades Ledger</div>
                          {sub.grades.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {sub.grades.map((gr, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg text-xs font-extrabold text-white shadow-sm"
                                  style={{ backgroundColor: sub.color }}
                                >
                                  {gr.toFixed(2)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No grades recorded.</span>
                          )}
                        </div>
                      </div>

                      {/* Add Grade Form */}
                      <div className="mt-4 border-t border-slate-200/40 dark:border-slate-800 pt-3">
                        {activeGradeInput === sub._id ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Grade (e.g. 9.2)"
                              className="bg-transparent border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs rounded outline-none w-28 text-slate-800 dark:text-white"
                              value={newGrade}
                              onChange={(e) => setNewGrade(e.target.value)}
                            />
                            <button
                              onClick={() => handleAddGrade(sub._id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setActiveGradeInput(null)}
                              className="px-3 py-1 bg-slate-300 dark:bg-slate-800 hover:bg-slate-400 text-slate-800 dark:text-slate-100 rounded text-xs font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setActiveGradeInput(sub._id); setNewGrade(""); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
                          >
                            <MdAdd /> Add Grade Record
                          </button>
                        )}
                      </div>
                    </div>
                  </Tilt3D>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 italic">
                No academic subjects found. Create one to begin tracking grades.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SubjectsPage;
