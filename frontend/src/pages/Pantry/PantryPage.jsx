import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import BottomBar from "../../components/BottomBar/BottomBar";
import PageDecor from "../../components/Doodles/PageDecor";
import { useAlert } from "../../components/Alert/AlertProvider";
import axios from "axios";
import { 
  LuPlus, 
  LuMinus, 
  LuTrash2, 
  LuShoppingCart, 
  LuCircleAlert,
  LuSparkles
} from "react-icons/lu";

export default function PantryPage() {
  const alert = useAlert();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("pcs");
  const [category, setCategory] = useState("Groceries");
  const [lowStockThreshold, setLowStockThreshold] = useState(1);
  const [loading, setLoading] = useState(false);

  const categories = ["Groceries", "Vegetables", "Dairy", "Household", "Snacks", "Spices", "Other"];
  const units = ["pcs", "kg", "grams", "liters", "ml", "packs", "cans", "bottles"];

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/pantry/all", { withCredentials: true });
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/pantry/add",
        {
          name,
          category,
          quantity: Number(quantity),
          unit,
          lowStockThreshold: Number(lowStockThreshold),
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        setName("");
        setQuantity(1);
        setLowStockThreshold(1);
        alert.show("Pantry item added", "success");
        fetchItems();
      }
    } catch (err) {
      alert.show("Error adding pantry item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (item, change) => {
    const newQuantity = Math.max(0, item.quantity + change);
    try {
      const res = await axios.post(
        `http://localhost:3000/api/pantry/edit/${item._id}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      if (res.data.success) {
        fetchItems();
      }
    } catch (err) {
      alert.show("Error updating quantity", "error");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:3000/api/pantry/delete/${id}`, { withCredentials: true });
      if (res.data.success) {
        alert.show("Item removed from pantry", "success");
        fetchItems();
      }
    } catch (err) {
      alert.show("Error deleting item", "error");
    }
  };

  const handleAddToShoppingList = async (item) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/shopping/add",
        {
          name: item.name,
          quantity: `Needs refill`,
          category: item.category,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        alert.show(`Added ${item.name} to Shopping List`, "success");
      }
    } catch (err) {
      alert.show("Error adding to shopping list", "error");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors duration-300">
      <Navbar />
      
      <div className="flex flex-1 relative">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 md:p-8 relative pb-24 sm:pb-8">
          <PageDecor />
          
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-ink flex items-center gap-2">
                <LuSparkles className="text-accent-rust" /> Pantry Inventory
              </h1>
              <p className="text-xs text-ink-muted mt-1">
                Track ingredients, food stock, and daily inventory levels with auto low-stock triggers.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form */}
              <div className="lg:col-span-4 h-fit">
                <form onSubmit={handleAddItem} className="paper-card p-4 sm:p-5 shadow-sm">
                  <span className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block mb-4">
                    New Pantry Item
                  </span>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">Item Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Olive Oil, Basmati Rice"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">Unit</label>
                        <select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                        >
                          {units.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">Initial Qty</label>
                        <input
                          type="number"
                          min="0"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">Low Threshold</label>
                        <input
                          type="number"
                          min="0"
                          value={lowStockThreshold}
                          onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                          className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !name.trim()}
                      className="w-full bg-accent-rust hover:filter hover:brightness-110 text-white rounded-lg py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? "Adding..." : "Add to Pantry"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Grid list */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {items.length === 0 ? (
                  <div className="paper-card p-12 text-center shadow-sm">
                    <LuSparkles className="text-4xl text-border mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-ink-muted">No pantry items recorded</h3>
                    <p className="text-xs text-ink-muted mt-1">Use the panel on the left to add items to your pantry.</p>
                  </div>
                ) : (
                  <div className="paper-card shadow-sm overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border bg-surface/50 text-[10px] uppercase font-mono font-bold text-ink-muted">
                          <th className="p-4">Item</th>
                          <th className="p-4">Category</th>
                          <th className="p-4 text-center">Quantity</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 text-xs">
                        {items.map((item) => {
                          const isLowStock = item.quantity <= item.lowStockThreshold;
                          return (
                            <tr key={item._id} className="hover:bg-surface/30 transition-colors">
                              <td className="p-4 font-semibold text-ink">{item.name}</td>
                              <td className="p-4 text-ink-muted">{item.category}</td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleUpdateQuantity(item, -1)}
                                    className="p-1 rounded bg-bg border border-border text-ink-muted hover:text-accent-rust hover:border-accent-rust transition-colors cursor-pointer"
                                  >
                                    <LuMinus className="text-[10px]" />
                                  </button>
                                  <span className="font-mono font-bold w-12 text-center text-ink">
                                    {item.quantity} <span className="text-[9px] font-normal text-ink-muted">{item.unit}</span>
                                  </span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item, 1)}
                                    className="p-1 rounded bg-bg border border-border text-ink-muted hover:text-accent-rust hover:border-accent-rust transition-colors cursor-pointer"
                                  >
                                    <LuPlus className="text-[10px]" />
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                {isLowStock ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-accent-red/10 text-accent-red border border-accent-red/20 animate-pulse">
                                    <LuCircleAlert className="text-[10px]" /> Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-accent-sage/10 text-accent-sage border border-accent-sage/20">
                                    Optimal
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isLowStock && (
                                    <button
                                      onClick={() => handleAddToShoppingList(item)}
                                      className="p-1.5 rounded bg-accent-rust/10 border border-accent-rust/35 text-accent-rust hover:bg-accent-rust hover:text-white transition-all cursor-pointer"
                                      title="Add to Shopping List"
                                    >
                                      <LuShoppingCart className="text-xs" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteItem(item._id)}
                                    className="p-1.5 rounded bg-bg border border-border/50 text-ink-muted hover:text-accent-red hover:border-accent-red/35 transition-colors cursor-pointer"
                                    title="Remove Item"
                                  >
                                    <LuTrash2 className="text-xs" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
