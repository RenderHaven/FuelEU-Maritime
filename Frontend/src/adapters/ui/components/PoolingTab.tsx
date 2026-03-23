import React, { useState, useEffect } from 'react';
import { PoolingUseCases } from '../../../core/application/PoolingUseCases';
import { RouteUseCases } from '../../../core/application/RouteUseCases';
import type { Pool, AdjustedCB } from '../../../core/domain/Pooling';
import type { Route } from '../../../core/domain/Route';

interface PoolingTabProps {
  poolingUseCases: PoolingUseCases;
  routeUseCases: RouteUseCases;
}

interface MemberEntry {
  shipId: string;
  adjustedCB: AdjustedCB | null;
  loading: boolean;
  error: string | null;
}

const PoolingTab: React.FC<PoolingTabProps> = ({ poolingUseCases, routeUseCases }) => {
  // Available routes for dropdown
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    routeUseCases.getRoutes().then(data => {
      // Deduplicate by id and sort
      const uniqueById = Array.from(new Map(data.map(r => [r.id, r])).values());
      setRoutes(uniqueById.sort((a, b) => a.id.localeCompare(b.id)));
    }).catch(() => {});
  }, []);
  const [year, setYear] = useState('2025');
  const [newShipId, setNewShipId] = useState('');
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [poolResult, setPoolResult] = useState<Pool | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddMember = async () => {
    if (!newShipId || !year) return;
    if (members.some(m => m.shipId === newShipId)) {
      setFeedback({ type: 'error', message: `Ship ${newShipId} is already added` });
      return;
    }
    setFeedback(null);

    const entry: MemberEntry = { shipId: newShipId, adjustedCB: null, loading: true, error: null };
    setMembers(prev => [...prev, entry]);
    setNewShipId('');

    try {
      const result = await poolingUseCases.getAdjustedCB(newShipId, parseInt(year));
      setMembers(prev => prev.map(m =>
        m.shipId === entry.shipId ? { ...m, adjustedCB: result, loading: false } : m
      ));
    } catch (err: any) {
      setMembers(prev => prev.map(m =>
        m.shipId === entry.shipId ? { ...m, error: err.message || 'Failed to fetch', loading: false } : m
      ));
    }
  };

  const handleRemoveMember = (shipId: string) => {
    setMembers(prev => prev.filter(m => m.shipId !== shipId));
    setPoolResult(null);
  };

  const handleCreatePool = async () => {
    if (!year || validMembers.length < 2) return;
    try {
      setCreateLoading(true);
      setFeedback(null);
      const shipIds = validMembers.map(m => m.shipId);
      const result = await poolingUseCases.createPool(parseInt(year), shipIds);
      setPoolResult(result);
      setFeedback({ type: 'success', message: 'Pool created successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create pool' });
    } finally {
      setCreateLoading(false);
    }
  };

  const validMembers = members.filter(m => m.adjustedCB && !m.error);
  const poolSum = validMembers.reduce((sum, m) => sum + (m.adjustedCB?.adjustedCb ?? 0), 0);
  const isPoolValid = validMembers.length >= 2 && poolSum >= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Add Members Form */}
      <div className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-sm">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">Build Compliance Pool</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => { setYear(e.target.value); setMembers([]); setPoolResult(null); }}
              className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Ship / Route ID</label>
            <select
              value={newShipId}
              onChange={(e) => setNewShipId(e.target.value)}
              className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
            >
              <option value="">Select Route</option>
              {routes
                .filter(r => !members.some(m => m.shipId === r.id))
                .map(r => <option key={r.id} value={r.id}>{r.id} — {r.vesselType}</option>)}
            </select>
          </div>
          <button
            onClick={handleAddMember}
            disabled={!newShipId || !year}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Member
          </button>
        </div>
      </div>

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

      {/* Empty State */}
      {members.length === 0 && (
        <div className="p-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-blue-100 shadow-2xl shadow-blue-900/10">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Vessel Pooling</h2>
            <p className="text-gray-500">Add ships above to build a compliance pool. Pooling allows surplus ships to offset deficit ships (Article 21).</p>
          </div>
        </div>
      )}

      {/* Members List */}
      {members.length > 0 && (
        <div className="space-y-4">
          {/* Pool Sum Indicator */}
          <div className={`p-5 rounded-2xl border shadow-lg ${
            poolSum >= 0
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-900/5'
              : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-red-900/5'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pool Sum (Adjusted CB)</p>
                <p className={`text-3xl font-extrabold font-mono mt-1 ${poolSum >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {poolSum.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-base font-normal text-gray-500">gCO₂eq</span>
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                poolSum >= 0
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}>
                {poolSum >= 0 ? '✓ Valid Pool' : '✗ Invalid — Sum < 0'}
              </span>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-hidden bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest">Ship ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">Adjusted CB (gCO₂eq)</th>
                  <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {members.map((member) => (
                  <tr key={member.shipId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">{member.shipId}</td>
                    <td className="px-6 py-4 text-sm font-mono text-right">
                      {member.loading ? (
                        <span className="text-gray-400">Loading...</span>
                      ) : member.error ? (
                        <span className="text-red-500 text-xs">{member.error}</span>
                      ) : (
                        <span className={member.adjustedCB!.adjustedCb >= 0 ? 'text-green-700' : 'text-red-700'}>
                          {member.adjustedCB!.adjustedCb.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {member.loading ? (
                        <span className="text-xs text-gray-400">...</span>
                      ) : member.error ? (
                        <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Error</span>
                      ) : member.adjustedCB!.adjustedCb >= 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Surplus</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Deficit</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemoveMember(member.shipId)}
                        className="px-3 py-1 text-xs font-bold text-red-600 uppercase tracking-wider hover:bg-red-50 rounded-lg transition-all border border-red-200"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create Pool Button */}
          <div className="flex justify-end">
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

      {/* Pool Result */}
      {poolResult && (
        <div className="p-6 bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-900/5 animate-in fade-in slide-in-from-bottom-5 duration-500">
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
