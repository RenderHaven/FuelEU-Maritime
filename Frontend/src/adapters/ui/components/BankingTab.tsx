import React, { useState, useEffect } from 'react';
import { BankingUseCases } from '../../../core/application/BankingUseCases';
import { RouteUseCases } from '../../../core/application/RouteUseCases';
import type { ComplianceBalance, BankRecord, ApplyResult, AdjustedCB } from '../../../core/domain/Banking';
import type { Route } from '../../../core/domain/Route';

interface BankingTabProps {
  bankingUseCases: BankingUseCases;
  routeUseCases: RouteUseCases;
}

const BankingTab: React.FC<BankingTabProps> = ({ bankingUseCases, routeUseCases }) => {
  // Available routes for dropdown
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    routeUseCases.getRoutes().then(data => {
      // Deduplicate by id and sort
      const uniqueById = Array.from(new Map(data.map(r => [r.id, r])).values());
      setRoutes(uniqueById.sort((a, b) => a.id.localeCompare(b.id)));
    }).catch(() => { });
  }, []);

  // Lookup state
  const [shipId, setShipId] = useState('');
  const [year, setYear] = useState('2025');
  const [balance, setBalance] = useState<ComplianceBalance | null>(null);
  const [adjustedCb, setAdjustedCb] = useState<AdjustedCB | null>(null);
  const [bankRecords, setBankRecords] = useState<BankRecord[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Bank action state
  const [bankAmount, setBankAmount] = useState('');
  const [bankLoading, setBankLoading] = useState(false);

  // Apply action state
  const [applyAmount, setApplyAmount] = useState('');
  const [applyYear, setApplyYear] = useState('2025');
  const [applyLoading, setApplyLoading] = useState(false);

  // Action result state (cb_before / cb_after)
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);

  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch all banking data when shipId or year changes
  useEffect(() => {
    if (!shipId || !year) {
      setBalance(null);
      setAdjustedCb(null);
      setBankRecords([]);
      setApplyResult(null);
      return;
    }
    let cancelled = false;
    const fetchAll = async () => {
      try {
        setLookupLoading(true);
        setLookupError(null);
        setFeedback(null);
        setApplyResult(null);

        const [balanceRes, adjustedRes, recordsRes] = await Promise.all([
          bankingUseCases.getComplianceBalance(shipId, parseInt(year)),
          bankingUseCases.getAdjustedCb(shipId, parseInt(year)),
          bankingUseCases.getBankingRecords(shipId, parseInt(year)),
        ]);

        if (!cancelled) {
          setBalance(balanceRes);
          setAdjustedCb(adjustedRes);
          setBankRecords(recordsRes);
        }
      } catch (err: any) {
        if (!cancelled) {
          setLookupError(err.message || 'Failed to fetch compliance data');
          setBalance(null);
          setAdjustedCb(null);
          setBankRecords([]);
        }
      } finally {
        if (!cancelled) setLookupLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [shipId, year]);

  const refreshData = async () => {
    if (!shipId || !year) return;
    try {
      const [balanceRes, adjustedRes, recordsRes] = await Promise.all([
        bankingUseCases.getComplianceBalance(shipId, parseInt(year)),
        bankingUseCases.getAdjustedCb(shipId, parseInt(year)),
        bankingUseCases.getBankingRecords(shipId, parseInt(year)),
      ]);
      setBalance(balanceRes);
      setAdjustedCb(adjustedRes);
      setBankRecords(recordsRes);
    } catch { }
  };

  const handleBank = async () => {
    if (!shipId || !year || !bankAmount) return;
    try {
      setBankLoading(true);
      setFeedback(null);
      setApplyResult(null);
      const result = await bankingUseCases.bankSurplus(shipId, parseInt(year), parseFloat(bankAmount));
      setFeedback({ type: 'success', message: `Successfully banked ${result.amountGco2eq.toLocaleString()} gCO₂eq surplus` });
      setBankAmount('');
      await refreshData();
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
      const result = await bankingUseCases.applyBankedSurplus(shipId, parseInt(applyYear), parseFloat(applyAmount));
      setApplyResult(result);
      setFeedback({ type: 'success', message: `Successfully applied ${result.applied.toLocaleString()} gCO₂eq banked surplus` });
      setApplyAmount('');
      await refreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to apply banked surplus' });
    } finally {
      setApplyLoading(false);
    }
  };

  const isSurplus = balance && balance.cbGco2eq > 0;
  const totalBanked = bankRecords.filter(r => r.amountGco2eq > 0).reduce((s, r) => s + r.amountGco2eq, 0);
  const totalApplied = bankRecords.filter(r => r.amountGco2eq < 0).reduce((s, r) => s + Math.abs(r.amountGco2eq), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Selection Form */}
      <div className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-sm">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">Select Ship & Year</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Ship / Route ID</label>
            <select
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
              className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
            >
              <option value="">Select Route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.id} — {r.vesselType}</option>)}
            </select>
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
          {lookupLoading && (
            <span className="text-sm text-blue-500 font-medium animate-pulse">Loading data...</span>
          )}
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
        <div className={`p-4 rounded-xl border text-sm font-medium ${feedback.type === 'success'
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

      {/* Balance & Adjusted CB Display + Actions */}
      {balance && (
        <div className="space-y-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Raw CB */}
            <div className={`p-5 rounded-2xl border shadow-lg ${isSurplus
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-900/5'
                : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-red-900/5'
              }`}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">CB (Raw)</p>
              <p className={`text-3xl font-extrabold font-mono mt-1 ${isSurplus ? 'text-green-700' : 'text-red-700'}`}>
                {balance.cbGco2eq.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">gCO₂eq · {balance.shipId} · {balance.year}</p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 mt-2 rounded-full text-xs font-bold uppercase tracking-wider border ${isSurplus
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                {isSurplus ? '✓ Surplus' : '✗ Deficit'}
              </span>
            </div>

            {/* Adjusted CB (cb_before / appliedBanked / adjustedCb) */}
            {adjustedCb && (
              <div className="p-5 rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg shadow-blue-900/5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Adjusted CB</p>
                <p className={`text-3xl font-extrabold font-mono mt-1 ${adjustedCb.adjustedCb >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  {adjustedCb.adjustedCb.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">cb_before</span>
                    <span className="font-mono font-semibold text-gray-700">{adjustedCb.cbBefore.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">applied_banked</span>
                    <span className="font-mono font-semibold text-blue-600">+{adjustedCb.appliedBanked.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-blue-200 pt-1">
                    <span className="text-gray-500 font-bold">adjusted_cb</span>
                    <span className={`font-mono font-bold ${adjustedCb.adjustedCb >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{adjustedCb.adjustedCb.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Banked Totals */}
            <div className="p-5 rounded-2xl border bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-lg shadow-purple-900/5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Banked Summary</p>
              <p className="text-3xl font-extrabold font-mono mt-1 text-purple-700">
                {totalBanked.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total banked gCO₂eq</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Banked</span>
                  <span className="font-mono font-semibold text-green-600">+{totalBanked.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Applied</span>
                  <span className="font-mono font-semibold text-orange-600">−{totalApplied.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-purple-200 pt-1">
                  <span className="text-gray-500 font-bold">Net Balance</span>
                  <span className="font-mono font-bold text-purple-700">{(totalBanked - totalApplied).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Result KPI (cb_before → cb_after) */}
          {applyResult && (
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 shadow-lg shadow-teal-900/5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Last Apply Result</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-semibold">cb_before</p>
                  <p className="text-2xl font-extrabold font-mono text-red-600">{applyResult.cb_before.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-center">
                  <svg className="w-6 h-6 text-teal-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-semibold">applied</p>
                  <p className="text-2xl font-extrabold font-mono text-teal-600">+{applyResult.applied.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-center">
                  <svg className="w-6 h-6 text-teal-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 font-semibold">cb_after</p>
                  <p className={`text-2xl font-extrabold font-mono ${applyResult.cb_after >= 0 ? 'text-green-600' : 'text-red-600'}`}>{applyResult.cb_after.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          )}

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

          {/* Banking Records Table */}
          <div className="p-6 bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">Banking Records</h3>
            {bankRecords.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No banking records found for this ship and year.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-100">
                      <th className="text-left py-2.5 px-3 text-xs font-bold text-blue-900/60 uppercase tracking-wider">ID</th>
                      <th className="text-left py-2.5 px-3 text-xs font-bold text-blue-900/60 uppercase tracking-wider">Year</th>
                      <th className="text-right py-2.5 px-3 text-xs font-bold text-blue-900/60 uppercase tracking-wider">Amount (gCO₂eq)</th>
                      <th className="text-left py-2.5 px-3 text-xs font-bold text-blue-900/60 uppercase tracking-wider">Type</th>
                      <th className="text-left py-2.5 px-3 text-xs font-bold text-blue-900/60 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankRecords.map((record) => (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-xs text-gray-500">{record.id}</td>
                        <td className="py-2.5 px-3 text-gray-700">{record.year}</td>
                        <td className={`py-2.5 px-3 text-right font-mono font-semibold ${record.amountGco2eq >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {record.amountGco2eq >= 0 ? '+' : ''}{record.amountGco2eq.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${record.amountGco2eq >= 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                            }`}>
                            {record.amountGco2eq >= 0 ? 'Banked' : 'Applied'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 text-xs">{new Date(record.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankingTab;
