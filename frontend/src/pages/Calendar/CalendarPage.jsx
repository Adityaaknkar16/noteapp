import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import FlowerDecor from "../../components/FlowerDecor/FlowerDecor";
import { 
  MdOutlineDashboard,
  MdOutlineStickyNote2, 
  MdCheckCircle, 
  MdBook, 
  MdLocalFireDepartment,
  MdSchool,
  MdAdd,
  MdClose,
  MdDelete,
  MdOutlineLocationOn,
  MdPersonOutline
} from "react-icons/md";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
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
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
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
      fetchScheduleData();
    }
  }, [currentUser]);

  const fetchScheduleData = async () => {
    try {
      const subRes = await axios.get("http://localhost:3000/api/academic/subjects/all", { withCredentials: true });
      if (subRes.data.success) {
        setSubjects(subRes.data.subjects || []);
      }
      
      const evRes = await axios.get("http://localhost:3000/api/academic/events/all", { withCredentials: true });
      if (evRes.data.success) {
        setEvents(evRes.data.events || []);
      }
    } catch (error) {
      alert.error("Failed to load calendar schedule");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title) { alert.error("Event title is required"); return; }
    if (startTime >= endTime) { alert.error("End time must be after start time"); return; }

    try {
      const res = await axios.post("http://localhost:3000/api/academic/events/add", {
        title,
        subjectId: subjectId || null,
        dayOfWeek,
        startTime,
        endTime,
        location,
        instructor
      }, { withCredentials: true });

      if (res.data.success) {
        alert.success("Class event created!");
        setTitle(""); setSubjectId(""); setLocation(""); setInstructor("");
        setIsAddOpen(false); fetchScheduleData();
      }
    } catch (error) {
      alert.error("Failed to create event");
    }
  };

  const handleDeleteEvent = async (eventId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this scheduled class?")) return;

    try {
      const res = await axios.delete(`http://localhost:3000/api/academic/events/delete/${eventId}`, { withCredentials: true });
      if (res.data.success) { alert.success("Event deleted"); fetchScheduleData(); }
    } catch (error) {
      alert.error("Failed to delete event");
    }
  };

  // Convert "HH:MM" to row position in grid (8:00 = 1st slot, 9:00 = 2nd, etc.)
  const getTimeCoordinates = (start, end) => {
    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h + m / 60;
    };
    
    const startHour = parseTime(start);
    const endHour = parseTime(end);
    
    // Grid starts at 8.0, so offset is (startHour - 8) * 60 minutes
    const gridStartLine = Math.round((startHour - 8) * 12) + 2; // +2 offset for grid lines
    const durationSlots = Math.round((endHour - startHour) * 12);
    
    return {
      gridRowStart: gridStartLine,
      gridRowEnd: gridStartLine + durationSlots
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-purple-400/10 dark:bg-purple-500/5 blur-[90px] pointer-events-none" />
      <FlowerDecor position="bottom-right" size="md" opacity={0.1} />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1">
        {/* Sidebar */}
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
              <button onClick={() => navigate("/calendar")} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-sm w-full text-left transition-all border border-blue-500/20">
                <MdOutlineDashboard className="text-lg text-blue-500" />
                Calendar
              </button>
              <button onClick={() => navigate("/subjects")} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all">
                <MdSchool className="text-lg text-slate-400" />
                Subjects
              </button>
            </div>
          </div>
        </aside>

        {/* Calendar Main Grid Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Plan and check class timings</p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-semibold cursor-pointer shadow-sm hover:opacity-90 transition-all"
              >
                <MdAdd className="text-lg" />
                + Create event
              </button>
            </div>

            {/* Create Event Modal */}
            {isAddOpen && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-md relative transition-colors max-w-2xl">
                <button onClick={() => setIsAddOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <MdClose className="text-lg" />
                </button>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Schedule Class Event</h3>
                <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Class Title (e.g. Algebra I, Physics Lab)"
                      className="input-box border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg w-full bg-transparent text-slate-800 dark:text-slate-100"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subject Association</label>
                    <select
                      className="w-full bg-transparent border border-slate-350 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
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
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Day of Week</label>
                    <select
                      className="w-full bg-transparent border border-slate-350 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Start Time</label>
                    <input
                      type="time"
                      className="w-full bg-transparent border border-slate-355 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">End Time</label>
                    <input
                      type="time"
                      className="w-full bg-transparent border border-slate-355 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Room / Location (e.g. Room 301)"
                      className="input-box border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg w-full bg-transparent text-slate-800 dark:text-slate-100"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Instructor Name (e.g. Dr. Stolz)"
                      className="input-box border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg w-full bg-transparent text-slate-800 dark:text-slate-100"
                      value={instructor}
                      onChange={(e) => setInstructor(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow transition-all">
                      Add Event
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Weekly Schedule Grid */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-x-auto">
              <div className="min-w-[700px] grid grid-cols-6 gap-4 relative">
                {/* Column Headers */}
                <div className="h-10"></div> {/* corner spacer */}
                {DAYS.map((day) => (
                  <div key={day} className="text-center font-bold text-sm text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-150 dark:border-slate-800">
                    {day.slice(0, 3)}
                  </div>
                ))}

                {/* Left Time Labels & Columns Content slots */}
                <div className="col-span-6 grid grid-cols-6 relative" style={{ gridTemplateRows: 'repeat(132, minmax(6px, auto))' }}>
                  {/* Time label markers */}
                  {TIMES.map((time, idx) => {
                    const gridRowStart = (idx * 12) + 2;
                    return (
                      <div
                        key={time}
                        className="text-xs font-semibold text-slate-400 select-none text-right pr-4"
                        style={{ gridColumn: 1, gridRowStart, gridRowEnd: gridRowStart + 12 }}
                      >
                        {time}
                      </div>
                    );
                  })}

                  {/* Draw vertical column dividers for Mon-Fri */}
                  {[1, 2, 3, 4, 5].map((colIdx) => (
                    <div
                      key={colIdx}
                      className="absolute border-r border-dashed border-slate-200 dark:border-slate-800/60 top-0 bottom-0"
                      style={{
                        left: `${(colIdx / 6) * 100}%`,
                        width: '1px'
                      }}
                    />
                  ))}

                  {/* Render scheduled Event Cards */}
                  {events.map((event) => {
                    const dayIndex = DAYS.indexOf(event.dayOfWeek);
                    if (dayIndex === -1) return null;
                    
                    const colIndex = dayIndex + 2; // column 1 is time labels
                    const { gridRowStart, gridRowEnd } = getTimeCoordinates(event.startTime, event.endTime);
                    const subColor = event.subjectId?.color || "#3B82F6";

                    return (
                      <div
                        key={event._id}
                        className="mx-1 my-0.5 p-3 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow cursor-pointer select-none group relative overflow-hidden"
                        style={{
                          gridColumn: colIndex,
                          gridRowStart,
                          gridRowEnd,
                          backgroundColor: `${subColor}12`,
                          borderColor: `${subColor}40`,
                          borderLeft: `4px solid ${subColor}`
                        }}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{event.startTime} - {event.endTime}</span>
                            <button
                              onClick={(e) => handleDeleteEvent(event._id, e)}
                              className="text-slate-400 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Event"
                            >
                              <MdClose />
                            </button>
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1 line-clamp-1">{event.title}</h4>
                          {event.subjectId && (
                            <span className="text-[9px] font-bold opacity-80 uppercase px-1.5 py-0.5 rounded mt-1.5 inline-block text-white" style={{ backgroundColor: subColor }}>
                              {event.subjectId.name}
                            </span>
                          )}
                        </div>

                        {/* Location / Instructor footers */}
                        <div className="flex flex-col gap-0.5 mt-2 border-t border-slate-200/30 pt-1.5 text-[9px] text-slate-400">
                          {event.location && (
                            <span className="flex items-center gap-0.5">
                              <MdOutlineLocationOn /> {event.location}
                            </span>
                          )}
                          {event.instructor && (
                            <span className="flex items-center gap-0.5">
                              <MdPersonOutline /> {event.instructor}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CalendarPage;
