import React, { useEffect, useState } from 'react';

export default function WeatherEffects({ condition, lightningRisk }: { condition: string, lightningRisk: string }) {
  const [isLightning, setIsLightning] = useState(false);

  useEffect(() => {
    if (lightningRisk === 'উচ্চ ঝুঁকি') {
      const interval = setInterval(() => {
        setIsLightning(true);
        setTimeout(() => setIsLightning(false), 150);
      }, 5000 + Math.random() * 5000);
      return () => clearInterval(interval);
    }
  }, [lightningRisk]);

  return (
    <>
      {/* Lightning Effect */}
      <div 
        className={`fixed inset-0 pointer-events-none z-50 bg-white transition-opacity duration-150 ${isLightning ? 'opacity-30' : 'opacity-0'}`}
      />
      
      {/* Rain/Lightning overlay container */}
      {condition.includes('বৃষ্টি') && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-blue-300/30 w-[1px] h-10 animate-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes rain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-rain { animation: rain linear infinite; }
      `}</style>
    </>
  );
}
