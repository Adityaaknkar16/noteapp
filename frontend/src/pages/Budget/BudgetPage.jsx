import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import PageDecor from "../../components/Doodles/PageDecor";
import BottomBar from "../../components/BottomBar/BottomBar";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
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
  LuFileSpreadsheet
} from "react-icons/lu";

// Placeholder data for design review
const MOCK_CATEGORIES = ["Groceries", "Utilities", "Rent", "Transportation", "Entertainment", "Education", "Other"];
const MOCK_SUMMARY = {
  totalIncome: 75000,
  totalExpense: 32400,
  totalSavings: 15000,
  balance: 27600,
  categoryBreakdown: [
    { category: "Groceries", total: 8400 },
    { category: "Utilities", total: 4500 },
    { category: "Rent", total: 15000 },
    { category: "Transportation", total: 2500 },
    { category: "Entertainment", total: 2000 }
  ]
};

const MOCK_TRANSACTIONS = [
  { _id: "1", date: "2026-06-14", type: "expense", category: "Groceries", amount: 1250, note: "Weekly grocery run" },
  { _id: "2", date: "2026-06-12", type: "income", category: "Salary", amount: 75000, note: "Monthly payout" },
  { _id: "3", date: "2026-06-10", type: "saving", category: "Emergency Fund", amount: 10000, note: "Auto-transfer to savings" },
  { _id: "4", date: "2026-06-08", type: "expense", category: "Utilities", amount: 4500, note: "Electricity & Internet" }
];

const MOCK_SAVINGS = [
  { _id: "s1", date: "2026-06-10", category: "Emergency Fund", amount: 10000, note: "Auto-savings" },
  { _id: "s2", date: "2026-06-05", category: "Travel Fund", amount: 5000, note: "Vite vacation savings" }
];

const CHART_COLORS = ["var(--accent-rust)", "var(--accent-sage)", "var(--accent-ochre)", "var(--accent-blue)", "#9c6b8c"];

export default function BudgetPage() {
  const [viewMonth, setViewMonth] = useState("2026-06");
  const [type, setType] = useState("expense"); // "expense" | "income" | "saving"
  const [category, setCategory] = useState("Groceries");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  
  const [customCategories, setCustomCategories] = useState(MOCK_CATEGORIES);
  const [newCatInput, setNewCatInput] = useState("");

  const formatCurrency = (val) => {
    return `₹${Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCatInput.trim() && !customCategories.includes(newCatInput.trim())) {
      setCustomCategories([...customCategories, newCatInput.trim()]);
      setCategory(newCatInput.trim());
      setNewCatInput("");
    }
  };

  return (
    <div className="h-screen bg-bg flex flex-col text-ink transition-colors duration-300 relative overflow-hidden">
      <PageDecor variant="subjects" /> {/* Reuses Sage/Rust aesthetics */}

      <Navbar userInfo={{ username: "Aditya" }} />

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
              </div>
            </div>

            {/* Step 1: Add Entry Form & Monthly Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Card (5 cols) */}
              <div className="lg:col-span-5 paper-card p-4 sm:p-5 border border-border flex flex-col gap-4">
                <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest border-b border-border pb-2">Add New Transaction</h3>
                
                {/* Segmented Type Toggle */}
                <div className="flex bg-bg p-1 rounded-lg border border-border">
                  {["expense", "income", "saving"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setType(t);
                        if (t === "saving") setCategory("Savings");
                      }}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                        type === t 
                          ? (t === "expense" ? "bg-accent-rust text-white" : "bg-accent-sage text-white") 
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
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Amount</label>
                      <div className="relative flex items-center">
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input-box text-xs bg-surface pr-10"
                        />
                        <button 
                          type="button"
                          className="absolute right-2 text-ink-muted hover:text-accent-rust p-1 cursor-pointer"
                          title="Open Calculator"
                        >
                          <LuCalculator className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-1">Category</label>
                    <div className="flex gap-2">
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-box text-xs bg-surface select-none outline-none flex-1"
                        disabled={type === "saving"}
                      >
                        {type === "saving" ? (
                          <option value="Savings">Savings</option>
                        ) : (
                          customCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                        )}
                      </select>
                    </div>
                    {type !== "saving" && (
                      <div className="flex gap-1.5 mt-2">
                        <input 
                          type="text" 
                          placeholder="New category..." 
                          value={newCatInput} 
                          onChange={(e) => setNewCatInput(e.target.value)}
                          className="input-box text-xs py-1.5 bg-surface"
                        />
                        <button 
                          onClick={handleAddCategory}
                          className="btn-primary py-1.5 px-3 text-xs w-auto whitespace-nowrap"
                        >
                          Add Custom
                        </button>
                      </div>
                    )}
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

                  <button className="btn-primary w-full mt-2 font-bold flex items-center justify-center gap-1.5">
                    <LuPlus className="text-sm" /> Add Transaction
                  </button>
                </div>
              </div>

              {/* Summary Cards and Charts Row (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* 4 Summary Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="paper-card p-4 border border-border flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1">
                      <LuTrendingUp className="text-accent-sage" /> Income
                    </span>
                    <span className="text-base font-mono font-bold text-accent-sage mt-2">{formatCurrency(MOCK_SUMMARY.totalIncome)}</span>
                  </div>

                  <div className="paper-card p-4 border border-border flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1">
                      <LuTrendingDown className="text-accent-rust" /> Spending
                    </span>
                    <span className="text-base font-mono font-bold text-accent-rust mt-2">{formatCurrency(MOCK_SUMMARY.totalExpense)}</span>
                  </div>

                  <div className="paper-card p-4 border border-border flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1">
                      <LuPiggyBank className="text-accent-sage" /> Saved
                    </span>
                    <span className="text-base font-mono font-bold text-accent-sage mt-2">{formatCurrency(MOCK_SUMMARY.totalSavings)}</span>
                  </div>

                  <div className="paper-card p-4 border border-border flex flex-col justify-between bg-surface/50">
                    <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1">
                      <LuWallet className="text-ink" /> Balance
                    </span>
                    <span className="text-base font-mono font-bold text-ink mt-2">{formatCurrency(MOCK_SUMMARY.balance)}</span>
                  </div>
                </div>

                {/* Donut Chart and Info */}
                <div className="paper-card p-4 sm:p-5 border border-border flex items-center justify-between flex-wrap md:flex-nowrap gap-4">
                  <div className="flex-1 w-full min-w-[200px]">
                    <h4 className="text-xs font-mono font-bold text-ink-muted uppercase tracking-widest mb-3">Expenses by Category</h4>
                    <div className="h-[160px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={MOCK_SUMMARY.categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="total"
                          >
                            {MOCK_SUMMARY.categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Legend listing */}
                  <div className="flex flex-col gap-2 shrink-0 pr-4 w-full md:w-auto">
                    {MOCK_SUMMARY.categoryBreakdown.map((item, idx) => (
                      <div key={item.category} className="flex items-center gap-2 text-xs font-medium">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        <span className="text-ink-muted">{item.category}:</span>
                        <span className="font-mono font-bold">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Step 2: Daily Ledger */}
            <div className="paper-card p-4 sm:p-6 border border-border">
              <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest mb-4">Daily Ledger</h3>
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
                    {MOCK_TRANSACTIONS.map((tx) => (
                      <tr key={tx._id} className="border-b border-border/40 hover:bg-bg/30">
                        <td className="py-3 font-mono font-medium">{tx.date}</td>
                        <td className="py-3 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            tx.type === "expense" ? "bg-accent-rust/10 text-accent-rust" : "bg-accent-sage/10 text-accent-sage"
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 font-bold">{tx.category}</td>
                        <td className="py-3 text-ink-muted italic">{tx.note || "—"}</td>
                        <td className={`py-3 text-right font-mono font-bold ${
                          tx.type === "expense" ? "text-accent-rust" : "text-accent-sage"
                        }`}>
                          {tx.type === "expense" ? "-" : "+"}{formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button className="text-ink-muted hover:text-accent-rust p-1 cursor-pointer"><LuPenLine className="text-sm" /></button>
                            <button className="text-ink-muted hover:text-accent-red p-1 cursor-pointer"><LuTrash2 className="text-sm" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 3: Savings Tracker (Spreadsheet View) */}
            <div className="paper-card p-4 sm:p-6 border border-border">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-border pb-3">
                <h3 className="text-sm font-mono font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1.5">
                  <LuFileSpreadsheet className="text-accent-sage" /> Savings Tracker (Spreadsheet View)
                </h3>
                <div className="flex gap-2">
                  <button className="btn-primary py-1.5 px-3 w-auto text-xs font-bold flex items-center gap-1">
                    <LuPlus className="text-sm" /> Add Row
                  </button>
                  <button className="bg-surface border border-border text-ink hover:bg-bg transition-colors py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <LuDownload className="text-sm" /> Export to Excel
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
                    {MOCK_SAVINGS.map((row, index) => {
                      const runningTotal = MOCK_SAVINGS.slice(0, index + 1).reduce((acc, r) => acc + r.amount, 0);
                      return (
                        <tr key={row._id} className="border-b border-border/40 hover:bg-bg/25">
                          <td className="py-2.5 px-4 border-r border-border font-mono cursor-pointer bg-surface hover:bg-bg/10">{row.date}</td>
                          <td className="py-2.5 px-4 border-r border-border font-semibold cursor-pointer bg-surface hover:bg-bg/10">{row.category}</td>
                          <td className="py-2.5 px-4 border-r border-border font-mono text-right text-accent-sage cursor-pointer bg-surface hover:bg-bg/10">{formatCurrency(row.amount)}</td>
                          <td className="py-2.5 px-4 border-r border-border italic text-ink-muted cursor-pointer bg-surface hover:bg-bg/10">{row.note || "—"}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-right bg-bg/10">{formatCurrency(runningTotal)}</td>
                        </tr>
                      );
                    })}
                    {/* Totals Row */}
                    <tr className="bg-bg/40 font-bold border-t border-border">
                      <td className="py-3 px-4 border-r border-border uppercase font-mono tracking-wider" colSpan={2}>Total Savings</td>
                      <td className="py-3 px-4 border-r border-border font-mono text-right text-accent-sage">
                        {formatCurrency(MOCK_SAVINGS.reduce((acc, r) => acc + r.amount, 0))}
                      </td>
                      <td className="py-3 px-4 border-r border-border"></td>
                      <td className="py-3 px-4 font-mono text-right text-accent-sage">
                        {formatCurrency(MOCK_SAVINGS.reduce((acc, r) => acc + r.amount, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
      <BottomBar />
    </div>
  );
}
