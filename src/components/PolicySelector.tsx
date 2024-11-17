import React from 'react';
import { Shield } from 'lucide-react';

export default function PolicySelector() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold">Policy Options</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Policy options will go here */}
      </div>
    </div>
  );
}