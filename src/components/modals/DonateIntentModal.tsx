import React, { useState } from 'react';
import { BloodCentre, BloodGroup } from '../../types/bloodlink';

interface DonateIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  centre: BloodCentre | null;
  bloodGroup: BloodGroup;
  onConfirmSuccess: (details: { centreName: string; bloodGroup: BloodGroup; date: string; slot: string }) => void;
}

export const DonateIntentModal: React.FC<DonateIntentModalProps> = ({
  isOpen,
  onClose,
  centre,
  bloodGroup,
  onConfirmSuccess,
}) => {
  const [donorName, setDonorName] = useState('Rahul Shah');
  const [phone, setPhone] = useState('+91 98201 44921');
  const [selectedDate, setSelectedDate] = useState('Tomorrow (Saturday)');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM – 11:30 AM');
  const [component, setComponent] = useState('Whole Blood');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [passRef, setPassRef] = useState('');

  if (!isOpen || !centre) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refCode = `BL-DON-${Math.floor(100000 + Math.random() * 900000)}`;
    setPassRef(refCode);
    setIsConfirmed(true);

    onConfirmSuccess({
      centreName: centre.name,
      bloodGroup,
      date: selectedDate,
      slot: selectedSlot,
    });
  };

  const handleFinish = () => {
    setIsConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#171b26] border border-[#262a35] rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#262a35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">volunteer_activism</span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-white">
                Register Voluntary Donation Interest
              </h3>
              <p className="text-xs text-[#dfe2f1]/60">
                {centre.name} · {centre.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#dfe2f1]/60 hover:text-white hover:bg-[#262a35]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {!isConfirmed ? (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
            {/* Centre & Need Overview Banner */}
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#ff5451] text-[#5c0008] font-mono font-bold flex items-center justify-center text-sm">
                  {bloodGroup}
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Target Blood Group</span>
                  <span className="text-[11px] text-[#dfe2f1]/60">
                    Reserve Gap: -{centre.stockByGroup[bloodGroup]?.forecastGap || 15} units
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ff5451]/20 text-[#ffb3ad] font-mono text-[10px] font-bold">
                PRIORITY NEED
              </span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#dfe2f1]/70 font-medium">Donor Name</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#dfe2f1]/70 font-medium">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono text-white focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#dfe2f1]/70 font-medium">Preferred Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                >
                  <option>Today (Immediate Walk-in)</option>
                  <option>Tomorrow (Saturday)</option>
                  <option>Sunday, Oct 12</option>
                  <option>Monday, Oct 13</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#dfe2f1]/70 font-medium">Time Window</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                >
                  <option>09:30 AM – 10:30 AM</option>
                  <option>10:30 AM – 11:30 AM</option>
                  <option>12:00 PM – 01:00 PM</option>
                  <option>03:00 PM – 04:00 PM</option>
                  <option>05:00 PM – 06:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#dfe2f1]/70 font-medium">Donation Component</label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
              >
                <option>Whole Blood (1 Unit = 450 mL)</option>
                <option>Platelet Apheresis (Single Donor Platelets)</option>
                <option>Plasma (Fresh Frozen Plasma)</option>
              </select>
            </div>

            {/* Clinical Disclaimer Notice */}
            <div className="p-3 rounded-xl bg-[#0a0e18] border border-[#262a35] flex items-start gap-2.5 text-[11px] text-[#dfe2f1]/70">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px] shrink-0 mt-0.5">
                verified_user
              </span>
              <span>
                BloodLink coordinates voluntary mobilization. Final medical eligibility, hemoglobin screening, and blood collection must be performed by certified clinical staff at the authorized centre.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#262a35]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#dfe2f1]/70 hover:bg-[#262a35]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs hover:brightness-110 shadow-md cursor-pointer"
              >
                Confirm Donation Interest
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Screen with Digital Pass */
          <div className="mt-4 flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#00a572]/20 text-[#4edea3] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>

            <div>
              <h4 className="font-headline text-lg font-bold text-white">
                Donation Pre-Registration Confirmed!
              </h4>
              <p className="text-xs text-[#dfe2f1]/60 mt-0.5">
                The centre's donor reception desk has been notified of your scheduled visit.
              </p>
            </div>

            {/* Digital Pass Card */}
            <div className="p-4 rounded-xl bg-[#1c1f2a] border border-[#4edea3]/40 text-left flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-[#262a35] pb-2">
                <span className="font-mono text-[10px] text-[#4edea3] font-bold uppercase">
                  Digital Donor Intake Pass
                </span>
                <span className="font-mono text-xs text-white font-bold">{passRef}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#dfe2f1]/60 block">Centre</span>
                  <span className="font-semibold text-white">{centre.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#dfe2f1]/60 block">Blood Group</span>
                  <span className="font-mono font-bold text-[#ff5451]">{bloodGroup} ({component})</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#dfe2f1]/60 block">Scheduled Time</span>
                  <span className="font-semibold text-white">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#dfe2f1]/60 block">Slot</span>
                  <span className="font-semibold text-[#4cd7f6]">{selectedSlot}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#dfe2f1]/60 border-t border-[#262a35]">
                Please bring a government photo ID and ensure adequate hydration before arrival.
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-2.5 rounded-xl bg-[#00a572] text-[#00311f] font-headline font-bold text-xs hover:brightness-110 cursor-pointer"
            >
              Done & Return to Centres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
