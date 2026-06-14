import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import { MdOutlineStickyNote2, MdCheckCircle, MdBook, MdDelete, MdAdd, MdClose, MdFlag, MdOutlineCalendarToday, MdLocalFireDepartment, MdOutlineDashboard, MdSchool } from "react-icons/md";
import FlowerDecor from "../../components/FlowerDecor/FlowerDecor";
import moment from "moment";

function TasksPage() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);
  
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all"); // 'all', 'pending', 'completed'
  
  // New task form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchTasks(taskFilter);
    }
  }, [currentUser, taskFilter]);

  const fetchTasks = async (filter = taskFilter) => {
    try {
      const res = await axios.get("http://localhost:3000/api/task/all", {
        params: { filter },
        withCredentials: true,
      });
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (error) {
      alert.error(error.message || "Failed to fetch tasks");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title) {
      alert.error("Task title is required");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/task/add", {
        title,
        priority,
        dueDate: dueDate || null
      }, { withCredentials: true });

      if (res.data.success) {
        alert.success("Task added!");
        setTitle(""); setPriority("medium"); setDueDate(""); setIsAddOpen(false); fetchTasks();
      }
    } catch (error) {
      alert.error(error.message || "Failed to add task");
    }
  };

  const toggleTaskCompletion = async (task) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/task/edit/${task._id}`, {
        completed: !task.completed
      }, { withCredentials: true });

      if (res.data.success) {
        alert.success(task.completed ? "Task set to pending" : "Task completed! ✓");
        fetchTasks();
      }
    } catch (error) {
      alert.error(error.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await axios.delete(`http://localhost:3000/api/task/delete/${taskId}`, { withCredentials: true });
      if (res.data.success) {
        alert.success("Task deleted");
        fetchTasks();
      }
    } catch (error) {
      alert.error(error.message || "Failed to delete task");
    }
  };

  const getPriorityBadge = (prio) => {
    if (prio === "high") return "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40";
    if (prio === "medium") return "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40";
    return "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/40";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background glows */}
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
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 w-full text-left transition-all border border-violet-500/20 shadow-sm"
              >
                <MdCheckCircle className="text-lg text-violet-500" />
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
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 w-full text-left transition-all"
              >
                <MdLocalFireDepartment className="text-lg text-orange-500/70 dark:text-orange-400/80" />
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
                <MdSchool className="text-lg text-slate-400" />
                Subjects
              </button>
            </div>
          </div>
        </aside>

        {/* Tasks Checklist Main Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Manage and track your everyday items</p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2BB5FF] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-sm"
              >
                <MdAdd className="text-lg" />
                Add Task
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
              {["all", "pending", "completed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTaskFilter(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    taskFilter === tab
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Add Task Quick Form (Drawer/Card) */}
            {isAddOpen && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-md relative transition-colors">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <MdClose className="text-lg" />
                </button>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Create New Task</h3>
                <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      placeholder="What needs to be done?"
                      className="input-box border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-lg w-full outline-none bg-transparent text-slate-800 dark:text-slate-100"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Priority</label>
                    <select
                      className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm cursor-pointer shadow"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Checklist items */}
            {tasks.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:shadow-md ${
                      task.completed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 max-w-[75%]">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task)}
                        className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-700 text-blue-500 focus:ring-blue-400 cursor-pointer"
                      />
                      <div>
                        <h4 className={`text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug break-all ${
                          task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""
                        }`}>
                          {task.title}
                        </h4>
                        
                        {/* Tags / Sub-indicators */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MdOutlineCalendarToday />
                              {moment(task.dueDate).format("Do MMM YYYY")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                      title="Delete task"
                    >
                      <MdDelete className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 dark:text-slate-500 italic">
                No tasks found in this folder.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default TasksPage;
