export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'card' | 'transfer' | 'cash' | 'direct_debit' | 'other';

export type TransactionStatus = 'cleared' | 'pending';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  isRecurring?: boolean;
  recurringDay?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface AccountingLedger {
  code: string; // e.g. "$PERSO" or "$BUDGET"
  title: string;
  currency: 'CHF';
  monthlyBudgetLimit?: number;
  categoryBudgets?: Record<string, number>;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'logement', name: 'Logement & Loyer', type: 'expense', color: '#3b82f6', icon: '🏠' },
  { id: 'alimentation', name: 'Alimentation & Courses', type: 'expense', color: '#10b981', icon: '🛒' },
  { id: 'transports', name: 'Transports & Vélo/Auto', type: 'expense', color: '#f59e0b', icon: '🚇' },
  { id: 'etudes', name: 'Études, Matériel & Livres', type: 'expense', color: '#8b5cf6', icon: '📚' },
  { id: 'loisirs', name: 'Loisirs, Restos & Sorties', type: 'expense', color: '#ec4899', icon: '🎉' },
  { id: 'abonnements', name: 'Factures & Abonnements', type: 'expense', color: '#06b6d4', icon: '⚡' },
  { id: 'sante', name: 'Santé & Hygiène', type: 'expense', color: '#14b8a6', icon: '💊' },
  { id: 'autre_depense', name: 'Autre dépense', type: 'expense', color: '#71717a', icon: '📦' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'bourse', name: 'Bourse & Aides', type: 'income', color: '#10b981', icon: '🎓' },
  { id: 'salaire', name: 'Salaire / Job étudiant', type: 'income', color: '#6366f1', icon: '💼' },
  { id: 'famille', name: 'Aide famille / Virement', type: 'income', color: '#f59e0b', icon: '🤝' },
  { id: 'ventes', name: 'Ventes & Remboursements', type: 'income', color: '#06b6d4', icon: '🔄' },
  { id: 'autre_revenu', name: 'Autre recette', type: 'income', color: '#22c55e', icon: '💰' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryInfo(categoryId: string): CategoryInfo {
  const found = ALL_CATEGORIES.find((c) => c.id === categoryId);
  if (found) return found;
  return {
    id: categoryId,
    name: categoryId,
    type: 'expense',
    color: '#71717a',
    icon: '🏷️',
  };
}
