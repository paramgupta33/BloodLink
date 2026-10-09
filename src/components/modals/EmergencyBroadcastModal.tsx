import React, { useState } from 'react';
import { BloodGroup } from '../../types/bloodlink';

interface EmergencyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastSuccess: (details: { bloodGroup: BloodGroup; radiusKm: number; donorCount: number }) => void;
}

export const EmergencyBroadcastModal: React.FC<EmergencyBroadcastModalProps> = ({
  isOpen,
  onClose,
  onBroadcastSuccess,
}) => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>('O-');
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [waEnabled, setWaEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const getEstimatedDonors = (radius: number) => {
    switch (radius) {
      case 2:
        return 14;
      case 6:
        return 62;
      case 10:
        return 184;
      case 25:
        return 492;
      default:
        return 184;
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      onBroadcastSuccess({
        bloodGroup: selectedBloodGroup,
        radiusKm: selectedRadius,
        donorCount: getEstimatedDonors(selectedRadius),
      });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#171b26] border border-[#ff5451]/50 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#262a35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5451] text-[#5c0008] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px] animate-pulse">campaign</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-[#dfe2f1]">
                Execute Emergency Broadcast
              </h3>
              <p className="font-mono text-xs text-[#e4beba]/70">
                Multi-Channel High-Priority Donor Ping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#e4beba] hover:text-white hover:bg-[#262a35] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleBroadcast} className="mt-4 flex flex-col gap-4">
          {/* Target Blood Group */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[#e4beba]/80">TARGET BLOOD GROUP</label>
            <div className="grid grid-cols-4 gap-2">
              {(['O-', 'AB-', 'B-', 'A-', 'O+', 'A+', 'B+', 'AB+'] as BloodGroup[]).map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`py-2 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                    selectedBloodGroup === bg
                      ? 'bg-[#ff5451] text-[#5c0008] border-[#ff5451] shadow-md'
                      : 'bg-[#1c1f2a] border-[#262a35] text-[#dfe2f1] hover:bg-[#262a35]'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Search Perimeter */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#e4beba]/80">SEARCH PERIMETER RADIUS</span>
              <span className="text-[#4cd7f6] font-bold">
                {selectedRadius} KM ({getEstimatedDonors(selectedRadius)} Eligible Donors)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[2, 6, 10, 25].map((rad) => (
                <button
                  key={rad}
                  type="button"
                  onClick={() => setSelectedRadius(rad)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    selectedRadius === rad
                      ? 'bg-[#4cd7f6] text-[#003640] border-[#4cd7f6]'
                      : 'bg-[#1c1f2a] border-[#262a35] text-[#dfe2f1] hover:bg-[#262a35]'
                  }`}
                >
                  {rad} km
                </button>
              ))}
            </div>
          </div>

          {/* Channels Selection */}
          <div className="flex flex-col gap-2 p-3 bg-[#1c1f2a] rounded-xl border border-[#262a35]">
            <span className="text-xs font-mono text-[#e4beba]/80 uppercase">Active Delivery Channels</span>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span className="flex items-center gap-2 text-[#dfe2f1]">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">
                  notifications_active
                </span>
                App Push Notification (Direct Geofence)
              </span>
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                className="accent-[#4cd7f6]"
              />
            </label>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span className="flex items-center gap-2 text-[#dfe2f1]">
                <span className="material-symbols-outlined text-[#4edea3] text-[18px]">chat</span>
                WhatsApp Emergency API (1-Tap Confirm)
              </span>
              <input
                type="checkbox"
                checked={waEnabled}
                onChange={(e) => setWaEnabled(e.target.checked)}
                className="accent-[#4edea3]"
              />
            </label>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span className="flex items-center gap-2 text-[#dfe2f1]">
                <span className="material-symbols-outlined text-[#ff5451] text-[18px]">sms</span>
                SMS Critical Alert (Priority DND Bypass)
              </span>
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="accent-[#ff5451]"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#e4beba] hover:bg-[#262a35] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-sm hover:brightness-110 shadow-lg shadow-[#ff5451]/30 transition-all cursor-pointer"
            >
              {isSending ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  <span>Dispatching {getEstimatedDonors(selectedRadius)} Alerts...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">cell_tower</span>
                  <span>Dispatch Broadcast ({getEstimatedDonors(selectedRadius)} Donors)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
