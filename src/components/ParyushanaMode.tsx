import React, { useState, useEffect } from 'react';

const ParyushanaMode: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isParyushana, setIsParyushana] = useState(false);

  useEffect(() => {
    // 2026 Paryushana Dates (Approximated for Bhadrapad)
    // Replace with exact dates from your Panchang
    const paryushanaStart = new Date('2026-08-25'); 
    const paryushanaEnd = new Date('2026-09-02'); // Samvatsari
    const today = new Date();

    if (today >= paryushanaStart && today <= paryushanaEnd) {
      setIsParyushana(true);
    }
  }, []);

  if (!isParyushana) {
    return <>{children}</>; // Normal UI
  }

  return (
    <div className="paryushana-theme bg-stone-50 min-h-screen border-t-4 border-yellow-600">
      <div className="bg-yellow-600 text-white text-center py-2 text-sm font-semibold tracking-wider">
        🙏 PARYUSHANA MAHA PARVA IS ACTIVE 🙏
      </div>
      
      {/* Auto-injected shortcuts during Paryushana */}
      <div className="flex justify-around bg-white p-3 shadow-sm mb-4">
        <button className="text-yellow-700 font-bold">📖 Pratikraman Guide</button>
        <button className="text-yellow-700 font-bold">⏳ Fasting (Tapa) Tracker</button>
      </div>

      {children}
    </div>
  );
};

export default ParyushanaMode;
