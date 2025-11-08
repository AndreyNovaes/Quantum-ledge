/**
 * Reports Page - View and export transaction reports
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TransactionTable } from '@/components/reports/TransactionTable';
import { getInitialUserProfile } from '@/lib/mock-data';
import { Transaction } from '@/lib/types';

export default function ReportsPage() {
  const userProfile = getInitialUserProfile();

  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [transactionType, setTransactionType] = useState<string>('all');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...userProfile.transactions];

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(t => t.date >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(t => t.date <= end);
    }

    // Filter by type
    if (transactionType !== 'all') {
      filtered = filtered.filter(t => t.type === transactionType);
    }

    // Sort by date descending
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    return filtered;
  }, [userProfile.transactions, startDate, endDate, transactionType]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'From Account', 'To Account', 'Amount', 'Status'];

    const rows = filteredTransactions.map(t => [
      t.date.toISOString(),
      t.description,
      t.type,
      t.fromAccount,
      t.toAccount,
      t.amount.toNumber().toFixed(2),
      t.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (simplified - just triggers download)
  const handleExportPDF = async () => {
    // In a real application, you would use jsPDF here
    // For now, we'll simulate the export
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Transaction Report', 14, 20);

    // Add date range
    doc.setFontSize(10);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);

    // Prepare table data
    const headers = [['Date', 'Description', 'Type', 'Amount', 'Status']];
    const data = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.type,
      t.amount.format(),
      t.status,
    ]);

    // Add table
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [14, 165, 233] },
    });

    // Save PDF
    doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const transactionTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'investment', label: 'Investment' },
    { value: 'dividend', label: 'Dividend' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction Reports</h1>
        <p className="text-gray-600 mt-1">View and export your transaction history</p>
      </div>

      {/* Filters */}
      <Card data-testid="filters-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Start Date"
              data-testid="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="End Date"
              data-testid="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <Select
              label="Transaction Type"
              data-testid="transaction-type"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              options={transactionTypeOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-gray-600">
          Showing <span className="font-semibold" data-testid="transaction-count">{filteredTransactions.length}</span> transactions
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            data-testid="export-csv"
          >
            Export to CSV
          </Button>
          <Button
            variant="primary"
            onClick={handleExportPDF}
            data-testid="export-pdf"
          >
            Export to PDF
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card data-testid="transactions-card">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={filteredTransactions} data-testid="transactions-table" />
        </CardContent>
      </Card>
    </div>
  );
}
