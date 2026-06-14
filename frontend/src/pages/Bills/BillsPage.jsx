import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import BottomBar from "../../components/BottomBar/BottomBar";
import PageDecor from "../../components/Doodles/PageDecor";
import { useAlert } from "../../components/Alert/AlertProvider";
import axios from "axios";
import moment from "moment";
import { 
  LuCalendar, 
  LuPlus, 
  LuTrash2, 
  LuSquareCheck, 
  LuCircleAlert, 
  LuRefreshCw,
  LuWallet
} from "react-icons/lu";

export default function BillsPage() {
  const alert = useAlert();
  const [bills, setBills] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Utilities");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState("monthly");
  const [loading, setLoading] = useState(false);

  const categories = ["Rent", "Electricity", "Water", "Internet", "Subscription", "Insurance", "EMI", "Other"];

  const fetchBills = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/bill/all", { withCredentials: true });
      if (res.data.success) {
        setBills(res.data.bills || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleAddBill = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || !dueDate) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/bill/add",
        {
          title,
          amount: Number(amount),
          dueDate,
          category,
          isRecurring,
          recurrenceInterval: isRecurring ? recurrenceInterval : null,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        setTitle("");
        setAmount("");
        setDueDate("");
        setIsRecurring(false);
        alert.show("Bill reminder added successfully", "success");
        fetchBills();
      }
    } catch (err) {
      alert.show("Error adding bill", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/bill/pay/${id}`, {}, { withCredentials: true });
      if (res.data.success) {
        alert.show("Bill marked as paid! Expense logged in Budget module.", "success");
        fetchBills();
      }
    } catch (err) {
      alert.show("Error processing bill payment", "error");
    }
  };

  const handleDeleteBill = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:3000/api/bill/delete/${id}`, { withCredentials: true });
      if (res.data.success) {
        alert.show("Bill reminder removed", "success");
        fetchBills();
      }
    } catch (err) {
      alert.show("Error deleting bill", "error");
    }
  };

  const today = moment().startOf("day");
  const unpaidBills = bills.filter((b) => !b.isPaid);
  const paidBills = bills.filter((b) => b.isPaid);

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
                <LuWallet className="text-accent-rust" /> Bills & Reminders
              </h1>
              <p className="text-xs text-ink-muted mt-1">
                Track subscription services, monthly utility payments, and outstanding invoices. Recurring bills auto-renew and log expense records inside the Budget dashboard on payment completion.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Add form */}
              <div className="lg:col-span-4 h-fit">
                <form onSubmit={handleAddBill} className="paper-card p-4 sm:p-5 shadow-sm">
                  <span className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block mb-4">
                    New Bill Reminder
                  </span>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">Bill Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Electric Bill, Rent"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">Amount ($)</label>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block mb-1">Due Date</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-rust"
                          required
                        />
                      </div>
                    </div>

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

                    <div className="pt-2 border-t border-border/50">
                      <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRecurring}
                          onChange={(e) => setIsRecurring(e.target.checked)}
                          className="accent-accent-rust"
                        />
                        <span>Is this a recurring bill?</span>
                      </label>
                    </div>

                    {isRecurring && (
                      <div className="bg-bg/50 p-2.5 rounded-lg border border-border">
                        <label className="text-[9px] font-mono font-bold text-accent-rust uppercase tracking-widest block mb-1">Interval</label>
                        <select
                          value={recurrenceInterval}
                          onChange={(e) => setRecurrenceInterval(e.target.value)}
                          className="w-full bg-surface border border-border text-ink rounded-lg px-3 py-1.5 text-xs outline-none focus:border-accent-rust"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-accent-rust hover:filter hover:brightness-110 text-white rounded-lg py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? "Adding..." : "Add Bill"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Bill display lists */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Unpaid section */}
                <div className="paper-card p-4 sm:p-5 shadow-sm">
                  <span className="text-[9px] font-mono font-bold text-accent-red uppercase tracking-widest block mb-4">
                    Outstanding Bills ({unpaidBills.length})
                  </span>
                  
                  {unpaidBills.length === 0 ? (
                    <p className="text-xs text-ink-muted italic">No unpaid bills. All settled!</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {unpaidBills.map((bill) => {
                        const billDue = moment(bill.dueDate);
                        const isOverdue = billDue.isBefore(today, "day");
                        return (
                          <div 
                            key={bill._id} 
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border bg-surface transition-all ${
                              isOverdue ? "border-accent-red/40 bg-accent-red/5" : "border-border"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {isOverdue ? (
                                  <LuCircleAlert className="text-accent-red text-lg animate-pulse" />
                                ) : (
                                  <LuCalendar className="text-accent-rust text-lg" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                                  {bill.title}
                                  {bill.isRecurring && (
                                    <span className="text-[8px] bg-accent-sage/10 text-accent-sage font-mono px-1.5 py-0.5 rounded border border-accent-sage/20 inline-flex items-center gap-0.5" title="Recurring bill">
                                      <LuRefreshCw className="text-[7px]" /> {bill.recurrenceInterval}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[10px] text-ink-muted mt-0.5">
                                  Category: {bill.category} • Due: {moment(bill.dueDate).format("ll")}
                                  {isOverdue && (
                                    <span className="text-accent-red font-bold ml-1.5">(Overdue!)</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-border/40">
                              <span className="font-mono text-xs font-bold text-ink bg-bg px-2.5 py-1 rounded border border-border">
                                ${bill.amount.toFixed(2)}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleMarkAsPaid(bill._id)}
                                  className="px-3 py-1.5 rounded-lg bg-accent-sage/10 border border-accent-sage/35 text-accent-sage hover:bg-accent-sage hover:text-white text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  <LuSquareCheck /> Paid
                                </button>
                                <button
                                  onClick={() => handleDeleteBill(bill._id)}
                                  className="p-1.5 rounded border border-border hover:text-accent-red hover:border-accent-red/35 transition-colors cursor-pointer"
                                  title="Delete reminder"
                                >
                                  <LuTrash2 className="text-xs" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Paid History section */}
                {paidBills.length > 0 && (
                  <div className="paper-card p-4 sm:p-5 shadow-sm">
                    <span className="text-[9px] font-mono font-bold text-accent-sage uppercase tracking-widest block mb-4">
                      Paid History ({paidBills.length})
                    </span>
                    
                    <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1">
                      {paidBills.map((bill) => (
                        <div 
                          key={bill._id} 
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-bg/20 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <LuSquareCheck className="text-accent-sage" />
                            <div>
                              <p className="font-semibold text-ink line-through">{bill.title}</p>
                              <p className="text-[9px] text-ink-muted">Due date: {moment(bill.dueDate).format("ll")}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] font-bold text-ink-muted bg-bg px-2 py-0.5 rounded">
                              ${bill.amount.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleDeleteBill(bill._id)}
                              className="text-ink-muted hover:text-accent-red transition-colors cursor-pointer"
                              title="Delete entry"
                            >
                              <LuTrash2 className="text-xs" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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
