import React, { useEffect, useState, useMemo } from 'react';
import { RouteUseCases } from '../../../core/application/RouteUseCases';
import type { Route } from '../../../core/domain/Route';
import { CheckCircle } from 'lucide-react';

interface RoutesTabProps {
  routeUseCases: RouteUseCases;
}

const RoutesTab: React.FC<RoutesTabProps> = ({ routeUseCases }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [vesselFilter, setVesselFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const data = await routeUseCases.getRoutes();
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSetBaseline = async (routeId: string) => {
    try {
      await routeUseCases.setBaseline(routeId);
      await fetchRoutes(); // Refresh data
    } catch (err: any) {
      alert(err.message || 'Failed to set baseline');
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const matchVessel = vesselFilter === '' || route.vesselType === vesselFilter;
      const matchFuel = fuelFilter === '' || route.fuelType === fuelFilter;
      const matchYear = yearFilter === '' || route.year.toString() === yearFilter;
      return matchVessel && matchFuel && matchYear;
    });
  }, [routes, vesselFilter, fuelFilter, yearFilter]);

  const uniqueVessels = Array.from(new Set(routes.map(r => r.vesselType)));
  const uniqueFuels = Array.from(new Set(routes.map(r => r.fuelType)));
  const uniqueYears = Array.from(new Set(routes.map(r => r.year.toString())));

  if (loading) return <div className="p-8 text-center text-gray-500">Loading routes...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Vessel Type</label>
          <select 
            value={vesselFilter} 
            onChange={(e) => setVesselFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Vessels</option>
            {uniqueVessels.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Fuel Type</label>
          <select 
            value={fuelFilter} 
            onChange={(e) => setFuelFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Fuels</option>
            {uniqueFuels.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-blue-900/60 uppercase tracking-wider">Year</label>
          <select 
            value={yearFilter} 
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Years</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-900/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-50/50">
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest">ID</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest">Vessel</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest">Fuel</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-center">Year</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">GHG (g/MJ)</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">Cons. (t)</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">Dist. (km)</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-right">Emissions (t)</th>
              <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {filteredRoutes.map((route) => (
              <tr key={route.id} className={`hover:bg-blue-50/30 transition-colors ${route.isBaseline ? 'bg-blue-50/80 font-medium' : ''}`}>
                <td className="px-6 py-4 text-sm text-gray-900">{route.routeId}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.vesselType}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{route.fuelType}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-center">{route.year}</td>
                <td className="px-6 py-4 text-sm text-blue-700 font-mono text-right">{route.ghgIntensity.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-right">{route.fuelConsumption.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-right">{route.distance.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-red-600 font-medium text-right">{route.totalEmissions.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  {route.isBaseline ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200 shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" /> Baseline
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleSetBaseline(route.routeId)}
                      className="px-3 py-1 text-xs font-bold text-blue-700 uppercase tracking-wider hover:bg-blue-100 rounded-lg transition-all border border-blue-200"
                    >
                      Set Baseline
                    </button>
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

export default RoutesTab;
