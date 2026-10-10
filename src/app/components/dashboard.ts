// src/app/components/dashboard/dashboard.component.ts

import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Transaction, TransactionType, TransactionStatus, DashboardSummary } from '../models/transaction.model';

@Component({
  selector: 'app-transaction-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // 🚀 बेस्ट प्रैक्टिस फॉर एंगुलर 20
})
export class TransactionDashboard {
  
  // 1. सैंपल डेटा (Source Data)
  private readonly rawTransactions: Transaction[] = [
    { id: 101, accountNumber: 'ACC1001', customerName: 'John Smith', type: 'CREDIT', amount: 5000, status: 'SUCCESS', date: '2026-09-25' },
    { id: 102, accountNumber: 'ACC1002', customerName: 'Rahul Mehta', type: 'DEBIT', amount: 1200, status: 'SUCCESS', date: '2026-09-26' },
    { id: 103, accountNumber: 'ACC1001', customerName: 'John Smith', type: 'DEBIT', amount: 800, status: 'FAILED', date: '2026-09-27' },
    { id: 104, accountNumber: 'ACC1003', customerName: 'Priya Shah', type: 'CREDIT', amount: 7500, status: 'SUCCESS', date: '2026-09-28' },
    { id: 105, accountNumber: 'ACC1004', customerName: 'Amit Patel', type: 'DEBIT', amount: 2500, status: 'SUCCESS', date: '2026-09-29' },
    { id: 106, accountNumber: 'ACC1002', customerName: 'Rahul Mehta', type: 'CREDIT', amount: 3000, status: 'SUCCESS', date: '2026-09-29' }
  ];

  // 2. फ़िल्टर्स के लिए सिग्नल्स
  public typeFilter = signal<TransactionType | 'ALL'>('ALL');
  public statusFilter = signal<TransactionStatus | 'ALL'>('ALL');

  // 3. RxJS सर्च मैकेनिज्म (300ms Debounce के साथ)
  private searchSubject = new Subject<string>();
  
  // toSignal की मदद से RxJS स्ट्रीम को सीधे सिग्नल में बदल दिया
  public searchQuery = toSignal(
    this.searchSubject.pipe(
      debounceTime(300),          // ⏱️ 300ms का डिले
      distinctUntilChanged()      // केवल वैल्यू बदलने पर ट्रिगर होगा
    ),
    { initialValue: '' }          // शुरुआती वैल्यू खाली स्ट्रिंग
  );

  // 4. सर्च इनपुट इवेंट हैंडलर
  public onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchSubject.next(inputElement.value);
  }

  // 5. फ़िल्टर्स और सर्च को कम्बाइन करके लाइव फ़िल्टर्ड डेटा निकालना (Computed Signal)
  public filteredTransactions = computed<Transaction[]>(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const type = this.typeFilter();
    const status = this.statusFilter();

    return this.rawTransactions.filter((tx) => {
      const matchesSearch = !search || 
        tx.customerName.toLowerCase().includes(search) || 
        tx.accountNumber.toLowerCase().includes(search);
      
      const matchesType = type === 'ALL' || tx.type === type;
      const matchesStatus = status === 'ALL' || tx.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  });

  // 6. लाइव समरी कैलकुलेशन (यह फ़िल्टर्ड डेटा के बदलते ही खुद अपडेट होगी)
  public summary = computed<DashboardSummary>(() => {
    const txs = this.filteredTransactions();
    
    return txs.reduce(
      (acc, tx) => {
        acc.totalCount++;
        
        if (tx.type === 'CREDIT') acc.totalCredit += tx.amount;
        if (tx.type === 'DEBIT') acc.totalDebit += tx.amount;
        if (tx.status === 'SUCCESS') acc.successCount++;
        if (tx.status === 'FAILED') acc.failedCount++;
        
        return acc;
      },
      { totalCount: 0, totalCredit: 0, totalDebit: 0, successCount: 0, failedCount: 0 }
    );
  });
}
