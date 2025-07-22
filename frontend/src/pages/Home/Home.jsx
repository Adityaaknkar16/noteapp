import React, { useState } from "react";
import Modal from "react-modal";
import { MdAdd } from "react-icons/md";
import Notecard from "../../components/Cards/Notecard";
import AddEditnotes from "./AddEditnotes";

Modal.setAppElement('#root');

function Home() {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [notes, setNotes] = useState([
    {
      _id: "1",
      title: "Morning Meeting",
      date: "22nd July 2025",
      content: "Prepare presentation for the morning meeting.",
      tags: ["#work"],
      isPinned: true,
    },
    {
      _id: "2",
      title: "Buy Groceries",
      date: "21st July 2025",
      content: "Milk, bread, eggs, and vegetables.",
      tags: ["#home"],
      isPinned: false,
    },
    {
      _id: "3",
      title: "React Project",
      date: "23rd July 2025",
      content: "Fix the modal bug in the Home component.",
      tags: ["#coding"],
      isPinned: true,
    },
  ]);

  const handleCloseModal = () => {
    setOpenAddEditModal({ isShown: false, type: "add", data: null });
  };

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  }

  return (
    <>
      <div className="container mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {notes.map((item) => (
            <Notecard
              key={item._id}
              title={item.title}
              date={item.date}
              content={item.content}
              tags={item.tags}
              isPinned={item.isPinned}
              onEdit={() => handleEdit(item)}
              onDelete={() => {}}
              onPinNote={() => {}}
            />
          ))}
        </div>
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#2BB5FF] hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
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
        />
      </Modal>
    </>
  );
}

export default Home;