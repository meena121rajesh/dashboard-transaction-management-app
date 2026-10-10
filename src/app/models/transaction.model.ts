// src/app/models/transaction.model.ts

export type TransactionType = 'ALL' | 'CREDIT' | 'DEBIT';
export type TransactionStatus =  'ALL' | 'SUCCESS' | 'FAILED';

export interface Transaction {
  id: number;
  accountNumber: string;
  customerName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: string;
}

export interface DashboardSummary {
  totalCount: number;
  totalCredit: number;
  totalDebit: number;
  successCount: number;
  failedCount: number;
}
