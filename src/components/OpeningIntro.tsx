import React, { useEffect, useState } from 'react';
import { BRAND_LOGO_URL } from '../data/mockData';

interface OpeningIntroProps {
  onComplete: () => void;
}

export const OpeningIntro: React.FC<OpeningIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 350);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 150);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0e18] transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-radial from-[#ff5451]/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Blood drop symbol / Brand Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#171b26] border border-[#262a35] flex items-center justify-center shadow-xl shadow-[#ff5451]/15">
            <img
              src={BRAND_LOGO_URL}
              alt="BloodLink Mark"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ff5451] border-2 border-[#0a0e18] flex items-center justify-center text-[10px] text-white font-bold">
            +
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
          BloodLink
        </h1>
        <p className="text-sm font-medium text-[#4cd7f6] mt-1.5 tracking-wide">
          Right blood. Right place. Right time.
        </p>
        <p className="text-xs text-[#dfe2f1]/60 mt-1 max-w-xs">
          Intelligent emergency coordination & predictive blood logistics
        </p>

        {/* Loading Progress */}
        <div className="w-full mt-8 flex flex-col gap-2">
          <div className="w-full bg-[#171b26] border border-[#262a35] h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-[#ff5451] to-[#4cd7f6] h-full rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#dfe2f1]/60">
            <span>Synchronizing municipal grid...</span>
            <span className="text-[#4cd7f6] tabular-nums font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="mt-6 px-4 py-1.5 text-xs text-[#dfe2f1]/50 hover:text-white transition-colors cursor-pointer"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
};
