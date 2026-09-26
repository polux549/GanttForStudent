import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ArrowUpRight, ArrowDownRight, Repeat } from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  PaymentMethod, 
  TransactionStatus,
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES 
} from '../types/accounting';
import { getTodayString } from '../utils/dates';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  transaction?: Transaction | null;
  currency: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  transaction,
  currency,
}) => {
  const isEditing = Boolean(transaction);

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [category, setCategory] = useState('alimentation');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [status, setStatus] = useState<TransactionStatus>('cleared');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setTitle(transaction.title);
      setAmount(String(transaction.amount));
      setDate(transaction.date);
      setCategory(transaction.category);
      setPaymentMethod(transaction.paymentMethod);
      setStatus(transaction.status);
      setNotes(transaction.notes || '');
      setIsRecurring(Boolean(transaction.isRecurring));
      setRecurringDay(transaction.recurringDay || 1);
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setDate(getTodayString());
      setCategory('alimentation');
      setPaymentMethod('card');
      setStatus('cleared');
      setNotes('');
      setIsRecurring(false);
      setRecurringDay(1);
    }
    setConfirmDelete(false);
  }, [transaction, isOpen]);

  // When switching type, update default category if needed
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      const match = EXPENSE_CATEGORIES.some((c) => c.id === category);
      if (!match) setCategory('alimentation');
    } else {
      const match = INCOME_CATEGORIES.some((c) => c.id === category);
      if (!match) setCategory('bourse');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave(
      {
        title: title.trim(),
        amount: parsedAmount,
        type,
        date,
        category,
        paymentMethod,
        status,
        notes: notes.trim() || undefined,
        isRecurring,
        recurringDay: isRecurring ? Number(recurringDay) || 1 : undefined,
      },
      transaction?.id
    );
    onClose();
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div 
        className="bg-[#09090c] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#0d0d11]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              type === 'expense' 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {type === 'expense' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Modifier la transaction' : 'Nouvelle transaction'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {type === 'expense' ? 'Enregistrement d’une dépense' : 'Enregistrement d’une recette / rentrée'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Type Toggle: Dépense / Recette */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#050507] border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600/90 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Dépense (-)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600/90 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Recette / Revenu (+)</span>
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                Montant ({currency}) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-[#050507] border border-zinc-700 rounded-lg text-white font-mono text-base font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-zinc-400 font-bold font-mono text-sm">
                  {currency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#050507] border border-zinc-700 rounded-lg text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
              Libellé de l’opération *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Courses Lidl, Loyer chambre, Bourse CROUS..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#050507] border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
              Catégorie *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    category === cat.id
                      ? 'bg-zinc-800 border-indigo-500 text-white shadow-xs'
                      : 'bg-[#050507] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate text-[11px] font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                Mode de règlement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-[#050507] border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="card">💳 Carte Bancaire</option>
                <option value="transfer">🏦 Virement bancaire / Lydia</option>
                <option value="direct_debit">⚡ Prélèvement automatique</option>
                <option value="cash">💵 Espèces</option>
                <option value="other">Autre moyen</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                État de l’opération
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatus('cleared')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'cleared'
                      ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300 font-semibold shadow-xs'
                      : 'bg-[#050507] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pointé</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'pending'
                      ? 'bg-amber-950/50 border-amber-500/60 text-amber-300 font-semibold shadow-xs'
                      : 'bg-[#050507] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>En attente</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recurrence Section */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Repeat className="w-3.5 h-3.5 text-indigo-400" />
                <span>Opération récurrente chaque mois (ex: loyer, bourse, abonnement)</span>
              </div>
            </label>

            {isRecurring && (
              <div className="flex items-center gap-3 pt-1 border-t border-zinc-850 text-xs">
                <span className="text-zinc-400">Jour du mois :</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={recurringDay}
                  onChange={(e) => setRecurringDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-16 px-2 py-1 bg-[#050507] border border-zinc-700 rounded text-zinc-200 text-xs text-center font-mono"
                />
                <span className="text-[11px] text-zinc-500">
                  (Sera renouvelée automatiquement le {recurringDay} de chaque mois)
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
              Notes complémentaires (optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: Facture #12, partagée avec coloc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#050507] border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            {isEditing && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(transaction!.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Confirmer suppression
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 text-zinc-400 hover:text-white text-xs cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Supprimer cette transaction"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                {isEditing ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
