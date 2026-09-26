import { AccountingLedger, Transaction } from '../types/accounting';
import { getTodayString } from './dates';

const STORAGE_KEY_PREFIX = 'gfs_accounting_ledger_';
const RECENT_LEDGERS_KEY = 'gfs_accounting_recent_codes';

export function normalizeAccountingCode(raw: string): string {
  const trimmed = raw.trim();
  const withoutDollar = trimmed.startsWith('$') ? trimmed.slice(1) : trimmed;
  const cleaned = withoutDollar.toUpperCase().replace(/[^A-Z0-9-_]/g, '-');
  return `$${cleaned || 'BUDGET'}`;
}

export function isAccountingCode(raw: string): boolean {
  return raw.trim().startsWith('$');
}

export function saveLedger(ledger: AccountingLedger): void {
  try {
    const code = normalizeAccountingCode(ledger.code);
    ledger.code = code;
    ledger.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY_PREFIX + code, JSON.stringify(ledger));

    // Update recent codes
    const recent = getRecentLedgerCodes();
    const updated = [code, ...recent.filter((c) => c !== code)].slice(0, 10);
    localStorage.setItem(RECENT_LEDGERS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save accounting ledger to localStorage', err);
  }
}

export function getLedger(code: string): AccountingLedger | null {
  try {
    const norm = normalizeAccountingCode(code);
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + norm);
    if (!data) return null;
    const parsed = JSON.parse(data) as AccountingLedger;
    parsed.currency = 'CHF';
    if (!parsed.title || parsed.title.includes('Trésorerie')) {
      parsed.title = 'Gestion Budgétaire';
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load accounting ledger', err);
    return null;
  }
}

export function deleteLedger(code: string): void {
  try {
    const norm = normalizeAccountingCode(code);
    localStorage.removeItem(STORAGE_KEY_PREFIX + norm);
    const recent = getRecentLedgerCodes().filter((c) => c !== norm);
    localStorage.setItem(RECENT_LEDGERS_KEY, JSON.stringify(recent));
  } catch (err) {
    console.error('Failed to delete accounting ledger', err);
  }
}

export function getRecentLedgerCodes(): string[] {
  try {
    const data = localStorage.getItem(RECENT_LEDGERS_KEY);
    if (!data) return [];
    return JSON.parse(data) as string[];
  } catch (err) {
    return [];
  }
}

export function createSampleLedger(code: string): AccountingLedger {
  const norm = normalizeAccountingCode(code);

  return {
    code: norm,
    title: 'Gestion Budgétaire',
    currency: 'CHF',
    monthlyBudgetLimit: undefined,
    categoryBudgets: {},
    transactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function exportLedgerToCsv(ledger: AccountingLedger): string {
  const headers = ['Date', 'Type', 'Catégorie', 'Libellé', 'Montant', 'Devise', 'Moyen de paiement', 'Statut', 'Notes'];
  const rows = ledger.transactions.map((tx) => [
    tx.date,
    tx.type === 'income' ? 'Recette' : 'Dépense',
    tx.category,
    `"${(tx.title || '').replace(/"/g, '""')}"`,
    tx.amount.toFixed(2),
    ledger.currency,
    tx.paymentMethod,
    tx.status === 'cleared' ? 'Pointé' : 'En attente',
    `"${(tx.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}

export function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
