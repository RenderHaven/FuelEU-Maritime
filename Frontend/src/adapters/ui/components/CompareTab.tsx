import React from 'react';

const CompareTab: React.FC = () => (
  <div className="p-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
    <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-blue-100 shadow-2xl shadow-blue-900/10">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-blue-900 mb-2">Compare Routes</h2>
      <p className="text-gray-500">Analyze baseline vs current performance targets. Implementation coming soon.</p>
    </div>
  </div>
);

export default CompareTab;
