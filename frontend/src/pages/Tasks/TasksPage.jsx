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
  LuCalendar, 
  LuSquareCheck, 
  LuList, 
  LuKanban, 
  LuCircleAlert, 
  LuCheck 
} from "react-icons/lu";
import PageDecor from "../../components/Doodles/PageDecor";
import BottomBar from "../../components/BottomBar/BottomBar";
import moment from "moment";
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

// Droppable Column Component
function KanbanColumn({ id, title, children }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex-1 min-h-[450px] bg-surface border border-border rounded-lg p-4 flex flex-col gap-3 transition-colors">
      <h3 className="text-xs font-mono font-bold text-ink-muted uppercase tracking-wider mb-2 border-b border-border pb-2 flex justify-between items-center">
        <span>{title}</span>
        <span className="text-xs bg-bg px-2 py-0.5 rounded font-bold">{React.Children.count(children)}</span>
      </h3>
      <div className="flex-1 flex flex-col gap-2.5">
        {children}
      </div>
    </div>
  );
}

// Draggable Task Card Component
function KanbanTaskCard({ task, onClick, onDelete, getPriorityBadge, subtasksCount }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded-lg border border-border bg-surface shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none relative group"
    >
      {/* Drag Handle Area or Card Body */}
      <div {...listeners} {...attributes} onClick={onClick} className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="text-xs font-bold text-ink leading-tight pr-6 line-clamp-2">{task.title}</h4>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${getPriorityBadge(task.priority)}`}>
            {task.priority}
          </span>
          {subtasksCount > 0 && (
            <span className="text-[9px] font-mono text-ink-muted bg-bg px-1.5 py-0.5 rounded">
              {subtasksCount} subtasks
            </span>
          )}
        </div>
      </div>
      {/* Delete button (non-draggable to trigger click cleanly) */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
        className="absolute top-2 right-2 text-ink-muted hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
        title="Delete Task"
      >
        <LuTrash2 className="text-xs" />
      </button>
    </div>
  );
}

function TasksPage() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);
  
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all"); // 'all', 'pending', 'completed'
  const [viewMode, setViewMode] = useState("list"); // 'list', 'kanban'
  
  // New task form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  // Subtasks & In-Progress state in localStorage
  const [inProgressTaskIds, setInProgressTaskIds] = useState(() => {
    return JSON.parse(localStorage.getItem("inkwell_tasks_inprogress") || "[]");
  });

  const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  // Pointer sensor to allow clicking inside draggable cards
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag starts only after moving 8px, allowing standard clicks to fire!
      },
    })
  );

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      fetchTasks(taskFilter);
    }
  }, [currentUser, taskFilter]);

  useEffect(() => {
    localStorage.setItem("inkwell_tasks_inprogress", JSON.stringify(inProgressTaskIds));
  }, [inProgressTaskIds]);

  const fetchTasks = async (filter = taskFilter) => {
    try {
      const res = await axios.get("/api/task/all", {
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
      const res = await axios.post("/api/task/add", {
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
      const res = await axios.post(`/api/task/edit/${task._id}`, {
        completed: !task.completed
      }, { withCredentials: true });

      if (res.data.success) {
        alert.success(task.completed ? "Task set to pending" : "Task completed! ✓");
        // Remove from in-progress if completed
        if (!task.completed) {
          setInProgressTaskIds(prev => prev.filter(id => id !== task._id));
        }
        fetchTasks();
      }
    } catch (error) {
      alert.error(error.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await axios.delete(`/api/task/delete/${taskId}`, { withCredentials: true });
      if (res.data.success) {
        alert.success("Task deleted");
        setInProgressTaskIds(prev => prev.filter(id => id !== taskId));
        // Clean up subtasks
        localStorage.removeItem(`inkwell_subtasks_${taskId}`);
        fetchTasks();
      }
    } catch (error) {
      alert.error(error.message || "Failed to delete task");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const targetColumn = over.id; // 'todo', 'inprogress', 'done'

    try {
      if (targetColumn === 'done') {
        // Mark as completed
        await axios.post(`/api/task/edit/${taskId}`, { completed: true }, { withCredentials: true });
        setInProgressTaskIds(prev => prev.filter(id => id !== taskId));
        alert.success("Task completed! ✓");
      } else if (targetColumn === 'inprogress') {
        // Mark as pending & in progress
        await axios.post(`/api/task/edit/${taskId}`, { completed: false }, { withCredentials: true });
        if (!inProgressTaskIds.includes(taskId)) {
          setInProgressTaskIds(prev => [...prev, taskId]);
        }
      } else {
        // To Do: Mark as pending & NOT in progress
        await axios.post(`/api/task/edit/${taskId}`, { completed: false }, { withCredentials: true });
        setInProgressTaskIds(prev => prev.filter(id => id !== taskId));
      }
      fetchTasks();
    } catch (err) {
      alert.error("Failed to move task: " + err.message);
    }
  };

  // Subtasks logic
  const openSubtasksModal = (task) => {
    setSelectedTaskForSubtasks(task);
    const saved = JSON.parse(localStorage.getItem(`inkwell_subtasks_${task._id}`) || "[]");
    setSubtasks(saved);
  };

  const saveSubtasks = (updated) => {
    setSubtasks(updated);
    if (selectedTaskForSubtasks) {
      localStorage.setItem(`inkwell_subtasks_${selectedTaskForSubtasks._id}`, JSON.stringify(updated));
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSub = {
      id: "sub-" + Date.now(),
      text: newSubtaskText.trim(),
      completed: false
    };
    saveSubtasks([...subtasks, newSub]);
    setNewSubtaskText("");
  };

  const toggleSubtask = (subId) => {
    const updated = subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
    saveSubtasks(updated);
  };

  const handleDeleteSubtask = (subId) => {
    const updated = subtasks.filter(s => s.id !== subId);
    saveSubtasks(updated);
  };

  const getSubtasksCount = (taskId) => {
    const list = JSON.parse(localStorage.getItem(`inkwell_subtasks_${taskId}`) || "[]");
    return list.length;
  };

  const getPriorityBadge = (prio) => {
    if (prio === "high") return "bg-accent-red/10 text-accent-red border border-accent-red/20";
    if (prio === "medium") return "bg-accent-ochre/10 text-accent-ochre border border-accent-ochre/20";
    return "bg-accent-sage/10 text-accent-sage border border-accent-sage/20";
  };

  // Categorize for Kanban
  const getKanbanTasks = () => {
    const todo = [];
    const inprogress = [];
    const done = [];

    tasks.forEach(task => {
      if (task.completed) {
        done.push(task);
      } else if (inProgressTaskIds.includes(task._id)) {
        inprogress.push(task);
      } else {
        todo.push(task);
      }
    });

    return { todo, inprogress, done };
  };

  const kanbanData = getKanbanTasks();

  return (
    <div className="h-screen bg-bg flex flex-col text-ink transition-colors duration-300 relative overflow-hidden">
      <PageDecor variant="tasks" />

      <Navbar userInfo={userInfo} />

      <div className="flex-1 flex max-md:flex-col relative z-1 overflow-hidden">
        <Sidebar />

        {/* Tasks Checklist Main Area */}
        <main className="flex-1 p-4 sm:p-8 pb-24 sm:pb-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header Toolbar */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-border pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">My Tasks</h1>
                <p className="text-xs text-ink-muted mt-1 font-medium">Manage and track your everyday items</p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      viewMode === "list" ? "bg-accent-rust text-white" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    <LuList className="text-sm" /> List
                  </button>
                  <button
                    onClick={() => setViewMode("kanban")}
                    className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                      viewMode === "kanban" ? "bg-accent-rust text-white" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    <LuKanban className="text-sm" /> Kanban
                  </button>
                </div>

                <button
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent-rust text-white rounded-lg text-xs font-bold cursor-pointer hover:brightness-110 shadow-sm"
                >
                  <LuPlus className="text-sm" /> Add Task
                </button>
              </div>
            </div>

            {/* List Filters (Only for List View) */}
            {viewMode === "list" && (
              <div className="flex gap-2 mb-6">
                {["all", "pending", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTaskFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border ${
                      taskFilter === tab
                        ? "bg-ink border-ink text-surface"
                        : "bg-surface border-border text-ink-muted hover:bg-bg hover:text-ink"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* Add Task Drawer */}
            {isAddOpen && (
              <div className="bg-surface border border-border rounded-lg p-5 mb-6 shadow-md relative transition-colors max-w-xl">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
                >
                  <LuX className="text-lg" />
                </button>
                <h3 className="font-display font-bold text-ink text-sm mb-4">Create New Task</h3>
                <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="What needs to be done?"
                      className="input-box"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1">Priority</label>
                      <select
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-ink outline-none"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="low">🟢 Low Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🔴 High Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono font-bold text-ink-muted block mb-1">Due Date</label>
                      <input
                        type="date"
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-ink outline-none"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary w-full"
                  >
                    Save Task
                  </button>
                </form>
              </div>
            )}

            {/* LIST VIEW */}
            {viewMode === "list" && (
              tasks.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => openSubtasksModal(task)}
                      className={`flex items-center justify-between p-4 rounded-lg bg-surface border border-border shadow-sm transition-all hover:shadow-md cursor-pointer ${
                        task.completed ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 max-w-[80%]">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => { e.stopPropagation(); toggleTaskCompletion(task); }}
                          className="w-4 h-4 rounded border-border text-accent-rust focus:ring-accent-rust cursor-pointer"
                        />
                        <div>
                          <h4 className={`text-sm font-bold text-ink leading-snug break-all ${
                            task.completed ? "line-through text-ink-muted" : ""
                          }`}>
                            {task.title}
                          </h4>
                          
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="text-[10px] text-ink-muted flex items-center gap-1 font-mono">
                                <LuCalendar className="text-xs" />
                                {moment(task.dueDate).format("Do MMM YYYY")}
                              </span>
                            )}
                            {getSubtasksCount(task._id) > 0 && (
                              <span className="text-[10px] text-ink-muted flex items-center gap-1 font-mono">
                                <LuSquareCheck className="text-xs" />
                                {getSubtasksCount(task._id)} Subtasks
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                        className="p-2 text-ink-muted hover:text-accent-red transition-colors cursor-pointer rounded-lg hover:bg-bg"
                        title="Delete task"
                      >
                        <LuTrash2 className="text-base" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-ink-muted italic">
                  No tasks found in this folder.
                </div>
              )
            )}

            {/* KANBAN VIEW */}
            {viewMode === "kanban" && (
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="flex gap-4 max-md:flex-col overflow-x-auto pb-4">
                  <KanbanColumn id="todo" title="To Do">
                    {kanbanData.todo.map(task => (
                      <KanbanTaskCard
                        key={task._id}
                        task={task}
                        getPriorityBadge={getPriorityBadge}
                        onDelete={handleDeleteTask}
                        subtasksCount={getSubtasksCount(task._id)}
                        onClick={() => openSubtasksModal(task)}
                      />
                    ))}
                  </KanbanColumn>
                  <KanbanColumn id="inprogress" title="In Progress">
                    {kanbanData.inprogress.map(task => (
                      <KanbanTaskCard
                        key={task._id}
                        task={task}
                        getPriorityBadge={getPriorityBadge}
                        onDelete={handleDeleteTask}
                        subtasksCount={getSubtasksCount(task._id)}
                        onClick={() => openSubtasksModal(task)}
                      />
                    ))}
                  </KanbanColumn>
                  <KanbanColumn id="done" title="Done">
                    {kanbanData.done.map(task => (
                      <KanbanTaskCard
                        key={task._id}
                        task={task}
                        getPriorityBadge={getPriorityBadge}
                        onDelete={handleDeleteTask}
                        subtasksCount={getSubtasksCount(task._id)}
                        onClick={() => openSubtasksModal(task)}
                      />
                    ))}
                  </KanbanColumn>
                </div>
              </DndContext>
            )}

            {/* Subtasks checklist Drawer / Modal */}
            {selectedTaskForSubtasks && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
                <div className="bg-surface rounded-lg p-6 max-w-md w-full border border-border shadow-xl relative text-ink">
                  <button
                    onClick={() => setSelectedTaskForSubtasks(null)}
                    className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
                  >
                    <LuX className="text-xl" />
                  </button>

                  <h3 className="font-display font-bold text-lg mb-1 pr-6 truncate">{selectedTaskForSubtasks.title}</h3>
                  <span className="text-[10px] font-mono text-ink-muted uppercase tracking-widest block mb-4 border-b border-border pb-2">Subtasks Checklist</span>

                  {/* New Subtask Input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add subtask..."
                      className="input-box py-1.5 px-3 text-xs"
                      value={newSubtaskText}
                      onChange={(e) => setNewSubtaskText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                    />
                    <button
                      onClick={handleAddSubtask}
                      className="px-3 bg-accent-rust text-white rounded-lg text-xs font-bold hover:brightness-110 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Subtasks List */}
                  {subtasks.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                      {subtasks.map((sub) => (
                        <div key={sub.id} className="flex justify-between items-center p-2 rounded bg-bg border border-border">
                          <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              onChange={() => toggleSubtask(sub.id)}
                              className="w-3.5 h-3.5 rounded border-border text-accent-rust focus:ring-accent-rust"
                            />
                            <span className={sub.completed ? "line-through text-ink-muted" : "text-ink"}>{sub.text}</span>
                          </label>
                          <button
                            onClick={() => handleDeleteSubtask(sub.id)}
                            className="text-ink-muted hover:text-accent-red cursor-pointer p-0.5"
                          >
                            <LuTrash2 className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-muted italic text-center py-6">No subtasks yet. Add one above!</p>
                  )}

                  <button
                    onClick={() => setSelectedTaskForSubtasks(null)}
                    className="btn-primary w-full mt-6"
                  >
                    Close & Sync
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}

export default TasksPage;
