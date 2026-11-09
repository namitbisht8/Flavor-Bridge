import React from 'react';
import { Database } from 'lucide-react';

export const SampleBadge: React.FC = () => {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF0C5] text-[#193826] border border-[#193826] shadow-[1px_1px_0px_#193826]">
      <Database className="w-3 h-3 text-[#FF7B25]" />
      <span>Sample data</span>
    </span>
  );
};
