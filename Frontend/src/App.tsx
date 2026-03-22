import React, { useState, useMemo } from 'react';
import { RouteApiAdapter } from './adapters/infrastructure/api/RouteApiAdapter';
import { BankingApiAdapter } from './adapters/infrastructure/api/BankingApiAdapter';
import { PoolingApiAdapter } from './adapters/infrastructure/api/PoolingApiAdapter';
import { RouteUseCases } from './core/application/RouteUseCases';
import { BankingUseCases } from './core/application/BankingUseCases';
import { PoolingUseCases } from './core/application/PoolingUseCases';
import RoutesTab from './adapters/ui/components/RoutesTab';
import CompareTab from './adapters/ui/components/CompareTab';
import BankingTab from './adapters/ui/components/BankingTab';
import PoolingTab from './adapters/ui/components/PoolingTab';
import { Ship, LayoutDashboard, BarChart3, Landmark, Users } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routes' | 'compare' | 'banking' | 'pooling'>('routes');

  // Hexagonal Dependency Injection
  const routeApiAdapter = useMemo(() => new RouteApiAdapter(), []);
  const bankingApiAdapter = useMemo(() => new BankingApiAdapter(), []);
  const poolingApiAdapter = useMemo(() => new PoolingApiAdapter(), []);

  const routeUseCases = useMemo(() => new RouteUseCases(routeApiAdapter), [routeApiAdapter]);
  const bankingUseCases = useMemo(() => new BankingUseCases(bankingApiAdapter), [bankingApiAdapter]);
  const poolingUseCases = useMemo(() => new PoolingUseCases(poolingApiAdapter), [poolingApiAdapter]);

  const tabs = [
    { id: 'routes', label: 'Routes', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'banking', label: 'Banking', icon: <Landmark className="w-4 h-4" /> },
    { id: 'pooling', label: 'Pooling', icon: <Users className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Ship className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">FuelEU Maritime</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mt-1">Compliance Dashboard</p>
            </div>
          </div>
          
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 opacity-100' 
                    : 'text-slate-500 hover:text-slate-900 opacity-70 hover:opacity-100'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {tabs.find(t => t.id === activeTab)?.label} Overview
          </h2>
          <p className="text-slate-500 mt-1">Monitor and manage your fleet's GHG intensity and compliance status.</p>
        </div>

        <div className="relative">
          {activeTab === 'routes' && <RoutesTab routeUseCases={routeUseCases} />}
          {activeTab === 'compare' && <CompareTab routeUseCases={routeUseCases} />}
          {activeTab === 'banking' && <BankingTab bankingUseCases={bankingUseCases} routeUseCases={routeUseCases} />}
          {activeTab === 'pooling' && <PoolingTab poolingUseCases={poolingUseCases} routeUseCases={routeUseCases} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 mt-12 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">
          &copy; 2024 FuelEU Compliance System &bull; Strictly Hexagonal Architecture
        </p>
      </footer>
    </div>
  );
};

export default App;
