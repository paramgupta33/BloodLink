import React, { useState } from 'react';
import { DonationCamp } from '../../types/bloodlink';

interface CampRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  camp: DonationCamp | null;
  onRegisterSuccess: (campId: string) => void;
}

export const CampRegistrationModal: React.FC<CampRegistrationModalProps> = ({
  isOpen,
  onClose,
  camp,
  onRegisterSuccess,
}) => {
  const [donorName, setDonorName] = useState('Rahul Shah');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [phone, setPhone] = useState('+91 98201 44921');
  const [slot, setSlot] = useState('10:00 AM - 11:00 AM');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !camp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onRegisterSuccess(camp.id);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#171b26] border border-[#262a35] rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#262a35]">
          <div>
            <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-wider font-semibold">
              FIELD DRIVE CHECK-IN & REGISTRATION
            </span>
            <h3 className="font-headline text-lg font-bold text-[#dfe2f1] mt-0.5">
              {camp.title}
            </h3>
            <p className="text-xs text-[#e4beba]/70">{camp.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#e4beba] hover:text-white hover:bg-[#262a35]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono">
            <span className="text-[#e4beba]/70">Date & Operating Hours</span>
            <span className="text-[#4edea3] font-bold">
              {camp.dateStr} • {camp.timeStr}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-[#e4beba]/80">Donor Full Name</label>
            <input
              type="text"
              required
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-[#dfe2f1] text-sm focus:outline-none focus:border-[#4cd7f6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#e4beba]/80">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-[#dfe2f1] font-mono text-sm focus:outline-none focus:border-[#4cd7f6]"
              >
                <option value="O-">O- (Priority Needed)</option>
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#e4beba]/80">Preferred Slot</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-[#dfe2f1] text-xs focus:outline-none focus:border-[#4cd7f6]"
              >
                <option>09:00 AM - 10:00 AM</option>
                <option>10:00 AM - 11:00 AM</option>
                <option>11:00 AM - 12:00 PM</option>
                <option>01:00 PM - 02:00 PM</option>
                <option>02:00 PM - 03:00 PM</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-[#e4beba]/80">Mobile / WhatsApp for Gate QR</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-[#dfe2f1] font-mono text-sm focus:outline-none focus:border-[#4cd7f6]"
            />
          </div>

          <label className="flex items-start gap-2 pt-1 text-xs text-[#e4beba]/80 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[#4edea3]"
            />
            <span>
              I confirm I am between 18–65 years old, weigh at least 45 kg, and have not donated whole blood in the last 90 days.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#e4beba] hover:bg-[#262a35]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-sm hover:brightness-110 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Confirm Pre-Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
