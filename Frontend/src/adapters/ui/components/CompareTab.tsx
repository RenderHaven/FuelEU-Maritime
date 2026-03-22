import React, { useEffect, useState, useRef } from 'react';
import { RouteUseCases } from '../../../core/application/RouteUseCases';
import type { ComparisonResponse, RouteComparison } from '../../../core/domain/Comparison';
import type { Route } from '../../../core/domain/Route';
import { CheckCircle, XCircle } from 'lucide-react';

interface CompareTabProps {
  routeUseCases: RouteUseCases;
}

const TARGET_INTENSITY = 89.3368;

const CompareTab: React.FC<CompareTabProps> = ({ routeUseCases }) => {
  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        const result = await routeUseCases.getComparison();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch comparison data');
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, []);

  // Draw chart when data changes
  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 40, right: 30, bottom: 60, left: 70 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const routes = data.comparisons;
    const allIntensities = routes.map(r => r.ghgIntensity);
    const maxVal = Math.max(...allIntensities, TARGET_INTENSITY) * 1.1;
    const minVal = Math.min(...allIntensities, TARGET_INTENSITY) * 0.9;
    const range = maxVal - minVal;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    const gridLines = 5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      const val = maxVal - (range / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(1), padding.left - 8, y + 4);
    }

    // Y axis label
    ctx.save();
    ctx.translate(14, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GHG Intensity (gCO₂e/MJ)', 0, 0);
    ctx.restore();

    // Target line
    const targetY = padding.top + chartH - ((TARGET_INTENSITY - minVal) / range) * chartH;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, targetY);
    ctx.lineTo(w - padding.right, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Target: ${TARGET_INTENSITY}`, w - padding.right + 2, targetY - 6);

    // Bars
    const barGap = 8;
    const barWidth = Math.min((chartW - barGap * (routes.length + 1)) / routes.length, 60);
    const totalBarsWidth = routes.length * barWidth + (routes.length - 1) * barGap;
    const startX = padding.left + (chartW - totalBarsWidth) / 2;

    routes.forEach((route, i) => {
      const x = startX + i * (barWidth + barGap);
      const barH = ((route.ghgIntensity - minVal) / range) * chartH;
      const y = padding.top + chartH - barH;

      // Bar gradient
      const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartH);
      if (route.compliant) {
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#1d4ed8');
      } else {
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(1, '#ea580c');
      }
      ctx.fillStyle = gradient;

      // Rounded top bar
      const radius = Math.min(4, barWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x, padding.top + chartH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, padding.top + chartH);
      ctx.closePath();
      ctx.fill();

      // Value on top
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(route.ghgIntensity.toFixed(1), x + barWidth / 2, y - 6);

      // Label at bottom
      ctx.fillStyle = '#475569';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.save();
      ctx.translate(x + barWidth / 2, padding.top + chartH + 12);
      ctx.fillText(route.routeId, 0, 0);
      ctx.restore();
    });

    // Baseline indicator
    if (data.baseline) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Baseline: ${data.baseline.routeId} (${data.baseline.ghgIntensity.toFixed(2)} gCO₂e/MJ)`, w / 2, h - 8);
    }
  }, [data]);

  if (loading) return (
    <div className="p-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-blue-100 shadow-2xl shadow-blue-900/10">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Loading Comparison</h2>
        <p className="text-gray-500">Analyzing baseline vs current performance...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-red-100 shadow-2xl shadow-red-900/10">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-900 mb-2">Comparison Error</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Baseline Info Card */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Baseline Route</p>
            <p className="text-lg font-bold text-blue-900">
              {data.baseline.routeId} — {data.baseline.vesselType} / {data.baseline.fuelType}
            </p>
            <p className="text-sm text-blue-700">
              GHG Intensity: <span className="font-mono font-bold">{data.baseline.ghgIntensity.toFixed(2)}</span> gCO₂e/MJ
              &nbsp;·&nbsp; Target: <span className="font-mono font-bold">{TARGET_INTENSITY}</span> gCO₂e/MJ
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5 p-6">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">GHG Intensity Comparison</h3>
        <canvas ref={canvasRef} style={{ width: '100%', height: '320px' }} className="rounded-xl" />
      </div>

      {/* Comparison Table */}
      <div className="overflow-hidden bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-50/50">
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest">Route ID</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest">Vessel</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest">Fuel</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">GHG (gCO₂e/MJ)</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">% Diff vs Baseline</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-center">Compliant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {data.comparisons
              .sort((a, b) => a.routeId.localeCompare(b.routeId))
              .map((route) => (
              <tr key={route.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{route.routeId}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.vesselType}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.fuelType}</td>
                <td className="px-6 py-4 text-sm text-blue-700 font-mono text-right">{route.ghgIntensity.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm font-mono text-right">
                  <span className={route.percentDiff > 0 ? 'text-red-600' : 'text-green-600'}>
                    {route.percentDiff > 0 ? '+' : ''}{route.percentDiff.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {route.compliant ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200 shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider border border-red-200 shadow-sm">
                      <XCircle className="w-3.5 h-3.5" /> No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareTab;
