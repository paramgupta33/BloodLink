import React from 'react';
import { UserRole } from '../types/bloodlink';

interface FooterProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentRole, onSelectRole }) => {
  return (
    <footer className="w-full bg-[#0a0e18] border-t border-[#262a35] mt-12 py-8 text-xs text-[#dfe2f1]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-headline font-bold text-sm text-white">BloodLink</span>
          <span className="text-[#dfe2f1]/30">•</span>
          <span className="text-[11px] text-[#dfe2f1]/60">
            Intelligent Emergency Blood Coordination Platform
          </span>
        </div>

        {/* Portal Switch Links */}
        <div className="flex items-center gap-4 flex-wrap justify-center text-xs">
          <span className="text-[#dfe2f1]/40 font-mono text-[11px]">Portal Mode:</span>
          <button
            onClick={() => onSelectRole('hospital')}
            className={`cursor-pointer transition-colors ${
              currentRole === 'hospital' ? 'text-[#ff5451] font-bold' : 'hover:text-white'
            }`}
          >
            Hospital
          </button>
          <button
            onClick={() => onSelectRole('centre')}
            className={`cursor-pointer transition-colors ${
              currentRole === 'centre' ? 'text-[#4cd7f6] font-bold' : 'hover:text-white'
            }`}
          >
            Blood Centre
          </button>
          <button
            onClick={() => onSelectRole('donor')}
            className={`cursor-pointer transition-colors ${
              currentRole === 'donor' ? 'text-[#4edea3] font-bold' : 'hover:text-white'
            }`}
          >
            Voluntary Donor
          </button>
          <button
            onClick={() => onSelectRole('unselected')}
            className="text-[11px] text-[#dfe2f1]/50 hover:text-white cursor-pointer font-mono"
          >
            (Role Selection Screen)
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-[#dfe2f1]/50">
          <span>
            Emergency Helpline: <strong className="text-[#ff5451]">108</strong> / <strong className="text-[#4cd7f6]">104</strong>
          </span>
          <span>© 2026 BloodLink</span>
        </div>
      </div>
    </footer>
  );
};
