import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { LuPlus, LuX, LuTag, LuRefreshCw, LuFolderOpen } from "react-icons/lu";
import Notecard from "../../components/Cards/Notecard";
import AddEditnotes from "./AddEditnotes";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import BottomBar from "../../components/BottomBar/BottomBar";
import EmptyCard from "../../components/EmptyCard/Empty";
import PageDecor from "../../components/Doodles/PageDecor";
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

  // PIN Lock States
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");

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
      const res = await axios.get("/api/note/all", {
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

      const res = await axios.get("/api/note/all", {
        params,
        withCredentials: true,
      });

      if (!res.data.success) {
        alert.error(res.data.message || "Failed to fetch notes");
        return;
      }

      // Sort client-side: Pinned first, then by date desc
      const sortedNotes = (res.data.notes || []).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setAllNotes(sortedNotes);
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
    if (noteDetails.isLocked) {
      setPendingAction({ type: "edit", note: noteDetails });
      setEnteredPin("");
      setPinError("");
      setPinModalOpen(true);
    } else {
      handleOpenNoteInTab(noteDetails);
    }
  };

  const handleCardClick = (noteDetails) => {
    if (noteDetails.isLocked) {
      setPendingAction({ type: "view", note: noteDetails });
      setEnteredPin("");
      setPinError("");
      setPinModalOpen(true);
    } else {
      setViewNoteModal({ isShown: true, data: noteDetails });
    }
  };

  const handleVerifyPin = async (e) => {
    if (e) e.preventDefault();
    if (!enteredPin || enteredPin.length !== 4) return;

    try {
      const res = await axios.post(
        `/api/note/verify-pin/${pendingAction.note._id}`,
        { pin: enteredPin },
        { withCredentials: true }
      );

      if (res.data.success) {
        setPinModalOpen(false);
        const decryptedNote = res.data.note;
        if (pendingAction.type === "edit") {
          handleOpenNoteInTab(decryptedNote);
        } else {
          setViewNoteModal({ isShown: true, data: decryptedNote });
        }
        setPendingAction(null);
      }
    } catch (err) {
      setPinError(err.response?.data?.message || "Incorrect PIN");
    }
  };

  const handlePinNote = async (note) => {
    try {
      const res = await axios.put(
        `/api/note/update-note-pinned/${note._id}`,
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
        `/api/note/edit/${note._id}`,
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
        `/api/note/edit/${note._id}`,
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
          `/api/note/delete/${note._id}`,
          { withCredentials: true }
        );
      } else {
        res = await axios.post(
          `/api/note/edit/${note._id}`,
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
    <div className="h-screen bg-bg flex flex-col transition-colors duration-300 relative overflow-hidden text-ink">
      <PageDecor variant="notes" />

      <Navbar
        userInfo={userInfo}
        handleClearSearch={handleClearSearch}
        onSearchNote={handleSearch}
      />

      <div className="flex-1 flex relative z-1 overflow-hidden">
        <Sidebar />

        {/* Main Notes Grid Area */}
        <main className="flex-1 p-4 sm:p-8 pb-24 sm:pb-8 overflow-y-auto">
          {/* Header Toolbar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-border pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink capitalize flex items-center gap-2">
                <LuFolderOpen className="text-accent-rust text-2xl" />
                {selectedTag ? `Tagged: #${selectedTag}` : `${currentFilter === 'all' ? 'Active' : currentFilter} Notes`}
              </h1>
              <p className="text-xs text-ink-muted mt-1 font-medium">
                Showing {allNotes.length} notes in this workspace
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Folder Filters */}
              <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border">
                {["all", "archive", "trash"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => selectFilter(filter)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                      currentFilter === filter && !selectedTag
                        ? "bg-accent-rust text-white"
                        : "text-ink-muted hover:bg-bg hover:text-ink"
                    }`}
                  >
                    {filter === 'all' ? 'Active' : filter}
                  </button>
                ))}
              </div>

              {selectedTag && (
                <button
                  onClick={() => selectFilter(currentFilter)}
                  className="text-xs font-bold text-accent-rust hover:underline cursor-pointer"
                >
                  Clear Tag
                </button>
              )}

              <button
                onClick={handleRefreshAll}
                className="p-2 bg-surface border border-border text-ink-muted hover:text-ink rounded-lg transition-all cursor-pointer"
                title="Refresh Grid"
              >
                <LuRefreshCw className="text-sm" />
              </button>
            </div>
          </div>

          {/* Sub-Header tags list */}
          {uniqueTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1"><LuTag /> Tags:</span>
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => selectTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedTag === tag
                      ? "bg-accent-rust text-white"
                      : "bg-surface border border-border text-ink-muted hover:bg-bg hover:text-ink"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

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
                  isLocked={note.isLocked}
                  onClickCard={() => handleCardClick(note)}
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
              <p className="text-center mt-4 text-ink-muted font-medium">
                {currentFilter === "all" ? "Ready to capture your ideas? Click the '+' button" : ""}
              </p>
            </div>
          )}
        </main>
      </div>
      <BottomBar />

      {/* Add Floating Action Button only if not viewing trash */}
      {currentFilter !== "trash" && (
        <button
          className="w-14 h-14 flex items-center justify-center rounded-full bg-accent-rust text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 fixed right-8 bottom-8 z-10 cursor-pointer"
          onClick={handleCreateNewNoteTab}
          title="Add Note"
        >
          <LuPlus className="text-2xl" />
        </button>
      )}

      {/* Add / Edit Note Modal */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={handleCloseModal}
        style={{
          overlay: {
            backgroundColor: "rgba(43, 37, 32, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 1000
          },
        }}
        contentLabel="Add/Edit Note"
        className="w-[70%] max-h-[85vh] bg-surface border border-border rounded-lg mx-auto mt-14 p-6 overflow-y-auto max-md:w-[85%] max-sm:w-[95%] shadow-xl transition-colors"
      >
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-border scrollbar-none">
          {editorTabs.map((tab) => {
            const isActive = tab._id === activeTabId;
            return (
              <div
                key={tab._id}
                onClick={() => setActiveTabId(tab._id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none shrink-0 ${
                  isActive
                    ? "bg-accent-rust text-white border-transparent shadow-sm"
                    : "bg-surface hover:bg-bg text-ink-muted border-border"
                }`}
              >
                <span>📓 {tab.title || "Untitled"}</span>
                <button
                  type="button"
                  onClick={(e) => handleCloseNoteTab(tab._id, e)}
                  className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  title="Close Tab"
                >
                  <LuX className="text-xs" />
                </button>
              </div>
            );
          })}
          
          {/* New Tab Button */}
          <button
            type="button"
            onClick={handleCreateNewNoteTab}
            className="flex items-center justify-center p-1.5 rounded-lg border border-dashed border-border text-ink-muted hover:text-accent-rust hover:border-accent-rust transition-colors cursor-pointer shrink-0"
            title="Open New Tab"
          >
            <LuPlus className="text-sm" />
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
            backgroundColor: "rgba(43, 37, 32, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 1000
          },
        }}
        contentLabel="View Note"
        className="w-[45%] max-h-[80vh] bg-surface border border-border rounded-lg mx-auto mt-14 p-6 overflow-y-auto max-md:w-[70%] max-sm:w-[90%] shadow-xl relative transition-colors"
      >
        {viewNoteModal.data && (
          <div className="relative flex flex-col gap-4 text-ink">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center absolute -top-2 -right-2 hover:bg-bg transition-colors cursor-pointer text-ink-muted"
              onClick={() => setViewNoteModal({ isShown: false, data: null })}
              title="Close"
            >
              <LuX className="text-xl" />
            </button>
            
            <div className="pr-8">
              <h2 className="text-2xl font-display font-bold text-ink leading-tight">
                {viewNoteModal.data.title}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-ink-muted font-semibold bg-bg px-2 py-0.5 rounded border border-border">
                  {moment(viewNoteModal.data.createdAt).format("Do MMM YYYY")}
                </span>
                {viewNoteModal.data.isPinned && (
                  <span className="text-[10px] text-accent-rust font-semibold bg-accent-rust/10 px-2 py-0.5 rounded border border-accent-rust/20">
                    Pinned
                  </span>
                )}
                {viewNoteModal.data.color && viewNoteModal.data.color !== "#ffffff" && (
                  <span 
                    className="w-4 h-4 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: viewNoteModal.data.color }}
                    title="Note Color"
                  />
                )}
              </div>
            </div>

            <div 
              className="mt-4 text-sm text-ink leading-relaxed max-h-[45vh] overflow-y-auto bg-bg p-4 rounded-lg border border-border"
              dangerouslySetInnerHTML={{ __html: viewNoteModal.data.content }}
            />

            {viewNoteModal.data.tags && viewNoteModal.data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {viewNoteModal.data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-accent-rust font-medium bg-accent-rust/10 px-2.5 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* PIN Lock Entry Modal */}
      <Modal
        isOpen={pinModalOpen}
        onRequestClose={() => { setPinModalOpen(false); setPendingAction(null); }}
        style={{
          overlay: {
            backgroundColor: "rgba(43, 37, 32, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 2000
          }
        }}
        contentLabel="Enter PIN"
        className="w-[320px] bg-surface border border-border rounded-lg mx-auto mt-24 p-5 shadow-xl text-ink relative"
      >
        <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
          <h3 className="font-display font-bold text-sm flex items-center gap-1.5 text-ink">
            🔒 Locked Private Note
          </h3>
          <button 
            onClick={() => { setPinModalOpen(false); setPendingAction(null); }}
            className="text-ink-muted hover:text-ink cursor-pointer"
          >
            <LuX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleVerifyPin} className="space-y-4">
          <p className="text-xs text-ink-muted text-center leading-relaxed">
            Please enter your 4-digit PIN code to view this note.
          </p>

          <input
            type="password"
            maxLength={4}
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className="w-full text-center text-2xl tracking-widest bg-bg border border-border text-ink rounded-lg py-2.5 outline-none font-bold focus:border-accent-rust"
            autoFocus
          />

          {pinError && <p className="text-accent-red text-center text-[10px] font-bold">{pinError}</p>}

          <button
            type="submit"
            disabled={enteredPin.length !== 4}
            className="btn-primary py-2.5 cursor-pointer font-bold text-xs uppercase tracking-wider disabled:opacity-50"
          >
            Unlock Note
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default Home;
