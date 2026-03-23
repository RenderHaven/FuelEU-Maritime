import React, { useState, useEffect } from 'react';
import { PoolingUseCases } from '../../../core/application/PoolingUseCases';
import { RouteUseCases } from '../../../core/application/RouteUseCases';
import type { Pool, AdjustedCB } from '../../../core/domain/Pooling';


interface PoolingTabProps {
  poolingUseCases: PoolingUseCases;
  routeUseCases: RouteUseCases;
}

const PoolingTab: React.FC<PoolingTabProps> = ({ poolingUseCases, routeUseCases }) => {
  const [year, setYear] = useState('2025');
  const [availableShips, setAvailableShips] = useState<AdjustedCB[]>([]);
  const [shipsLoading, setShipsLoading] = useState(false);
  const [shipsError, setShipsError] = useState<string | null>(null);

  const [selectedShipIds, setSelectedShipIds] = useState<string[]>([]);
  const [poolResult, setPoolResult] = useState<Pool | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    routeUseCases.getRoutes().then(data => {
      const sorted = data.sort((a, b) => a.routeId.localeCompare(b.routeId));
      if (sorted.length > 0) {
        setYear(sorted[0].year.toString());
      }
    }).catch(() => { });
  }, [routeUseCases]);

  useEffect(() => {
    let cancelled = false;
    if (!year) return;

    const loadShips = async () => {
      try {
        setShipsLoading(true);
        setShipsError(null);
        const results = await poolingUseCases.getAdjustedCBsByYear(parseInt(year));
        if (!cancelled) {
          setAvailableShips(results.sort((a, b) => a.shipId.localeCompare(b.shipId)));
          setSelectedShipIds([]);
          setPoolResult(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setShipsError(err.message || 'Failed to fetch ships for the selected year');
          setAvailableShips([]);
          setSelectedShipIds([]);
        }
      } finally {
        if (!cancelled) setShipsLoading(false);
      }
    };

    loadShips();
    return () => { cancelled = true; };
  }, [year, poolingUseCases]);

  const toggleShipSelection = (shipId: string) => {
    setPoolResult(null);
    setSelectedShipIds(prev =>
      prev.includes(shipId) ? prev.filter(id => id !== shipId) : [...prev, shipId]
    );
  };

  const handleCreatePool = async () => {
    if (!year || validMembers.length < 2) return;
    try {
      setCreateLoading(true);
      setFeedback(null);
      const result = await poolingUseCases.createPool(parseInt(year), selectedShipIds);
      setPoolResult(result);
      setFeedback({ type: 'success', message: 'Pool created successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create pool' });
    } finally {
      setCreateLoading(false);
    }
  };

  const validMembers = availableShips.filter(s => selectedShipIds.includes(s.shipId));
  const poolSum = validMembers.reduce((sum, m) => sum + m.adjustedCb, 0);
  const isPoolValid = validMembers.length >= 2 && poolSum >= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Year Selection Form */}
      <div className="p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Build Compliance Pool</h3>
          <p className="text-xs text-blue-900/60 max-w-lg mb-4">
            Select a year to view all available ships and their Adjusted CB. Pooling allows surplus ships to offset deficit ships.
          </p>
          <div className="flex flex-col gap-1 w-32">
            <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${feedback.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          {feedback.message}
        </div>
      )}

      {shipsLoading && (
        <div className="py-12 text-center text-blue-500 font-medium animate-pulse">Loading ships for {year}...</div>
      )}

      {shipsError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium">
          {shipsError}
        </div>
      )}

      {/* Members List */}
      {!shipsLoading && !shipsError && availableShips.length > 0 && (
        <div className="space-y-4">
          {/* Pool Sum Indicator */}
          <div className={`p-5 rounded-2xl border shadow-lg ${poolSum >= 0
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-900/5'
            : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-red-900/5'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Selected Pool Sum (Adjusted CB)</p>
                <p className={`text-3xl font-extrabold font-mono mt-1 ${poolSum >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {poolSum.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-base font-normal text-gray-500">gCO₂eq</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{validMembers.length} ships selected</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${validMembers.length < 2
                ? 'bg-gray-100 text-gray-600 border-gray-200'
                : poolSum >= 0
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                {validMembers.length < 2 ? 'Need ≥ 2 Ships' : poolSum >= 0 ? '✓ Valid Pool' : '✗ Invalid — Sum < 0'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs">
             <button onClick={() => setSelectedShipIds(availableShips.map(s => s.shipId))} className="text-blue-600 hover:text-blue-800 font-medium">Select All</button>
             <span className="text-gray-300">|</span>
             <button onClick={() => setSelectedShipIds([])} className="text-blue-600 hover:text-blue-800 font-medium">Clear All</button>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-blue-50/50 border-b border-blue-100">
                  <th className="px-4 py-3 w-12 text-center text-xs font-bold text-blue-900"></th>
                  <th className="px-4 py-3 text-xs font-bold text-blue-900 uppercase tracking-widest">Ship ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">Raw CB (gCO₂eq)</th>
                  <th className="px-4 py-3 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">Applied Banked</th>
                  <th className="px-4 py-3 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">Adjusted CB (gCO₂eq)</th>
                  <th className="px-4 py-3 text-xs font-bold text-blue-900 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {availableShips.map((ship) => {
                  const isSelected = selectedShipIds.includes(ship.shipId);
                  const isSurplus = ship.adjustedCb >= 0;
                  return (
                    <tr 
                      key={ship.shipId} 
                      className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                      onClick={() => toggleShipSelection(ship.shipId)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {}} // Handled by tr onClick
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 font-mono">{ship.shipId}</td>
                      <td className="px-4 py-3 text-sm font-mono text-right text-gray-500">
                        {ship.cbBefore.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-right text-blue-500">
                        {ship.appliedBanked > 0 ? `+${ship.appliedBanked.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '0'}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-right font-semibold">
                        <span className={isSurplus ? 'text-green-700' : 'text-red-700'}>
                          {ship.adjustedCb.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isSurplus ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Surplus</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Deficit</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Create Pool Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleCreatePool}
              disabled={createLoading || !isPoolValid}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? 'Creating Pool...' : 'Create Pool'}
            </button>
          </div>
        </div>
      )}

      {/* Empty State when no ships available */}
      {!shipsLoading && !shipsError && availableShips.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No compliance data found for {year}.
        </div>
      )}

      {/* Pool Result */}
      {poolResult && (
        <div className="p-6 bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-900/5 animate-in fade-in slide-in-from-bottom-5 duration-500 mt-8">
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4">Pool Created — Results</h3>
          <div className="overflow-hidden rounded-xl border border-indigo-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50/50">
                  <th className="px-6 py-3 text-xs font-bold text-indigo-900 uppercase tracking-widest">Ship ID</th>
                  <th className="px-6 py-3 text-xs font-bold text-indigo-900 uppercase tracking-widest text-right">CB Before</th>
                  <th className="px-6 py-3 text-xs font-bold text-indigo-900 uppercase tracking-widest text-right">CB After</th>
                  <th className="px-6 py-3 text-xs font-bold text-indigo-900 uppercase tracking-widest text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {poolResult.members.map((member) => (
                  <tr key={member.shipId} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 font-mono">{member.shipId}</td>
                    <td className="px-6 py-3 text-sm font-mono text-right">
                      <span className={member.cbBefore >= 0 ? 'text-green-700' : 'text-red-700'}>
                        {member.cbBefore.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-right">
                      <span className={member.cbAfter >= 0 ? 'text-green-700' : 'text-red-700'}>
                        {member.cbAfter.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-right">
                      <span className={member.cbAfter - member.cbBefore >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {member.cbAfter - member.cbBefore >= 0 ? '+' : ''}{(member.cbAfter - member.cbBefore).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoolingTab;
