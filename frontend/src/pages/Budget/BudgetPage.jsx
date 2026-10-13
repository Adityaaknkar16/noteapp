import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import PageDecor from "../../components/Doodles/PageDecor";
import BottomBar from "../../components/BottomBar/BottomBar";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useSelector } from "react-redux";
import apiClient from "../../api/apiClient";
import moment from "moment";
import { useAlert } from "../../components/Alert/AlertProvider";
import { 
  LuPlus, 
  LuTrendingUp, 
  LuTrendingDown, 
  LuPiggyBank, 
  LuWallet, 
  LuCalculator, 
  LuPenLine, 
  LuTrash2, 
  LuDownload,
  LuFileSpreadsheet,
  LuX,
  LuCheck,
  LuRefreshCw
} from "react-icons/lu";

const DEFAULT_EXPENSE_CATEGORIES = [
  "Groceries", 
  "Utilities", 
  "Rent", 
  "Transportation", 
  "Entertainment", 
  "Dining Out",
  "Healthcare",
  "Education", 
  "Shopping",
  "Other"
];

const DEFAULT_INCOME_CATEGORIES = [
  "Salary", 
  "Freelance", 
  "Business", 
  "Investments", 
  "Gift", 
  "Other"
];

const DEFAULT_SAVING_CATEGORIES = [
  "Emergency Fund", 
  "Travel Fund", 
  "Retirement", 
  "Investments", 
  "General Savings",
  "Other"
];

const CHART_COLORS = ["#d97736", "#4a7c59", "#d4a373", "#4361ee", "#9c6b8c", "#2a9d8f", "#e76f51", "#7209b7"];

export default function BudgetPage() {
  const alert = useAlert();
  const { currentUser } = useSelector((state) => state.user);

  const [viewMonth, setViewMonth] = useState(moment().format("YYYY-MM"));
  const [type, setType] = useState("expense"); // "expense" | "income" | "saving"
  const [category, setCategory] = useState("Groceries");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  
  const [customCategories, setCustomCategories] = useState(DEFAULT_EXPENSE_CATEGORIES);
  const [newCatInput, setNewCatInput] = useState("");

  // Real data states from API
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalSavings: 0,
    balance: 0,
    categoryBreakdown: []
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingTx, setEditingTx] = useState(null);
  const [editFormData, setEditFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    note: "",
    date: ""
  });

  // Mini Calculator Modal State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInput, setCalcInput] = useState("");

  // Sync category options whenever 'type' changes
  useEffect(() => {
    if (type === "expense") {
      setCustomCategories(DEFAULT_EXPENSE_CATEGORIES);
      setCategory(DEFAULT_EXPENSE_CATEGORIES[0]);
    } else if (type === "income") {
      setCustomCategories(DEFAULT_INCOME_CATEGORIES);
      setCategory(DEFAULT_INCOME_CATEGORIES[0]);
    } else if (type === "saving") {
      setCustomCategories(DEFAULT_SAVING_CATEGORIES);
      setCategory(DEFAULT_SAVING_CATEGORIES[0]);
    }
  }, [type]);

  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, txRes] = await Promise.all([
        apiClient.get(`/api/budget/summary?month=${viewMonth}`),
        apiClient.get(`/api/budget/all?month=${viewMonth}`)
      ]);

      if (sumRes.data?.success && sumRes.data.summary) {
        setSummary(sumRes.data.summary);
      }
      if (txRes.data?.success && txRes.data.transactions) {
        setTransactions(txRes.data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch budget data:", err);
    } finally {
      setLoading(false);
    }
  }, [viewMonth]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (trimmed && !customCategories.includes(trimmed)) {
      setCustomCategories([...customCategories, trimmed]);
      setCategory(trimmed);
      setNewCatInput("");
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert.show("Please enter a valid amount", "error");
      return;
    }
    if (!date) {
      alert.show("Please select a date", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post("/api/budget/add", {
        type,
        category,
        amount: Number(amount),
        note: note.trim(),
        date
      });

      if (res.data?.success) {
        alert.show("Transaction added successfully", "success");
        setAmount("");
        setNote("");
        fetchBudgetData();
      }
    } catch (err) {
      alert.show(err.response?.data?.message || "Failed to add transaction", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const res = await apiClient.delete(`/api/budget/delete/${transactionId}`);
      if (res.data?.success) {
        alert.show("Transaction deleted successfully", "success");
        fetchBudgetData();
      }
    } catch (err) {
      alert.show(err.response?.data?.message || "Failed to delete transaction", "error");
    }
  };

  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    setEditFormData({
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      note: tx.note || "",
      date: tx.date
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.amount || Number(editFormData.amount) <= 0) {
      alert.show("Please enter a valid amount", "error");
      return;
    }

    try {
      const res = await apiClient.put(`/api/budget/edit/${editingTx._id}`, {
        type: editFormData.type,
        category: editFormData.category,
        amount: Number(editFormData.amount),
        note: editFormData.note.trim(),
        date: editFormData.date
      });

      if (res.data?.success) {
        alert.show("Transaction updated successfully", "success");
        setEditingTx(null);
        fetchBudgetData();
      }
    } catch (err) {
      alert.show(err.response?.data?.message || "Failed to update transaction", "error");
    }
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      alert.show("No transaction records to export for this month", "error");
      return;
    }

    const headers = ["Date", "Type", "Category", "Amount", "Note"];
    const rows = transactions.map(t => [
      `"${t.date}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      `"${t.amount}"`,
      `"${(t.note || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `budget_${viewMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert.show("Budget report exported to CSV", "success");
  };

  const handleCalcEval = () => {
    try {
      const sanitized = calcInput.replace(/\s+/g, "");
      if (!sanitized) return;
      if (!/^[0-9+\-*/.]+$/.test(sanitized)) {
        alert.show("Invalid calculation characters", "error");
        return;
      }
      // Simple safe mathematical evaluator
      const tokens = sanitized.match(/(\d+(\.\d+)?|[+\-*/])/g);
      if (!tokens) return;
      let total = parseFloat(tokens[0]);
      for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i];
        const nextVal = parseFloat(tokens[i + 1]);
        if (isNaN(nextVal)) break;
        if (op === "+") total += nextVal;
        else if (op === "-") total -= nextVal;
        else if (op === "*") total *= nextVal;
        else if (op === "/" && nextVal !== 0) total /= nextVal;
      }
      if (!isNaN(total) && isFinite(total)) {
        const rounded = Math.round(total * 100) / 100;
        setAmount(String(rounded));
        setShowCalculator(false);
        setCalcInput("");
        alert.show(`Calculated: ${rounded}`, "success");
      }
    } catch {
      alert.show("Calculation error", "error");
    }
  };

  const savingsList = transactions.filter((t) => t.type === "saving");

  return (
    <div className="h-screen bg-bg flex flex-col text-ink transition-colors duration-300 relative overflow-hidden">
      <PageDecor variant="subjects" />

      <Navbar userInfo={currentUser} />

      <div className="flex-1 flex max-md:flex-col relative z-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 pb-24 sm:pb-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border pb-4 flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">Personal Budget</h1>
                <p className="text-xs text-ink-muted mt-1">Track your spending, savings log, and spreadsheet goals</p>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="month" 
                  value={viewMonth}
                  onChange={(e) => setViewMonth(e.target.value)}
                  className="bg-surface border border-border px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-ink outline-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={fetchBudgetData}
                  className="bg-surface border border-border p-2 rounded-lg text-xs text-ink hover:text-accent-rust transition-colors cursor-pointer"
                  title="Refresh budget"
                >
                  <LuRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Step 1: Add Entry Form & Monthly Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Card (5 cols) */}
              <form onSubmit={handleAddTransaction} className="lg:col-span-5 paper-card p-4 sm:p-5 border border-border flex flex-col gap-4">
                <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest border-b border-border pb-2">Add New Transaction</h3>
                
                {/* Segmented Type Toggle */}
                <div className="flex bg-bg p-1 rounded-lg border border-border">
                  {["expense", "income", "saving"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                        type === t 
                          ? (t === "expense" ? "bg-accent-rust text-white" : t === "saving" ? "bg-accent-blue text-white" : "bg-accent-sage text-white") 
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Form Inputs */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2.5 flex-wrap sm:flex-nowrap">
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Date</label>
                      <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        className="input-box text-xs bg-surface"
                        required
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Amount</label>
                      <div className="relative flex items-center">
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input-box text-xs bg-surface pr-10"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowCalculator(!showCalculator)}
                          className="absolute right-2 text-ink-muted hover:text-accent-rust p-1 cursor-pointer"
                          title="Open Quick Calculator"
                        >
                          <LuCalculator className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Calculator Popover */}
                  {showCalculator && (
                    <div className="p-3 bg-surface border border-border rounded-lg flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">Quick Calculator</span>
                        <button type="button" onClick={() => setShowCalculator(false)} className="text-ink-muted hover:text-ink"><LuX className="text-xs" /></button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="e.g. 1500 + 450 * 2" 
                        value={calcInput} 
                        onChange={(e) => setCalcInput(e.target.value)}
                        className="input-box text-xs py-1 bg-bg font-mono"
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCalcEval(); } }}
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={handleCalcEval} className="btn-primary py-1 px-3 text-xs flex-1">Apply to Amount</button>
                        <button type="button" onClick={() => setCalcInput("")} className="bg-bg border border-border py-1 px-2 text-xs rounded text-ink-muted hover:text-ink">Clear</button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-box text-xs bg-surface select-none outline-none w-full"
                    >
                      {customCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    
                    <div className="flex gap-1.5 mt-2">
                      <input 
                        type="text" 
                        placeholder="New custom category..." 
                        value={newCatInput} 
                        onChange={(e) => setNewCatInput(e.target.value)}
                        className="input-box text-xs py-1.5 bg-surface"
                      />
                      <button 
                        type="button"
                        onClick={handleAddCategory}
                        className="btn-primary py-1.5 px-3 text-xs w-auto whitespace-nowrap"
                      >
                        Add Custom
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Note (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Electricity bill for May" 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="input-box text-xs bg-surface"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary w-full mt-2 font-bold flex items-center justify-center gap-1.5"
                  >
                    <LuPlus className="text-sm" /> {submitting ? "Adding..." : "Add Transaction"}
                  </button>
                </div>
              </form>

              {/* Summary Cards and Charts Row (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* 4 Summary Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="paper-card p-4 border border-border flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1">
                      <LuTrendingUp className="text-accent-sage" /> Income
                    </span>
                    <span className="text-base font-mono font-bold text-accent-sage mt-2">{formatCurrency(summary.totalIncome)}</span>
                  </div>

                  <div className="paper-card p-4 border border-border flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1">
                      <LuTrendingDown className="text-accent-rust" /> Spending
                    </span>
                    <span className="text-base font-mono font-bold text-accent-rust mt-2">{formatCurrency(summary.totalExpense)}</span>
                  </div>

                  <div className="paper-card p-4 border border-border flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1">
                      <LuPiggyBank className="text-accent-blue" /> Saved
                    </span>
                    <span className="text-base font-mono font-bold text-accent-blue mt-2">{formatCurrency(summary.totalSavings)}</span>
                  </div>

                  <div className="paper-card p-4 border border-border flex flex-col justify-between bg-surface/50">
                    <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1">
                      <LuWallet className="text-ink" /> Balance
                    </span>
                    <span className={`text-base font-mono font-bold mt-2 ${summary.balance < 0 ? "text-accent-rust" : "text-ink"}`}>
                      {formatCurrency(summary.balance)}
                    </span>
                  </div>
                </div>

                {/* Donut Chart or Clean Empty State */}
                {summary.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
                  <div className="paper-card p-4 sm:p-5 border border-border flex items-center justify-between flex-wrap md:flex-nowrap gap-4">
                    <div className="flex-1 w-full min-w-[200px]">
                      <h4 className="text-xs font-mono font-bold text-ink-muted uppercase tracking-widest mb-3">Expenses by Category</h4>
                      <div className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={summary.categoryBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={3}
                              dataKey="total"
                            >
                              {summary.categoryBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Legend listing */}
                    <div className="flex flex-col gap-2 shrink-0 pr-4 w-full md:w-auto max-h-[160px] overflow-y-auto">
                      {summary.categoryBreakdown.map((item, idx) => (
                        <div key={item.category} className="flex items-center gap-2 text-xs font-medium">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          <span className="text-ink-muted">{item.category}:</span>
                          <span className="font-mono font-bold">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="paper-card p-6 border border-border flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-accent-rust/10 flex items-center justify-center text-accent-rust">
                      <LuWallet className="text-2xl" />
                    </div>
                    <h4 className="text-sm font-semibold font-display">No expenses recorded for this month</h4>
                    <p className="text-xs text-ink-muted max-w-sm">
                      Log your daily expenses using the form on the left to visualize your spending breakdown here.
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Step 2: Daily Ledger */}
            <div className="paper-card p-4 sm:p-6 border border-border">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest">
                  Daily Ledger ({moment(viewMonth).format("MMMM YYYY")})
                </h3>
                <span className="text-xs text-ink-muted font-mono">{transactions.length} record(s)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border text-ink-muted uppercase font-mono font-semibold tracking-wider">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Type</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Note</th>
                      <th className="py-2.5 text-right">Amount</th>
                      <th className="py-2.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-ink-muted italic">
                          No transactions found for {moment(viewMonth).format("MMMM YYYY")}. Add a new transaction above.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx._id} className="border-b border-border/40 hover:bg-bg/30">
                          <td className="py-3 font-mono font-medium">{tx.date}</td>
                          <td className="py-3 capitalize">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tx.type === "expense" ? "bg-accent-rust/10 text-accent-rust" :
                              tx.type === "saving" ? "bg-accent-blue/10 text-accent-blue" :
                              "bg-accent-sage/10 text-accent-sage"
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 font-bold">{tx.category}</td>
                          <td className="py-3 text-ink-muted italic">{tx.note || "—"}</td>
                          <td className={`py-3 text-right font-mono font-bold ${
                            tx.type === "expense" ? "text-accent-rust" :
                            tx.type === "saving" ? "text-accent-blue" :
                            "text-accent-sage"
                          }`}>
                            {tx.type === "expense" ? "-" : "+"}{formatCurrency(tx.amount)}
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleOpenEdit(tx)}
                                className="text-ink-muted hover:text-accent-rust p-1 cursor-pointer"
                                title="Edit transaction"
                              >
                                <LuPenLine className="text-sm" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTransaction(tx._id)}
                                className="text-ink-muted hover:text-accent-red p-1 cursor-pointer"
                                title="Delete transaction"
                              >
                                <LuTrash2 className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 3: Savings Tracker (Spreadsheet View) */}
            <div className="paper-card p-4 sm:p-6 border border-border">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1.5">
                    <LuFileSpreadsheet className="text-accent-blue" /> Savings Tracker (Spreadsheet View)
                  </h3>
                  <p className="text-[11px] text-ink-muted mt-0.5">Auto-synced from your savings deposits for this month</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setType("saving");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="btn-primary py-1.5 px-3 w-auto text-xs font-bold flex items-center gap-1"
                  >
                    <LuPlus className="text-sm" /> Add Saving
                  </button>
                  <button 
                    type="button"
                    onClick={handleExportCSV}
                    className="bg-surface border border-border text-ink hover:bg-bg transition-colors py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LuDownload className="text-sm" /> Export to CSV
                  </button>
                </div>
              </div>

              {/* Excel Grid */}
              <div className="overflow-x-auto border border-border rounded-lg bg-surface">
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-bg border-b border-border font-mono font-bold text-ink-muted tracking-wider">
                      <th className="py-2.5 px-4 border-r border-border">Date</th>
                      <th className="py-2.5 px-4 border-r border-border">Category / Goal</th>
                      <th className="py-2.5 px-4 border-r border-border text-right">Amount</th>
                      <th className="py-2.5 px-4 border-r border-border">Note</th>
                      <th className="py-2.5 px-4 text-right">Running Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-ink-muted italic">
                          No savings deposits logged for {moment(viewMonth).format("MMMM YYYY")}. Log an entry with type "saving" to start tracking.
                        </td>
                      </tr>
                    ) : (
                      savingsList.map((row, index) => {
                        const runningTotal = savingsList.slice(0, index + 1).reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
                        return (
                          <tr key={row._id} className="border-b border-border/40 hover:bg-bg/25">
                            <td className="py-2.5 px-4 border-r border-border font-mono bg-surface hover:bg-bg/10">{row.date}</td>
                            <td className="py-2.5 px-4 border-r border-border font-semibold bg-surface hover:bg-bg/10">{row.category}</td>
                            <td className="py-2.5 px-4 border-r border-border font-mono text-right text-accent-blue bg-surface hover:bg-bg/10">{formatCurrency(row.amount)}</td>
                            <td className="py-2.5 px-4 border-r border-border italic text-ink-muted bg-surface hover:bg-bg/10">{row.note || "—"}</td>
                            <td className="py-2.5 px-4 font-mono font-bold text-right bg-bg/10">{formatCurrency(runningTotal)}</td>
                          </tr>
                        );
                      })
                    )}
                    {/* Totals Row */}
                    {savingsList.length > 0 && (
                      <tr className="bg-bg/40 font-bold border-t border-border">
                        <td className="py-3 px-4 border-r border-border uppercase font-mono tracking-wider" colSpan={2}>Total Savings</td>
                        <td className="py-3 px-4 border-r border-border font-mono text-right text-accent-blue">
                          {formatCurrency(savingsList.reduce((acc, r) => acc + (Number(r.amount) || 0), 0))}
                        </td>
                        <td className="py-3 px-4 border-r border-border"></td>
                        <td className="py-3 px-4 font-mono text-right text-accent-blue">
                          {formatCurrency(savingsList.reduce((acc, r) => acc + (Number(r.amount) || 0), 0))}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
      <BottomBar />

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-base text-ink">Edit Transaction</h3>
              <button 
                type="button" 
                onClick={() => setEditingTx(null)}
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <LuX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Type</label>
                <div className="flex bg-bg p-1 rounded-lg border border-border">
                  {["expense", "income", "saving"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, type: t })}
                      className={`flex-1 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer ${
                        editFormData.type === t 
                          ? (t === "expense" ? "bg-accent-rust text-white" : t === "saving" ? "bg-accent-blue text-white" : "bg-accent-sage text-white") 
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Date</label>
                  <input 
                    type="date" 
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="input-box text-xs bg-bg"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Amount</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    className="input-box text-xs bg-bg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Category</label>
                <input 
                  type="text" 
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="input-box text-xs bg-bg"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Note (Optional)</label>
                <input 
                  type="text" 
                  value={editFormData.note}
                  onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                  className="input-box text-xs bg-bg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 bg-bg border border-border py-2 text-xs font-semibold rounded-lg text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-2 text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
