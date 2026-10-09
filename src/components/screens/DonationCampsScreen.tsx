import React from 'react';
import { DonationCamp } from '../../types/bloodlink';

interface DonationCampsScreenProps {
  camps: DonationCamp[];
  onOpenCampModal: (camp: DonationCamp) => void;
}

export const DonationCampsScreen: React.FC<DonationCampsScreenProps> = ({
  camps,
  onOpenCampModal,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span className="font-mono text-[11px] font-semibold text-[#4edea3] uppercase tracking-wider">
              Community Outreach & Mass Drives
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-white mt-1">
            Authorized Blood Donation Camps
          </h1>
          <p className="text-xs text-[#dfe2f1]/70 mt-0.5">
            Pre-register for scheduled field collection drives organized with authorized municipal transfusion banks.
          </p>
        </div>

        {/* Non-Monetary Recognition Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-[#171b26] border border-[#262a35] text-xs font-mono text-[#dfe2f1]/70 flex items-center gap-2 self-start sm:self-auto">
          <span className="material-symbols-outlined text-[#4edea3] text-[18px]">workspace_premium</span>
          <span>Verified Non-Monetary Lifesaver Certificates</span>
        </div>
      </div>

      {/* Camp Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {camps.map((camp) => {
          const pct = Math.min(
            100,
            Math.round((camp.registeredCount / camp.goalCount) * 100)
          );

          return (
            <div
              key={camp.id}
              className="rounded-2xl bg-[#171b26] border border-[#262a35] overflow-hidden flex flex-col justify-between shadow-lg hover:border-[#4cd7f6]/40 transition-colors"
            >
              <div>
                {/* Banner Image */}
                <div className="w-full h-44 relative bg-[#0a0e18]">
                  <img
                    src={camp.bannerUrl}
                    alt={camp.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#ff5451] text-[#5c0008] font-mono text-[10px] font-bold shadow-md">
                    {camp.targetTag}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-sm text-white font-mono text-[11px]">
                    {camp.dateStr}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-3">
                  <div>
                    <h3 className="font-headline font-bold text-base text-white">
                      {camp.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#dfe2f1]/60 mt-1">
                      <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">
                        location_on
                      </span>
                      <span>{camp.address} ({camp.locationName})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-[#dfe2f1]/70">
                    <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">
                      schedule
                    </span>
                    <span>{camp.timeStr}</span>
                  </div>

                  {/* Registered Progress */}
                  <div className="mt-2 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#dfe2f1]/60">Pre-Registered Donors</span>
                      <span className="text-[#4edea3] font-bold">
                        {camp.registeredCount} / {camp.goalCount} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#262a35] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#4edea3] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => onOpenCampModal(camp)}
                  className="w-full py-2.5 rounded-xl bg-[#4cd7f6] hover:brightness-110 text-[#003640] font-headline font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Pre-Register for Drive Slot
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Non-Monetary Donor Recognition System Showcase */}
      <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
        <div>
          <h3 className="font-headline text-base font-bold text-white">
            Ethical Voluntary Recognition (Zero Monetary Incentives)
          </h3>
          <p className="text-xs text-[#dfe2f1]/60 mt-0.5">
            In compliance with national voluntary blood donation regulations, donors are recognized solely through verified clinical milestones, digital lifesaver credentials, and public gratitude.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#ff5451] text-[24px]">
              verified
            </span>
            <div>
              <span className="font-bold text-white block">Centennial Lifesaver</span>
              <span className="text-[11px] text-[#dfe2f1]/60">
                Awarded upon reaching 10 verified donations at authorized municipal blood depots.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[24px]">
              military_tech
            </span>
            <div>
              <span className="font-bold text-white block">Rare Antigen Sentinel</span>
              <span className="text-[11px] text-[#dfe2f1]/60">
                Recognizes voluntary O- and Bombay phenotype donors on emergency standby triage.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#4edea3] text-[24px]">
              volunteer_activism
            </span>
            <div>
              <span className="font-bold text-white block">Apheresis Platelet Hero</span>
              <span className="text-[11px] text-[#dfe2f1]/60">
                Recognizes donors who complete cell-separator platelet donations for oncology wards.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
