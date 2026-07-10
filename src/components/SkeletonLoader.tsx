import React from 'react';

export const SkeletonLoader: React.FC = () => (
  <div className="space-y-4 animate-pulse p-4">
    {[...Array(5)].map((_, i) => (
      <div 
        key={i} 
        className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full border border-slate-100 dark:border-slate-800/40" 
      />
    ))}
  </div>
);

export default SkeletonLoader;
