import React from 'react';
import { Donor } from '../../types/bloodlink';

interface DonorPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  donor: Donor;
}

export const DonorPassportModal: React.FC<DonorPassportModalProps> = ({
  isOpen,
  onClose,
  donor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#171b26] border border-[#262a35] rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#262a35]">
          <div className="flex items-center gap-3">
            <img
              src={donor.avatarUrl}
              alt={donor.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#262a35]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-base font-bold text-white">{donor.name}</h3>
                <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
              </div>
              <p className="text-xs text-[#dfe2f1]/60">
                Verified Volunteer Donor • {donor.locationArea}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#dfe2f1]/60 hover:text-white hover:bg-[#262a35]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Details Card */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
              <span className="text-[10px] text-[#dfe2f1]/60 uppercase block">Blood Group</span>
              <span className="font-headline text-xl font-bold text-[#ff5451] block mt-0.5">
                {donor.bloodGroup}
              </span>
              <span className="text-[10px] text-[#4edea3]">Eligible</span>
            </div>
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
              <span className="text-[10px] text-[#dfe2f1]/60 uppercase block">Total Donations</span>
              <span className="font-headline text-xl font-bold text-[#4cd7f6] block mt-0.5">
                {donor.verifiedDonationsCount}
              </span>
              <span className="text-[10px] text-[#dfe2f1]/60">Verified</span>
            </div>
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
              <span className="text-[10px] text-[#dfe2f1]/60 uppercase block">Last Donated</span>
              <span className="font-headline text-xl font-bold text-white block mt-0.5">
                {donor.daysSinceDonation}d
              </span>
              <span className="text-[10px] text-[#4edea3]">&gt; 90 days</span>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3] text-[18px]">verified</span>
              <span className="text-white font-medium">Verified WHO Screening</span>
            </div>
            <span className="font-mono text-[11px] text-[#4cd7f6]">{donor.phone || '+91 98201 44921'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-4 mt-2 border-t border-[#262a35]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              alert(`Alert message dispatched to ${donor.name} via WhatsApp.`);
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-[#ff5451] hover:brightness-110 text-[#5c0008] font-headline font-bold text-xs transition-colors cursor-pointer"
          >
            Send Direct Alert
          </button>
        </div>
      </div>
    </div>
  );
};
