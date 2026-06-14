import React, { useEffect, useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import BottomBar from "../../components/BottomBar/BottomBar";
import DrawingCanvas from "../../components/DrawingCanvas/DrawingCanvas";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import {
  LuPlus,
  LuTrash2,
  LuX,
  LuSave,
  LuPencil,
  LuDownload
} from "react-icons/lu";
import moment from "moment";

export default function SketchpadPage() {
  const navigate = useNavigate();
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);

  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDrawing, setEditingDrawing] = useState(null); // null if new sketch
  const [sketchTitle, setSketchTitle] = useState("Untitled Sketch");
  const [initialImage, setInitialImage] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      fetchDrawings();
    }
  }, [currentUser]);

  const fetchDrawings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/drawing/all", {
        withCredentials: true,
      });
      if (res.data.success) {
        setDrawings(res.data.drawings);
      }
    } catch (error) {
      console.error(error);
      alert.show("Failed to fetch sketches", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingDrawing(null);
    setSketchTitle("Untitled Sketch");
    setInitialImage(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (drawing) => {
    setEditingDrawing(drawing);
    setSketchTitle(drawing.title);
    setInitialImage(drawing.imageData);
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    const imageData = canvasRef.current.exportImage();

    if (!imageData) {
      alert.show("Sketch is empty!", "error");
      return;
    }

    try {
      if (editingDrawing) {
        // Update existing drawing
        const res = await axios.post(
          `http://localhost:3000/api/drawing/edit/${editingDrawing._id}`,
          {
            title: sketchTitle,
            imageData,
          },
          { withCredentials: true }
        );
        if (res.data.success) {
          alert.show("Sketch updated successfully", "success");
        }
      } else {
        // Create new drawing
        const res = await axios.post(
          "http://localhost:3000/api/drawing/add",
          {
            title: sketchTitle,
            imageData,
          },
          { withCredentials: true }
        );
        if (res.data.success) {
          alert.show("Sketch saved successfully", "success");
        }
      }
      setEditorOpen(false);
      fetchDrawings();
    } catch (error) {
      console.error(error);
      alert.show("Failed to save sketch", "error");
    }
  };

  const handleDelete = async (e, drawingId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this sketch?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:3000/api/drawing/delete/${drawingId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        alert.show("Sketch deleted successfully", "success");
        fetchDrawings();
      }
    } catch (error) {
      console.error(error);
      alert.show("Failed to delete sketch", "error");
    }
  };

  const handleDownload = (e, drawing) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = drawing.imageData;
    link.download = `${drawing.title.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-bg transition-colors overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />

        {/* ── Main Canvas/Gallery View Area ── */}
        <main className="flex-1 p-6 overflow-y-auto pb-24 sm:pb-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* Header section */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-ink">Sketchpad</h1>
                <p className="text-sm text-ink-muted">Create hand-drawn drawings and doodles.</p>
              </div>
              {!editorOpen && (
                <button
                  onClick={handleOpenNew}
                  className="btn-primary flex items-center gap-2 cursor-pointer"
                >
                  <LuPlus className="text-lg" />
                  <span>New Sketch</span>
                </button>
              )}
            </div>

            {editorOpen ? (
              /* ── Full Drawing Editor Screen ── */
              <div className="paper-card border border-border p-6 flex flex-col gap-4 bg-surface rounded-xl shadow-md h-[calc(100vh-220px)] min-h-[500px]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <LuPencil className="text-accent-rust text-xl shrink-0" />
                    <input
                      type="text"
                      value={sketchTitle}
                      onChange={(e) => setSketchTitle(e.target.value)}
                      className="text-xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-accent-rust focus:outline-none py-1 w-full text-ink"
                      placeholder="Untitled Sketch"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditorOpen(false)}
                      className="btn-secondary py-1.5 px-3 flex items-center gap-1 text-sm font-semibold cursor-pointer"
                    >
                      <LuX />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn-primary py-1.5 px-3 flex items-center gap-1 text-sm font-semibold cursor-pointer"
                    >
                      <LuSave />
                      <span>Save Sketch</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <DrawingCanvas ref={canvasRef} initialImage={initialImage} />
                </div>
              </div>
            ) : (
              /* ── Grid Gallery Screen ── */
              <div>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="paper-card border border-border h-64 bg-surface/50 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : drawings.length === 0 ? (
                  <div className="paper-card border border-border p-12 text-center flex flex-col items-center justify-center gap-4 bg-surface rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-accent-rust/10 flex items-center justify-center text-accent-rust">
                      <LuPencil className="text-3xl" />
                    </div>
                    <h3 className="text-lg font-bold text-ink">No sketches yet</h3>
                    <p className="text-sm text-ink-muted max-w-sm">
                      Start your first canvas sketch. Express yourself with natural pressure strokes, highlighters, or grid paper backdrops.
                    </p>
                    <button
                      onClick={handleOpenNew}
                      className="btn-primary flex items-center gap-2 mt-2 cursor-pointer"
                    >
                      <LuPlus />
                      <span>Create Sketch</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {drawings.map((drawing) => (
                      <div
                        key={drawing._id}
                        onClick={() => handleOpenEdit(drawing)}
                        className="paper-card border border-border bg-surface hover:shadow-md transition-all cursor-pointer rounded-xl overflow-hidden group flex flex-col"
                      >
                        {/* Thumbnail */}
                        <div className="aspect-[4/3] bg-bg/50 border-b border-border flex items-center justify-center overflow-hidden relative">
                          <img
                            src={drawing.imageData}
                            alt={drawing.title}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                          
                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                              onClick={(e) => handleDownload(e, drawing)}
                              className="p-2 bg-surface text-ink hover:text-accent-rust rounded-full shadow-md cursor-pointer transition-transform hover:scale-110"
                              title="Download PNG"
                            >
                              <LuDownload className="text-lg" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, drawing._id)}
                              className="p-2 bg-surface text-ink hover:text-accent-red rounded-full shadow-md cursor-pointer transition-transform hover:scale-110"
                              title="Delete Sketch"
                            >
                              <LuTrash2 className="text-lg" />
                            </button>
                          </div>
                        </div>

                        {/* Title and metadata */}
                        <div className="p-4 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-ink truncate text-sm" title={drawing.title}>
                              {drawing.title}
                            </h4>
                            <p className="text-[10px] text-ink-muted mt-0.5">
                              Edited: {moment(drawing.updatedAt).format("MMM DD, YYYY h:mm A")}
                            </p>
                          </div>
                          <LuPencil className="text-ink-muted group-hover:text-accent-rust text-base shrink-0 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
        <BottomBar />
      </div>
    </div>
  );
}
