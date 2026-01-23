import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { MdAdd } from "react-icons/md";
import Notecard from "../../components/Cards/Notecard";
import AddEditnotes from "./AddEditnotes";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import EmptyCard from "../../components/EmptyCard/Empty";

Modal.setAppElement("#root");

function Home() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser?.rest);
      getAllNotes();
    }
  }, []);

  const getAllNotes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/note/all", {
        withCredentials: true,
      });

      if (!res.data.success) {
        toast.error(res.data.message || "Failed to fetch notes");
        return;
      }

      setAllNotes(res.data.notes || []);
    } catch (error) {
      toast.error(error.message || "Error fetching notes");
    }
  };

  const handleCloseModal = () => {
    setOpenAddEditModal({ isShown: false, type: "add", data: null });
  };

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/note/delete/${noteId}`,
        { withCredentials: true }
      );

      if (!res.data.success) {
        toast.error(res.data.message || "Failed to delete note");
      } else {
        toast.success(res.data.message || "Note deleted");
        getAllNotes();
      }
    } catch (error) {
      toast.error(error.message || "Error deleting note");
    }
  };

  const onSearchNote = async (query) => {
    if (!query) return;

    try {
      const res = await axios.get("http://localhost:3000/api/note/search", {
        params: { query },
        withCredentials: true,
      });

      if (!res.data.success) {
        toast.error(res.data.message || "Search failed");
        return;
      }

      setIsSearch(true);
      setAllNotes(res.data.notes);
    } catch (error) {
      toast.error(error.message || "Error during search");
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  return (
    <>
      <Navbar
        userInfo={userInfo}
        handleClearSearch={handleClearSearch}
        onSearchNote={onSearchNote}
      />

      <div className="container mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {allNotes.map((note) => (
              <Notecard
                key={note._id}
                title={note.title}
                date={note.create}
                content={note.content}
                tags={note.tags}
                isPinned={note.isPinned}
                onEdit={() => handleEdit(note)}
                onDelete={() => deleteNote(note)}
                onPinNote={() => {}}
              />
            ))}
          </div>
        ) : (
          <>
            <EmptyCard
              imgSrc="data:image/jpeg;base64,..."
              message="Ready to capture your ideas? Click the 'Add' button"
            />
            <p className="text-center mt-8 text-gray-500">No notes found.</p>
          </>
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#2BB5FF] hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() =>
          setOpenAddEditModal({ isShown: true, type: "add", data: null })
        }
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={handleCloseModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel="Add/Edit Note"
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-y-auto max-md:w-[60%] max-sm:w-[70%]"
      >
        <AddEditnotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={handleCloseModal}
          getAllNotes={getAllNotes}
        />
      </Modal>
    </>
  );
}

export default Home;