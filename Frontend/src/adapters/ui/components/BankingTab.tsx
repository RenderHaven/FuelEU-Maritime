import React from 'react';

const BankingTab: React.FC = () => (
  <div className="p-12 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
    <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-blue-100 shadow-2xl shadow-blue-900/10">
      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-blue-900 mb-2">Banking Compliance</h2>
      <p className="text-gray-500">Manage surplus for future compliance balances. Implementation coming soon.</p>
    </div>
  </div>
);

export default BankingTab;
