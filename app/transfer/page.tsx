/**
 * Transfer Page - Money transfer between accounts with currency conversion
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useMarketDataContext } from '@/lib/MarketDataContext';
import { getInitialUserProfile } from '@/lib/mock-data';
import { Money, parseMoney } from '@/lib/currency';

export default function TransferPage() {
  const { exchangeRates } = useMarketDataContext();
  const userProfile = getInitialUserProfile();

  const [fromAccountId, setFromAccountId] = useState(userProfile.accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(userProfile.accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [convertCurrency, setConvertCurrency] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fromAccount = userProfile.accounts.find(a => a.id === fromAccountId);
  const toAccount = userProfile.accounts.find(a => a.id === toAccountId);

  // Parse amount
  const parsedAmount = useMemo(() => {
    if (!amount || !fromAccount) return null;

    try {
      return parseMoney(amount, fromAccount.currency);
    } catch {
      return null;
    }
  }, [amount, fromAccount]);

  // Calculate exchange rate if needed
  const exchangeRate = useMemo(() => {
    if (!convertCurrency || !fromAccount || !toAccount) return null;
    if (fromAccount.currency === toAccount.currency) return null;

    const rateKey = `${fromAccount.currency}-${toAccount.currency}`;
    return exchangeRates[rateKey]?.rate || null;
  }, [convertCurrency, fromAccount, toAccount, exchangeRates]);

  // Calculate converted amount
  const convertedAmount = useMemo(() => {
    if (!parsedAmount || !exchangeRate || !toAccount) return null;

    return parsedAmount.convert(toAccount.currency, exchangeRate);
  }, [parsedAmount, exchangeRate, toAccount]);

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (fromAccountId === toAccountId) {
      errs.general = 'Cannot transfer to the same account';
    }

    if (!parsedAmount) {
      if (amount) {
        errs.amount = 'Invalid amount';
      }
    } else {
      if (fromAccount && parsedAmount.greaterThan(fromAccount.balance)) {
        errs.amount = 'Insufficient funds';
      }

      if (parsedAmount.lessThanOrEqual(new Money(0, fromAccount?.currency || 'USD'))) {
        errs.amount = 'Amount must be greater than zero';
      }
    }

    if (convertCurrency && fromAccount && toAccount && fromAccount.currency === toAccount.currency) {
      errs.general = 'Accounts have same currency - no conversion needed';
    }

    return errs;
  }, [fromAccountId, toAccountId, parsedAmount, fromAccount, toAccount, amount, convertCurrency]);

  const isValid = Object.keys(errors).length === 0 && parsedAmount && amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isValid) {
      setIsModalOpen(true);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsProcessing(false);
    setIsModalOpen(false);

    // Reset form
    setAmount('');
    setDescription('');
    setConvertCurrency(false);

    alert('Transfer completed successfully!');
  };

  const accountOptions = userProfile.accounts.map(account => ({
    value: account.id,
    label: `${account.name} (${account.balance.format()})`,
  }));

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transfer Funds</h1>
        <p className="text-gray-600 mt-1">Transfer money between your accounts</p>
      </div>

      {errors.general && (
        <div className="bg-danger-light border border-danger text-danger-dark px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      <Card data-testid="transfer-form-card">
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From Account */}
            <Select
              label="From Account"
              data-testid="from-account"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              options={accountOptions}
            />

            {fromAccount && (
              <div className="text-sm text-gray-600" data-testid="from-account-balance">
                Available Balance: <span className="font-semibold">{fromAccount.balance.format()}</span>
              </div>
            )}

            {/* To Account */}
            <Select
              label="To Account"
              data-testid="to-account"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              options={accountOptions}
            />

            {/* Amount */}
            <Input
              label="Amount"
              data-testid="amount"
              type="text"
              value={amount}
              onChange={(e) => {
                // Only allow numbers and decimal point
                const value = e.target.value.replace(/[^\d.]/g, '');
                // Prevent multiple decimal points
                const parts = value.split('.');
                if (parts.length > 2) return;

                setAmount(value);
              }}
              placeholder="0.00"
              error={errors.amount}
            />

            {/* Description */}
            <Input
              label="Description (Optional)"
              data-testid="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this transfer for?"
            />

            {/* Convert Currency */}
            {fromAccount && toAccount && fromAccount.currency !== toAccount.currency && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="convert-currency"
                  data-testid="convert-currency"
                  checked={convertCurrency}
                  onChange={(e) => setConvertCurrency(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="convert-currency" className="text-sm font-medium text-gray-700">
                  Convert to {toAccount.currency} (different currency detected)
                </label>
              </div>
            )}

            {/* Exchange Rate Info */}
            {convertCurrency && exchangeRate && convertedAmount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Exchange Rate:</span>
                  <span className="ml-2" data-testid="exchange-rate">
                    1 {fromAccount?.currency} = {exchangeRate.toFixed(6)} {toAccount?.currency}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Amount to be received:</span>
                  <span className="ml-2 font-semibold text-primary-600" data-testid="converted-amount">
                    {convertedAmount.format()}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!isValid}
              data-testid="submit-transfer"
            >
              Transfer Funds
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Transfer"
        data-testid="confirmation-modal"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">From:</span>
              <span className="font-semibold" data-testid="modal-from-account">{fromAccount?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To:</span>
              <span className="font-semibold" data-testid="modal-to-account">{toAccount?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-lg" data-testid="modal-amount">
                {parsedAmount?.format()}
              </span>
            </div>
            {convertedAmount && (
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Recipient Receives:</span>
                <span className="font-semibold text-lg text-primary-600" data-testid="modal-converted-amount">
                  {convertedAmount.format()}
                </span>
              </div>
            )}
            {description && (
              <div className="border-t pt-3">
                <span className="text-gray-600">Description:</span>
                <p className="mt-1" data-testid="modal-description">{description}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
              disabled={isProcessing}
              data-testid="modal-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleConfirm}
              disabled={isProcessing}
              data-testid="modal-confirm"
            >
              {isProcessing ? 'Processing...' : 'Confirm Transfer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
