import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  Download, 
  Upload, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  Edit3, 
  Trash2, 
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Building,
  Coins,
  FileSpreadsheet,
  Repeat,
  BarChart3,
  Sun,
  Moon
} from 'lucide-react';
import { 
  AccountingLedger, 
  Transaction, 
  getCategoryInfo, 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES 
} from '../types/accounting';
import { TransactionModal } from './TransactionModal';
import { exportLedgerToCsv, downloadFile } from '../utils/accountingStorage';

interface AccountingViewProps {
  ledger: AccountingLedger;
  onUpdateLedger: (updated: AccountingLedger) => void;
  onBackToHome: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  ledger,
  onUpdateLedger,
  onBackToHome,
  theme = 'dark',
  onToggleTheme,
}) => {
  // Filters state
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [viewAllTime, setViewAllTime] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'cleared' | 'pending'>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Title edition inline
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(ledger.title);

  // Currency (Fixed to CHF exclusively)
  const currency = 'CHF';

  // Budget Limit editing
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(ledger.monthlyBudgetLimit || 650));

  // Evolution & Comparison chart view
  const [showEvolutionChart, setShowEvolutionChart] = useState(false);
  const [recurringSuccessMsg, setRecurringSuccessMsg] = useState<string | null>(null);

  // Compute monthly evolution over past 12 months
  const monthlyEvolution = useMemo(() => {
    const monthsMap = new Map<string, { income: number; expense: number; net: number }>();
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsMap.set(key, { income: 0, expense: 0, net: 0 });
    }

    ledger.transactions.forEach((tx) => {
      const key = tx.date.slice(0, 7);
      if (monthsMap.has(key)) {
        const item = monthsMap.get(key)!;
        if (tx.type === 'income') item.income += tx.amount;
        else item.expense += tx.amount;
        item.net = item.income - item.expense;
      }
    });

    const entries = Array.from(monthsMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));

    const maxAmount = Math.max(1, ...entries.map((e) => Math.max(e.income, e.expense)));
    const totalExpenses = entries.reduce((s, e) => s + e.expense, 0);
    const totalIncomes = entries.reduce((s, e) => s + e.income, 0);
    const avgExpense = totalExpenses / 12;
    const avgIncome = totalIncomes / 12;
    const globalSavingsRate = totalIncomes > 0 ? Math.round(((totalIncomes - totalExpenses) / totalIncomes) * 100) : 0;

    return { entries, maxAmount, avgExpense, avgIncome, globalSavingsRate };
  }, [ledger.transactions]);

  // Compute available months from transactions
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    ledger.transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        monthsSet.add(tx.date.slice(0, 7));
      }
    });
    // Ensure current month is included
    const nowMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    monthsSet.add(nowMonth);
    return Array.from(monthsSet).sort().reverse();
  }, [ledger.transactions]);

  // Navigate months
  const handlePrevMonth = () => {
    setViewAllTime(false);
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setSelectedMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    setViewAllTime(false);
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setSelectedMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return ledger.transactions
      .filter((tx) => {
        // Date / Month filter
        if (!viewAllTime && !tx.date.startsWith(selectedMonth)) {
          return false;
        }
        // Type filter
        if (filterType !== 'all' && tx.type !== filterType) {
          return false;
        }
        // Category filter
        if (filterCategory !== 'all' && tx.category !== filterCategory) {
          return false;
        }
        // Status filter
        if (filterStatus !== 'all' && tx.status !== filterStatus) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (tx.title || '').toLowerCase().includes(q);
          const matchNotes = (tx.notes || '').toLowerCase().includes(q);
          const catInfo = getCategoryInfo(tx.category);
          const matchCat = catInfo.name.toLowerCase().includes(q);
          if (!matchTitle && !matchNotes && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [ledger.transactions, selectedMonth, viewAllTime, filterType, filterCategory, filterStatus, searchQuery]);

  // Overall Global Treasury (All transactions ever)
  const globalBalance = useMemo(() => {
    return ledger.transactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [ledger.transactions]);

  const globalClearedBalance = useMemo(() => {
    return ledger.transactions
      .filter((tx) => tx.status === 'cleared')
      .reduce((acc, tx) => {
        return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
      }, 0);
  }, [ledger.transactions]);

  // Period Metrics (Current month or all-time if selected)
  const periodTransactions = useMemo(() => {
    if (viewAllTime) return ledger.transactions;
    return ledger.transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [ledger.transactions, selectedMonth, viewAllTime]);

  const periodIncome = useMemo(() => {
    return periodTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [periodTransactions]);

  const periodExpense = useMemo(() => {
    return periodTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [periodTransactions]);

  const periodNet = periodIncome - periodExpense;

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    periodTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
      });

    const list = Array.from(map.entries()).map(([catId, total]) => {
      const info = getCategoryInfo(catId);
      const percentage = periodExpense > 0 ? (total / periodExpense) * 100 : 0;
      return {
        ...info,
        total,
        percentage,
      };
    });

    return list.sort((a, b) => b.total - a.total);
  }, [periodTransactions, periodExpense]);

  // Add / Edit transaction handler
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    let updatedList: Transaction[];
    if (existingId) {
      updatedList = ledger.transactions.map((tx) =>
        tx.id === existingId
          ? {
              ...tx,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : tx
      );
    } else {
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList = [newTx, ...ledger.transactions];
    }

    onUpdateLedger({
      ...ledger,
      transactions: updatedList,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete transaction handler
  const handleDeleteTransaction = (id: string) => {
    const updatedList = ledger.transactions.filter((tx) => tx.id !== id);
    onUpdateLedger({
      ...ledger,
      transactions: updatedList,
      updatedAt: new Date().toISOString(),
    });
  };

  // Toggle cleared / pending status directly from row
  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedList = ledger.transactions.map((tx) => {
      if (tx.id === id) {
        return {
          ...tx,
          status: (tx.status === 'cleared' ? 'pending' : 'cleared') as 'cleared' | 'pending',
          updatedAt: new Date().toISOString(),
        };
      }
      return tx;
    });

    onUpdateLedger({
      ...ledger,
      transactions: updatedList,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update Title
  const handleSaveTitle = () => {
    if (!titleInput.trim()) return;
    onUpdateLedger({
      ...ledger,
      title: titleInput.trim(),
      updatedAt: new Date().toISOString(),
    });
    setIsEditingTitle(false);
  };

  // Update Monthly Budget
  const handleSaveBudget = () => {
    const num = parseFloat(budgetInput.replace(',', '.'));
    onUpdateLedger({
      ...ledger,
      monthlyBudgetLimit: isNaN(num) || num <= 0 ? undefined : num,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingBudget(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvContent = exportLedgerToCsv(ledger);
    downloadFile(csvContent, `comptabilite_${ledger.code.replace('$', '')}.csv`, 'text/csv;charset=utf-8;');
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonContent = JSON.stringify(ledger, null, 2);
    downloadFile(jsonContent, `comptabilite_${ledger.code.replace('$', '')}.json`, 'application/json');
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as AccountingLedger;
        if (!parsed.code || !Array.isArray(parsed.transactions)) {
          alert('Fichier comptable invalide.');
          return;
        }
        onUpdateLedger(parsed);
      } catch (err) {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Generate recurring transactions for the selected month
  const handleGenerateRecurring = () => {
    const recurringTemplates = ledger.transactions.filter((tx) => tx.isRecurring);
    if (recurringTemplates.length === 0) {
      alert("Aucune opération récurrente n'a encore été créée. Pour en définir une, cochez 'Opération récurrente chaque mois' lors de l'ajout d'une opération (ex: loyer, bourse, abonnements).");
      return;
    }

    const targetMonth = selectedMonth;
    let addedCount = 0;
    const newTxs = [...ledger.transactions];

    recurringTemplates.forEach((template) => {
      const exists = ledger.transactions.some(
        (t) => t.date.startsWith(targetMonth) && t.title.toLowerCase() === template.title.toLowerCase() && t.type === template.type
      );
      if (!exists) {
        const day = String(template.recurringDay || 1).padStart(2, '0');
        const newTx: Transaction = {
          id: `tx-rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          date: `${targetMonth}-${day}`,
          title: template.title,
          amount: template.amount,
          type: template.type,
          category: template.category,
          paymentMethod: template.paymentMethod,
          status: 'cleared',
          notes: template.notes ? `${template.notes} (Renouvellement automatique)` : 'Renouvellement automatique',
          isRecurring: true,
          recurringDay: template.recurringDay,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTxs.push(newTx);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      onUpdateLedger({
        ...ledger,
        transactions: newTxs,
        updatedAt: new Date().toISOString(),
      });
      setRecurringSuccessMsg(`${addedCount} opération(s) récurrente(s) renouvelée(s) pour ${formatMonthName(targetMonth)} !`);
      setTimeout(() => setRecurringSuccessMsg(null), 3500);
    } else {
      setRecurringSuccessMsg(`Toutes vos opérations récurrentes sont déjà enregistrées pour ${formatMonthName(targetMonth)}.`);
      setTimeout(() => setRecurringSuccessMsg(null), 3000);
    }
  };

  // Format month name
  const formatMonthName = (yearMonth: string) => {
    const [y, m] = yearMonth.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col font-sans select-none overflow-y-auto transition-colors ${
      theme === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-[#050507] text-zinc-100'
    }`}>
      {/* Top Bar Header */}
      <header className={`h-16 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs border-b transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#08080a] border-zinc-800/80 text-zinc-100 shadow-md'
      }`}>
        {/* Left: Return button, Title & Code badge */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToHome}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Retourner à l'accueil"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Accueil</span>
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 border ${
              theme === 'light'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <Coins className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    className={`px-2 py-0.5 text-sm font-bold border border-indigo-500 rounded focus:outline-none ${
                      theme === 'light' ? 'bg-white text-slate-900' : 'bg-zinc-900 text-white'
                    }`}
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 
                    onDoubleClick={() => setIsEditingTitle(true)}
                    className={`text-sm sm:text-base font-bold tracking-tight truncate cursor-pointer transition-colors ${
                      theme === 'light' ? 'text-slate-900 hover:text-indigo-600' : 'text-white hover:text-indigo-300'
                    }`}
                    title="Double-cliquez pour renommer"
                  >
                    {ledger.title}
                  </h1>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold shadow-xs border ${
                    theme === 'light'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300'
                  }`}>
                    {ledger.code}
                  </span>
                </div>
              )}
              <div className={`text-[11px] flex items-center gap-1.5 mt-0.5 ${
                theme === 'light' ? 'text-slate-500' : 'text-zinc-400'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Espace comptable privé & local</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Theme button, CHF Currency indicator & Export Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
              }`}
              title={theme === 'light' ? 'Passer en thème sombre' : 'Passer en thème blanc'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          )}

          {/* Fixed CHF Currency Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-xs ${
            theme === 'light'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-zinc-950 border-zinc-800 text-emerald-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>CHF</span>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-xs ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Exporter les opérations au format Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Export JSON Backup */}
          <button
            onClick={handleExportJson}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-xs ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Sauvegarder en JSON"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">Sauvegarde</span>
          </button>

          {/* Import JSON */}
          <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer shadow-xs ${
            theme === 'light'
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
              : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-white'
          }`}>
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Restaurer</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Period Selector & Quick Add Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#09090c] p-3 rounded-2xl border border-zinc-800 shadow-xl">
          {/* Month Stepper */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#050507] border border-zinc-800 rounded-xl p-1 text-xs">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Mois précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 font-semibold text-zinc-200 capitalize min-w-[140px] text-center">
                {viewAllTime ? "Tout l'historique" : formatMonthName(selectedMonth)}
              </span>

              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Mois suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setViewAllTime((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                viewAllTime
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                  : 'bg-[#050507] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              Vue globale (Tout)
            </button>
          </div>

          {/* Prominent Action Button: + Nouvelle Opération */}
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle opération</span>
          </button>
        </div>

        {/* Top KPI Metric Cards (Trésorerie) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Solde Actuel Total */}
          <div className="bg-[#09090c] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-indigo-400" />
                Solde de Trésorerie
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300">
                Total réel
              </span>
            </div>

            <div className="my-3">
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                globalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {globalBalance >= 0 ? '+' : ''}{globalBalance.toFixed(2)} {currency}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Pointé en banque : <strong className="text-zinc-200 font-mono">{globalClearedBalance.toFixed(2)} {currency}</strong>
              </p>
            </div>

            <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-2 flex items-center justify-between">
              <span>{ledger.transactions.length} opération(s) enregistrée(s)</span>
            </div>
          </div>

          {/* Card 2: Entrées / Recettes de la période */}
          <div className="bg-[#09090c] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Entrées ({viewAllTime ? 'Total' : 'Ce mois'})
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                + Recettes
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
                +{periodIncome.toFixed(2)} {currency}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Bourses, jobs, aides famille & rentrées
              </p>
            </div>

            <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-2">
              <span>{periodTransactions.filter((t) => t.type === 'income').length} versement(s)</span>
            </div>
          </div>

          {/* Card 3: Dépenses / Sorties de la période */}
          <div className="bg-[#09090c] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                Dépenses ({viewAllTime ? 'Total' : 'Ce mois'})
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30">
                - Sorties
              </span>
            </div>

            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400 tracking-tight">
                -{periodExpense.toFixed(2)} {currency}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Loyer, courses, abonnements & loisirs
              </p>
            </div>

            <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-2">
              <span>{periodTransactions.filter((t) => t.type === 'expense').length} dépense(s)</span>
            </div>
          </div>

          {/* Card 4: Reste à vivre / Capacité d'épargne */}
          <div className="bg-[#09090c] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-indigo-400" />
                Reste à vivre / Bilan
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                periodNet >= 0 
                  ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-950/50 border-rose-500/30 text-rose-400'
              }`}>
                {periodNet >= 0 ? 'Positif' : 'Déficit'}
              </span>
            </div>

            <div className="my-3">
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                periodNet >= 0 ? 'text-zinc-100' : 'text-rose-400'
              }`}>
                {periodNet >= 0 ? '+' : ''}{periodNet.toFixed(2)} {currency}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {periodNet >= 0 ? 'Solde disponible / Épargne' : 'Attention : sorties supérieures aux entrées'}
              </p>
            </div>

            {/* Budget limit progress bar if configured */}
            <div className="border-t border-zinc-800/80 pt-2">
              {ledger.monthlyBudgetLimit ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Dépensé : {((periodExpense / ledger.monthlyBudgetLimit) * 100).toFixed(0)}%</span>
                    <span>Plafond : {ledger.monthlyBudgetLimit} {currency}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        periodExpense > ledger.monthlyBudgetLimit 
                          ? 'bg-rose-500' 
                          : periodExpense > ledger.monthlyBudgetLimit * 0.85 
                          ? 'bg-amber-500' 
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, (periodExpense / ledger.monthlyBudgetLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingBudget(true)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  + Définir un plafond de budget mensuel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Budget Limit Quick Edit Modal or Popover if requested */}
        {isEditingBudget && (
          <div className="p-3 bg-[#0d0d12] border border-indigo-500/50 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-200">Fixer un plafond de dépenses mensuel :</span>
              <input
                type="number"
                min="50"
                max="10000"
                step="50"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-24 px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              <span className="text-zinc-400">{currency} / mois</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveBudget}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setIsEditingBudget(false)}
                className="px-2 py-1 text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Visual Expense Breakdown by Category */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-[#09090c] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                Répartition des dépenses ({viewAllTime ? 'Tout l’historique' : formatMonthName(selectedMonth)})
              </h2>
              <span className="text-xs font-mono text-zinc-400 font-semibold">
                Total : {periodExpense.toFixed(2)} {currency}
              </span>
            </div>

            {/* Stacked multi-color progress bar */}
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden flex shadow-inner">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                  title={`${cat.name}: ${cat.total.toFixed(2)} ${currency} (${cat.percentage.toFixed(1)}%)`}
                  className="h-full transition-all hover:opacity-80"
                />
              ))}
            </div>

            {/* Category Badges with totals and percentage */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1 text-xs">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setFilterCategory(filterCategory === cat.id ? 'all' : cat.id)}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    filterCategory === cat.id
                      ? 'bg-zinc-800 border-indigo-500 text-white shadow-xs'
                      : 'bg-[#050507] border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="truncate text-[11px] font-medium">{cat.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-white text-[11px]">
                      {cat.total.toFixed(0)} {currency}
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-1">
                      ({cat.percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Journal Table */}
        <div className="bg-[#09090c] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {/* Filter Bar */}
          <div className="p-4 border-b border-zinc-800 bg-[#0d0d11] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une opération, commerçant, loyer..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#050507] border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type filter */}
              <div className="flex items-center bg-[#050507] p-0.5 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterType === 'all' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterType === 'expense' ? 'bg-rose-600/80 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Dépenses
                </button>
                <button
                  onClick={() => setFilterType('income')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterType === 'income' ? 'bg-emerald-600/80 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Recettes
                </button>
              </div>

              {/* Status filter */}
              <div className="flex items-center bg-[#050507] p-0.5 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'all' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Tous états
                </button>
                <button
                  onClick={() => setFilterStatus('cleared')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'cleared' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Opérations pointées (déjà passées en compte)"
                >
                  ✓ Pointés
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'pending' ? 'bg-amber-950 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Opérations en attente"
                >
                  ⏳ En attente
                </button>
              </div>

              {/* Category dropdown */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-[#050507] border border-zinc-800 rounded-xl text-zinc-300 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">Toutes catégories</option>
                <optgroup label="Dépenses">
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Recettes">
                  {INCOME_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="divide-y divide-zinc-800/80 overflow-x-auto">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 px-4 text-center text-zinc-500 space-y-2">
                <Coins className="w-10 h-10 mx-auto text-zinc-600 opacity-50" />
                <p className="font-semibold text-zinc-300 text-sm">Aucune opération trouvée</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                    ? 'Aucune transaction ne correspond à vos filtres de recherche.'
                    : 'Commencez par ajouter votre première dépense ou recette avec le bouton ci-dessus !'}
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const cat = getCategoryInfo(tx.category);
                const isExpense = tx.type === 'expense';
                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setEditingTransaction(tx);
                      setIsModalOpen(true);
                    }}
                    className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-zinc-850/40 transition-colors cursor-pointer group"
                  >
                    {/* Left: Date + Category Icon + Title & Notes */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-[#050507] border border-zinc-800 shrink-0 text-center">
                        <span className="text-[13px] font-bold font-mono text-zinc-200 leading-none">
                          {tx.date.slice(8, 10)}
                        </span>
                        <span className="text-[9px] uppercase font-semibold text-zinc-500 mt-0.5">
                          {new Date(tx.date).toLocaleDateString('fr-FR', { month: 'short' }).slice(0, 3)}
                        </span>
                      </div>

                      {/* Category Icon */}
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-xs"
                        style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                        title={cat.name}
                      >
                        {cat.icon}
                      </div>

                      {/* Title, Category & Payment */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-semibold text-white truncate">
                            {tx.title}
                          </span>
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                            style={{ 
                              backgroundColor: `${cat.color}15`, 
                              color: cat.color,
                              border: `1px solid ${cat.color}30` 
                            }}
                          >
                            {cat.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="capitalize">
                            {tx.paymentMethod === 'card' && '💳 Carte'}
                            {tx.paymentMethod === 'transfer' && '🏦 Virement'}
                            {tx.paymentMethod === 'direct_debit' && '⚡ Prélèvement'}
                            {tx.paymentMethod === 'cash' && '💵 Espèces'}
                            {tx.paymentMethod === 'other' && 'Autre'}
                          </span>
                          {tx.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate italic text-zinc-500">{tx.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Status toggle */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      {/* Amount */}
                      <div className="text-right">
                        <span className={`text-sm sm:text-base font-extrabold font-mono ${
                          isExpense ? 'text-zinc-100' : 'text-emerald-400'
                        }`}>
                          {isExpense ? '-' : '+'}{tx.amount.toFixed(2)} {currency}
                        </span>
                      </div>

                      {/* Status quick toggle */}
                      <button
                        onClick={(e) => handleToggleStatus(tx.id, e)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                          tx.status === 'cleared'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
                        }`}
                        title={tx.status === 'cleared' ? 'Opération pointée (cliquer pour marquer en attente)' : 'Opération en attente (cliquer pour pointer)'}
                      >
                        {tx.status === 'cleared' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline text-[10px] font-semibold">Pointé</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden sm:inline text-[10px] font-semibold">En attente</span>
                          </>
                        )}
                      </button>

                      {/* Delete icon on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Supprimer l'opération "${tx.title}" ?`)) {
                            handleDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors opacity-30 group-hover:opacity-100 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Journal Summary Footer */}
          {filteredTransactions.length > 0 && (
            <div className="p-3 px-5 border-t border-zinc-800 bg-[#0d0d11] flex items-center justify-between text-xs text-zinc-400">
              <span>{filteredTransactions.length} opération(s) affichée(s)</span>
              <div className="flex items-center gap-4 font-mono text-[11px]">
                <span>
                  Total entrées : <strong className="text-emerald-400">+{periodIncome.toFixed(2)} {currency}</strong>
                </span>
                <span>
                  Total dépenses : <strong className="text-rose-400">-{periodExpense.toFixed(2)} {currency}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        transaction={editingTransaction}
        currency={currency}
      />
    </div>
  );
};
