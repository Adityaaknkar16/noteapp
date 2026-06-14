import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { MdAdd, MdClose, MdOutlineStickyNote2, MdArchive, MdDeleteOutline, MdOutlineLabel, MdCheckCircle, MdBook, MdLocalFireDepartment, MdOutlineDashboard, MdSchool, MdCalendarToday } from "react-icons/md";
import Notecard from "../../components/Cards/Notecard";
import AddEditnotes from "./AddEditnotes";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import EmptyCard from "../../components/EmptyCard/Empty";
import FlowerDecor from "../../components/FlowerDecor/FlowerDecor";
import moment from "moment";
import { useSettings } from "../../components/Settings/SettingsProvider";

Modal.setAppElement("#root");

function Home() {
  const navigate = useNavigate();
  const alert = useAlert();
  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  
  // Navigation & Filtering States
  const [currentFilter, setCurrentFilter] = useState("all"); // 'all', 'archive', 'trash'
  const [selectedTag, setSelectedTag] = useState(null);
  const [uniqueTags, setUniqueTags] = useState([]);

  // Modals
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [editorTabs, setEditorTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  const handleOpenNoteInTab = (note) => {
    const exists = editorTabs.find(t => t._id === note._id);
    if (!exists) {
      setEditorTabs(prev => [...prev, note]);
    }
    setActiveTabId(note._id);
    setOpenAddEditModal({ isShown: true, type: "edit", data: note });
  };

  const handleCreateNewNoteTab = () => {
    const newId = "new-" + Date.now();
    const newNote = {
      _id: newId,
      title: "Untitled Note",
      content: "",
      tags: [],
      color: "#ffffff",
      paperType: "lined",
      fontFamily: "Outfit",
      penColor: "#1e293b",
      stickers: [],
      isNew: true
    };
    setEditorTabs(prev => [...prev, newNote]);
    setActiveTabId(newId);
    setOpenAddEditModal({ isShown: true, type: "add", data: newNote });
  };

  const handleCloseNoteTab = (tabId, e) => {
    if (e) e.stopPropagation();
    const filtered = editorTabs.filter(t => t._id !== tabId);
    setEditorTabs(filtered);
    
    if (filtered.length === 0) {
      handleCloseModal();
    } else if (activeTabId === tabId) {
      setActiveTabId(filtered[filtered.length - 1]._id);
    }
  };

  const handleUpdateTabState = (updatedNote) => {
    setEditorTabs(prev => prev.map(t => t._id === updatedNote._id ? updatedNote : t));
  };

  const [viewNoteModal, setViewNoteModal] = useState({
    isShown: false,
    data: null,
  });

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      getAllNotes("all", null);
      fetchUniqueTags();
    }
  }, [currentUser]);

  // Fetch unique tags of active/archived notes to display in sidebar
  const fetchUniqueTags = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/note/all", {
        withCredentials: true,
      });
      if (res.data.success && res.data.notes) {
        const activeAndArchived = res.data.notes.filter(n => !n.isTrashed);
        const tags = Array.from(new Set(activeAndArchived.flatMap(note => note.tags || [])));
        setUniqueTags(tags);
      }
    } catch (error) {
      console.error("Error fetching unique tags:", error);
    }
  };

  const getAllNotes = async (filter = currentFilter, tag = selectedTag) => {
    try {
      const params = {};
      if (filter !== "all") params.filter = filter;
      if (tag) params.tag = tag;

      const res = await axios.get("http://localhost:3000/api/note/all", {
        params,
        withCredentials: true,
      });

      if (!res.data.success) {
        alert.error(res.data.message || "Failed to fetch notes");
        return;
      }

      setAllNotes(res.data.notes || []);
    } catch (error) {
      alert.error(error.message || "Error fetching notes");
    }
  };

  const handleCloseModal = () => {
    setOpenAddEditModal({ isShown: false, type: "add", data: null });
    setEditorTabs([]);
    setActiveTabId(null);
  };

  const handleEdit = (noteDetails) => {
    handleOpenNoteInTab(noteDetails);
  };

  const handlePinNote = async (note) => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/note/update-note-pinned/${note._id}`,
        { isPinned: !note.isPinned },
        { withCredentials: true }
      );
      if (res.data.success) {
        alert.success(note.isPinned ? "Note unpinned" : "Note pinned");
        getAllNotes(currentFilter, selectedTag);
      } else {
        alert.error(res.data.message || "Failed to pin note");
      }
    } catch (error) {
      alert.error(error.message || "Error updating pin status");
    }
  };

  const handleArchiveNote = async (note) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/note/edit/${note._id}`,
        { isArchived: !note.isArchived },
        { withCredentials: true }
      );
      if (res.data.success) {
        alert.success(note.isArchived ? "Note unarchived" : "Note archived");
        getAllNotes(currentFilter, selectedTag);
        fetchUniqueTags();
      } else {
        alert.error(res.data.message || "Failed to archive note");
      }
    } catch (error) {
      alert.error(error.message || "Error updating archive status");
    }
  };

  const handleRestoreNote = async (note) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/note/edit/${note._id}`,
        { isTrashed: false },
        { withCredentials: true }
      );
      if (res.data.success) {
        alert.success("Note restored!");
        getAllNotes(currentFilter, selectedTag);
        fetchUniqueTags();
      } else {
        alert.error(res.data.message || "Failed to restore note");
      }
    } catch (error) {
      alert.error(error.message || "Error restoring note");
    }
  };

  const handleNoteDelete = async (note) => {
    try {
      let res;
      if (note.isTrashed) {
        res = await axios.delete(
          `http://localhost:3000/api/note/delete/${note._id}`,
          { withCredentials: true }
        );
      } else {
        res = await axios.post(
          `http://localhost:3000/api/note/edit/${note._id}`,
          { isTrashed: true, isPinned: false },
          { withCredentials: true }
        );
      }

      if (res.data.success) {
        alert.success(note.isTrashed ? "Note deleted permanently" : "Note moved to Trash");
        getAllNotes(currentFilter, selectedTag);
        fetchUniqueTags();
      } else {
        alert.error(res.data.message || "Failed to delete note");
      }
    } catch (error) {
      alert.error(error.message || "Error deleting note");
    }
  };

  const handleSearch = (query) => {
    if (!query) {
      setIsSearch(false);
      getAllNotes(currentFilter, selectedTag);
      return;
    }
    setIsSearch(true);
    const filtered = allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase())
    );
    setAllNotes(filtered);
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes(currentFilter, selectedTag);
  };

  const selectFilter = (filter) => {
    setCurrentFilter(filter);
    setSelectedTag(null);
    getAllNotes(filter, null);
  };

  const selectTag = (tag) => {
    setSelectedTag(tag);
    getAllNotes(currentFilter, tag);
  };

  const handleRefreshAll = () => {
    getAllNotes(currentFilter, selectedTag);
    fetchUniqueTags();
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#07090e] flex flex-col transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic Calming 3D Mesh Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full mesh-glow-1 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full mesh-glow-2 blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] left-[25%] w-[400px] h-[400px] rounded-full mesh-glow-3 blur-[90px] pointer-events-none" />
      <FlowerDecor position="bottom-right" size="lg" opacity={0.12} />

      <Navbar
        userInfo={userInfo}
        handleClearSearch={handleClearSearch}
        onSearchNote={handleSearch}
      />

      <div className="flex-1 flex relative z-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 flex flex-col gap-6 shrink-0 max-md:hidden transition-colors overflow-y-auto">
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
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 w-full text-left transition-all border border-emerald-500/20 shadow-sm"
              >
                <MdOutlineStickyNote2 className="text-lg text-emerald-500" />
                Notes Grid
              </button>

              <div className="flex flex-col gap-1 pl-1 py-1 border-l border-slate-200 dark:border-slate-800 ml-3.5">
                <button
                  onClick={() => selectFilter("all")}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentFilter === "all" && !selectedTag
                      ? "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10"
                      : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Active Notes
                </button>

                <button
                  onClick={() => selectFilter("archive")}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentFilter === "archive" && !selectedTag
                      ? "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10"
                      : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Archived
                </button>

                <button
                  onClick={() => selectFilter("trash")}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentFilter === "trash" && !selectedTag
                      ? "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10"
                      : "text-slate-500 dark:text-slate-455 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Trash Bin
                </button>
              </div>

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

          <div className="border-t border-slate-200/50 dark:border-slate-800 pt-4">
            <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Tags</h5>
            {uniqueTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {uniqueTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => selectTag(tag)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      selectedTag === tag
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <MdOutlineLabel />
                    {tag}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No tags created yet.</p>
            )}
          </div>
        </aside>

        {/* Main Notes Grid Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header indicator */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                {selectedTag ? `Tagged: #${selectedTag}` : `${currentFilter} Notes`}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Showing {allNotes.length} notes
              </p>
            </div>
            {selectedTag && (
              <button
                onClick={() => selectFilter(currentFilter)}
                className="text-xs font-medium text-blue-500 hover:underline cursor-pointer"
              >
                Clear Tag Filter
              </button>
            )}
          </div>

          {allNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {allNotes.map((note) => (
                <Notecard
                  key={note._id}
                  title={note.title}
                  date={note.createdAt}
                  content={note.content}
                  tags={note.tags || []}
                  isPinned={note.isPinned}
                  color={note.color}
                  paperType={note.paperType}
                  fontFamily={note.fontFamily}
                  penColor={note.penColor}
                  stickers={note.stickers}
                  isArchived={note.isArchived}
                  isTrashed={note.isTrashed}
                  onEdit={() => handleEdit(note)}
                  onDelete={() => handleNoteDelete(note)}
                  onPinNote={() => handlePinNote(note)}
                  onArchive={() => handleArchiveNote(note)}
                  onRestore={() => handleRestoreNote(note)}
                  onClickCard={() => setViewNoteModal({ isShown: true, data: note })}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-20">
              <EmptyCard
                message={
                  currentFilter === "trash"
                    ? "Trash bin is empty."
                    : currentFilter === "archive"
                    ? "No archived notes."
                    : "No notes here. Let's write down something amazing!"
                }
              />
              <p className="text-center mt-4 text-gray-500 dark:text-gray-400">
                {currentFilter === "all" ? "Ready to capture your ideas? Click the '+' button" : ""}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Add Floating Action Button only if not viewing trash */}
      {currentFilter !== "trash" && (
        <button
          className="w-14 h-14 flex items-center justify-center rounded-full bg-[#2BB5FF] hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl fixed right-8 bottom-8 z-10 cursor-pointer text-white"
          onClick={handleCreateNewNoteTab}
          title="Add Note"
        >
          <MdAdd className="text-[28px]" />
        </button>
      )}

      {/* Add / Edit Note Modal */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={handleCloseModal}
        style={{
          overlay: {
            backgroundColor: "rgba(10, 15, 30, 0.4)",
            backdropFilter: "blur(8px)",
            zIndex: 1000
          },
        }}
        contentLabel="Add/Edit Note"
        className="w-[65%] max-h-[85vh] bg-white/70 dark:bg-slate-900/60 border border-white/30 dark:border-slate-800/80 backdrop-blur-xl rounded-[28px] mx-auto mt-14 p-6 overflow-y-auto max-md:w-[85%] max-sm:w-[95%] shadow-2xl transition-colors"
      >
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          {editorTabs.map((tab) => {
            const isActive = tab._id === activeTabId;
            return (
              <div
                key={tab._id}
                onClick={() => setActiveTabId(tab._id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white border-transparent shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>📓 {tab.title || "Untitled"}</span>
                <button
                  type="button"
                  onClick={(e) => handleCloseNoteTab(tab._id, e)}
                  className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  title="Close Tab"
                >
                  <MdClose className="text-xs" />
                </button>
              </div>
            );
          })}
          
          {/* New Tab Button */}
          <button
            type="button"
            onClick={handleCreateNewNoteTab}
            className="flex items-center justify-center p-1.5 rounded-xl border border-dashed border-slate-350 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-colors cursor-pointer shrink-0"
            title="Open New Tab"
          >
            <MdAdd className="text-sm" />
          </button>
        </div>

        {editorTabs.find(t => t._id === activeTabId) && (
          <AddEditnotes
            key={activeTabId} // Remount on tab switch to sync form input states
            type={editorTabs.find(t => t._id === activeTabId).isNew ? "add" : "edit"}
            noteData={editorTabs.find(t => t._id === activeTabId)}
            onClose={handleCloseModal}
            getAllNotes={handleRefreshAll}
            onUpdateTab={handleUpdateTabState}
          />
        )}
      </Modal>

      {/* View Note Modal */}
      <Modal
        isOpen={viewNoteModal.isShown}
        onRequestClose={() => setViewNoteModal({ isShown: false, data: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
            zIndex: 1000
          },
        }}
        contentLabel="View Note"
        className="w-[45%] max-h-[80vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mx-auto mt-14 p-6 overflow-y-auto max-md:w-[70%] max-sm:w-[90%] shadow-2xl relative transition-colors"
      >
        {viewNoteModal.data && (
          <div className="relative flex flex-col gap-4 text-slate-800 dark:text-slate-100">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center absolute -top-2 -right-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-400 dark:text-slate-500"
              onClick={() => setViewNoteModal({ isShown: false, data: null })}
              title="Close"
            >
              <MdClose className="text-xl" />
            </button>
            
            <div className="pr-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {viewNoteModal.data.title}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {moment(viewNoteModal.data.createdAt).format("Do MMM YYYY")}
                </span>
                {viewNoteModal.data.isPinned && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                    Pinned
                  </span>
                )}
                {viewNoteModal.data.color && viewNoteModal.data.color !== "#ffffff" && (
                  <span 
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-sm"
                    style={{ backgroundColor: viewNoteModal.data.color }}
                    title="Note Color"
                  />
                )}
              </div>
            </div>

            <div 
              className="mt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-[45vh] overflow-y-auto bg-slate-50 dark:bg-slate-950/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800"
              dangerouslySetInnerHTML={{ __html: viewNoteModal.data.content }}
            />

            {viewNoteModal.data.tags && viewNoteModal.data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {viewNoteModal.data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-blue-500 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Home;