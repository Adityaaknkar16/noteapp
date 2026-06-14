import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import BottomBar from "../../components/BottomBar/BottomBar";
import PageDecor from "../../components/Doodles/PageDecor";
import { useAlert } from "../../components/Alert/AlertProvider";
import axios from "axios";
import { 
  LuShoppingCart, 
  LuPlus, 
  LuTrash2, 
  LuSquareCheck, 
  LuSquare
} from "react-icons/lu";
import VoiceInput from "../../components/VoiceInput/VoiceInput";

export default function ShoppingListPage() {
  const alert = useAlert();
  const [itemsGrouped, setItemsGrouped] = useState({});
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemCategory, setItemCategory] = useState("Groceries");
  const [loading, setLoading] = useState(false);

  const categories = ["Groceries", "Vegetables", "Dairy", "Household", "Personal Care", "Other"];

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/shopping/all", { withCredentials: true });
      if (res.data.success) {
        setItemsGrouped(res.data.items || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e) => {
    if (e) e.preventDefault();
    if (!itemName.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/shopping/add",
        {
          name: itemName,
          quantity: itemQuantity,
          category: itemCategory,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        setItemName("");
        setItemQuantity("");
        fetchItems();
      }
    } catch (err) {
      alert.show("Error adding item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecked = async (id) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/shopping/toggle/${id}`, {}, { withCredentials: true });
      if (res.data.success) {
        fetchItems();
      }
    } catch (err) {
      alert.show("Error toggling item state", "error");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:3000/api/shopping/delete/${id}`, { withCredentials: true });
      if (res.data.success) {
        fetchItems();
      }
    } catch (err) {
      alert.show("Error deleting item", "error");
    }
  };

  const handleClearChecked = async () => {
    try {
      const res = await axios.delete("http://localhost:3000/api/shopping/clear-checked", { withCredentials: true });
      if (res.data.success) {
        alert.show("Cleared all checked items", "success");
        fetchItems();
      }
    } catch (err) {
      alert.show("Error clearing items", "error");
    }
  };

  const totalItemsCount = Object.values(itemsGrouped).reduce((sum, list) => sum + list.length, 0);
  const checkedItemsCount = Object.values(itemsGrouped).reduce(
    (sum, list) => sum + list.filter((item) => item.isChecked).length,
    0
  );

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors duration-300">
      <Navbar />
      
      <div className="flex flex-1 relative">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 md:p-8 relative pb-24 sm:pb-8">
          <PageDecor />
          
          <div className="max-w-4xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ink flex items-center gap-2">
                  <LuShoppingCart className="text-accent-rust" /> Shopping List
                </h1>
                <p className="text-xs text-ink-muted mt-1">
                  Manage household runs, grocery items, and shopping tasks.
                </p>
              </div>

              {checkedItemsCount > 0 && (
                <button
                  onClick={handleClearChecked}
                  className="px-4 py-2 border border-accent-red/35 text-accent-red hover:bg-accent-red/10 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-center"
                >
                  <LuTrash2 /> Clear Checked ({checkedItemsCount})
                </button>
              )}
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddItem} className="paper-card p-4 sm:p-5 mb-6 shadow-sm">
              <span className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block mb-3">
                Quick Add Item
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5 flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Item name (e.g. Milk, Bananas)"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                  />
                  <VoiceInput onTranscript={(text) => setItemName(prev => (prev ? prev + " " : "") + text)} />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Quantity (e.g. 2 liters)"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1 flex">
                  <button
                    type="submit"
                    disabled={loading || !itemName.trim()}
                    className="w-full bg-accent-rust hover:filter hover:brightness-110 text-white rounded-lg p-2 text-sm flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <LuPlus />
                  </button>
                </div>
              </div>
            </form>

            {/* Empty state */}
            {totalItemsCount === 0 ? (
              <div className="paper-card p-12 text-center shadow-sm">
                <LuShoppingCart className="text-4xl text-border mx-auto mb-3" />
                <h3 className="text-sm font-bold text-ink-muted">Your shopping list is empty</h3>
                <p className="text-xs text-ink-muted mt-1">Add items above to build your list.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(itemsGrouped).map(([category, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="paper-card p-4 sm:p-5 shadow-sm flex flex-col h-fit">
                      <h3 className="text-xs font-mono font-bold text-accent-rust uppercase tracking-widest border-b border-border pb-2 mb-3">
                        {category} ({items.length})
                      </h3>
                      
                      <div className="flex flex-col gap-2">
                        {items.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-b-0 group"
                          >
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => handleToggleChecked(item._id)}
                                className="text-lg text-ink-muted hover:text-accent-rust transition-colors cursor-pointer"
                              >
                                {item.isChecked ? (
                                  <LuSquareCheck className="text-accent-rust" />
                                ) : (
                                  <LuSquare />
                                )}
                              </button>
                              
                              <span
                                className={`text-xs ${
                                  item.isChecked
                                    ? "line-through text-ink-muted italic"
                                    : "text-ink font-semibold"
                                }`}
                              >
                                {item.name}
                                {item.quantity && (
                                  <span className="text-[10px] text-ink-muted font-normal ml-1.5 px-1.5 py-0.5 rounded bg-bg">
                                    {item.quantity}
                                  </span>
                                )}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-ink-muted hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                              title="Delete Item"
                            >
                              <LuTrash2 className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
