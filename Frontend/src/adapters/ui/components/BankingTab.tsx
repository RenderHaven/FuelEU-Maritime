import React, { useState } from 'react';
import { BankingUseCases } from '../../../core/application/BankingUseCases';
import type { ComplianceBalance } from '../../../core/domain/Banking';

interface BankingTabProps {
  bankingUseCases: BankingUseCases;
}

const BankingTab: React.FC<BankingTabProps> = ({ bankingUseCases }) => {
  // Lookup state
  const [shipId, setShipId] = useState('');
  const [year, setYear] = useState('2025');
  const [balance, setBalance] = useState<ComplianceBalance | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Bank action state
  const [bankAmount, setBankAmount] = useState('');
  const [bankLoading, setBankLoading] = useState(false);

  // Apply action state
  const [applyAmount, setApplyAmount] = useState('');
  const [applyYear, setApplyYear] = useState('2025');
  const [applyLoading, setApplyLoading] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleLookup = async () => {
    if (!shipId || !year) return;
    try {
      setLookupLoading(true);
      setLookupError(null);
      setFeedback(null);
      const result = await bankingUseCases.getComplianceBalance(shipId, parseInt(year));
      setBalance(result);
    } catch (err: any) {
      setLookupError(err.message || 'Failed to fetch compliance balance');
      setBalance(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleBank = async () => {
    if (!shipId || !year || !bankAmount) return;
    try {
      setBankLoading(true);
      setFeedback(null);
      await bankingUseCases.bankSurplus(shipId, parseInt(year), parseFloat(bankAmount));
      setFeedback({ type: 'success', message: `Successfully banked ${bankAmount} gCO₂eq surplus` });
      setBankAmount('');
      // Refresh balance
      const result = await bankingUseCases.getComplianceBalance(shipId, parseInt(year));
      setBalance(result);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to bank surplus' });
    } finally {
      setBankLoading(false);
    }
  };

  const handleApply = async () => {
    if (!shipId || !applyYear || !applyAmount) return;
    try {
      setApplyLoading(true);
      setFeedback(null);
      await bankingUseCases.applyBankedSurplus(shipId, parseInt(applyYear), parseFloat(applyAmount));
      setFeedback({ type: 'success', message: `Successfully applied ${applyAmount} gCO₂eq banked surplus` });
      setApplyAmount('');
      // Refresh balance
      const result = await bankingUseCases.getComplianceBalance(shipId, parseInt(year));
      setBalance(result);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to apply banked surplus' });
    } finally {
      setApplyLoading(false);
    }
  };

  const isSurplus = balance && balance.cbGco2eq > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Lookup Form */}
      <div className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-sm">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">Compliance Balance Lookup</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Ship / Route ID</label>
            <input
              type="text"
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
              placeholder="e.g. R001"
              className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-28"
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={lookupLoading || !shipId || !year}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {lookupLoading ? 'Loading...' : 'Get Balance'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {lookupError && (
        <div className="p-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-red-100 shadow-2xl shadow-red-900/10">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Lookup Failed</h2>
            <p className="text-gray-500">{lookupError}</p>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${
          feedback.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Balance not looked up yet */}
      {!balance && !lookupError && !lookupLoading && (
        <div className="p-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-blue-100 shadow-2xl shadow-blue-900/10">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Banking Compliance</h2>
            <p className="text-gray-500">Enter a Ship/Route ID and year above to view the compliance balance and manage banking operations.</p>
          </div>
        </div>
      )}

      {/* Balance Display & Actions */}
      {balance && (
        <div className="space-y-6">
          {/* KPI Card */}
          <div className={`p-6 rounded-2xl border shadow-xl ${
            isSurplus
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-900/5'
              : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-red-900/5'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Compliance Balance</p>
                <p className={`text-4xl font-extrabold font-mono mt-1 ${isSurplus ? 'text-green-700' : 'text-red-700'}`}>
                  {balance.cbGco2eq.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500 mt-1">gCO₂eq · Ship <span className="font-mono font-bold">{balance.shipId}</span> · Year {balance.year}</p>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isSurplus ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className="text-3xl">{isSurplus ? '📈' : '📉'}</span>
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                isSurplus
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}>
                {isSurplus ? '✓ Surplus' : '✗ Deficit'}
              </span>
            </div>
          </div>

          {/* Banking Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Surplus */}
            <div className="p-6 bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-1">Bank Surplus</h3>
              <p className="text-xs text-gray-400 mb-4">Save positive compliance balance for future use (Article 20)</p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Amount (gCO₂eq)</label>
                  <input
                    type="number"
                    value={bankAmount}
                    onChange={(e) => setBankAmount(e.target.value)}
                    placeholder="Amount to bank"
                    disabled={!isSurplus}
                    className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:bg-gray-50"
                  />
                </div>
                <button
                  onClick={handleBank}
                  disabled={bankLoading || !isSurplus || !bankAmount}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg shadow-green-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bankLoading ? 'Banking...' : 'Bank Surplus'}
                </button>
                {!isSurplus && (
                  <p className="text-xs text-red-500 font-medium">Cannot bank — compliance balance is in deficit</p>
                )}
              </div>
            </div>

            {/* Apply Banked */}
            <div className="p-6 bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-1">Apply Banked Surplus</h3>
              <p className="text-xs text-gray-400 mb-4">Use previously banked surplus to offset a deficit (Article 20)</p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Target Year</label>
                  <input
                    type="number"
                    value={applyYear}
                    onChange={(e) => setApplyYear(e.target.value)}
                    className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Amount (gCO₂eq)</label>
                  <input
                    type="number"
                    value={applyAmount}
                    onChange={(e) => setApplyAmount(e.target.value)}
                    placeholder="Amount to apply"
                    className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleApply}
                  disabled={applyLoading || !applyAmount || !applyYear}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applyLoading ? 'Applying...' : 'Apply Banked'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankingTab;
