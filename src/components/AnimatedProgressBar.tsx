import React from 'react';

export const AnimatedProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="w-full h-2.5 bg-[#111] rounded-full overflow-hidden relative border border-gray-800">
      <div 
        className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-1000 ease-out shadow-neon-amber relative" 
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
      </div>
    </div>
  );
};
