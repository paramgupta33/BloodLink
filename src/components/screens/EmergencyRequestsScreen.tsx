import React, { useState } from 'react';
import { EmergencyRequest } from '../../types/bloodlink';

interface EmergencyRequestsScreenProps {
  requests: EmergencyRequest[];
  onOpenNewRequest: () => void;
  onOpenDispatchTracking: (req: EmergencyRequest) => void;
  onAdvanceStep: (reqId: string) => void;
  onConfirmReceipt: (reqId: string) => void;
}

export const EmergencyRequestsScreen: React.FC<EmergencyRequestsScreenProps> = ({
  requests,
  onOpenNewRequest,
  onOpenDispatchTracking,
  onAdvanceStep,
  onConfirmReceipt,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'transit' | 'fulfilled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = requests.filter((r) => {
    if (filter === 'critical') return r.urgency === 'immediate' && r.status !== 'fulfilled';
    if (filter === 'transit') return r.status === 'in_transit' || r.status === 'matched';
    if (filter === 'fulfilled') return r.status === 'fulfilled';

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.hospitalName.toLowerCase().includes(q) ||
        r.requestId.toLowerCase().includes(q) ||
        r.bloodGroup.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Header & New Request CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-white">
            Emergency Blood Coordination
          </h1>
          <p className="text-xs text-[#dfe2f1]/70 mt-0.5">
            Real-time hospital requisition triage, automated reserve checks, and donor dispatch.
          </p>
        </div>

        <button
          onClick={onOpenNewRequest}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-xs hover:brightness-110 shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>New Emergency Request</span>
        </button>
      </div>

      {/* 7-Stage Stepper Tracker Overview Strip */}
      <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-[#4cd7f6] font-semibold uppercase">
            Official 7-Stage End-to-End Tracking Timeline
          </span>
          <span className="text-[#dfe2f1]/50 font-mono text-[11px]">
            Automated multi-source fulfillment
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {[
            { num: 1, name: 'Created' },
            { num: 2, name: 'Inventory Checked' },
            { num: 3, name: 'Donors Notified' },
            { num: 4, name: 'Donor Accepted' },
            { num: 5, name: 'Centre Screening' },
            { num: 6, name: 'Donation Verified' },
            { num: 7, name: 'Fulfilled' },
          ].map((st) => (
            <div
              key={st.num}
              className="p-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex items-center gap-2"
            >
              <span className="w-5 h-5 rounded-full bg-[#262a35] text-[#dfe2f1] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                {st.num}
              </span>
              <span className="text-[11px] text-[#dfe2f1]/80 truncate font-medium">{st.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262a35] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filter === 'all'
                ? 'bg-[#262a35] text-white font-bold'
                : 'text-[#dfe2f1]/60 hover:text-white'
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filter === 'critical'
                ? 'bg-[#ff5451]/20 text-[#ffb3ad] font-bold border border-[#ff5451]/40'
                : 'text-[#dfe2f1]/60 hover:text-white'
            }`}
          >
            Critical STAT
          </button>
          <button
            onClick={() => setFilter('transit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filter === 'transit'
                ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] font-bold border border-[#4cd7f6]/40'
                : 'text-[#dfe2f1]/60 hover:text-white'
            }`}
          >
            In Transit / Matched
          </button>
          <button
            onClick={() => setFilter('fulfilled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filter === 'fulfilled'
                ? 'bg-[#00a572]/20 text-[#4edea3] font-bold border border-[#00a572]/40'
                : 'text-[#dfe2f1]/60 hover:text-white'
            }`}
          >
            Fulfilled ({requests.filter((r) => r.status === 'fulfilled').length})
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search hospital, ID, blood type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 px-3 py-1.5 rounded-xl bg-[#171b26] border border-[#262a35] text-xs text-white placeholder-[#dfe2f1]/40 focus:outline-none focus:border-[#4cd7f6]"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="flex flex-col gap-3.5">
        {filtered.map((req) => {
          const isFulfilled = req.status === 'fulfilled' || req.timelineStep === 7;
          const isCritical = req.urgency === 'immediate' && !isFulfilled;
          const pct = Math.min(100, Math.round((req.unitsFulfilled / req.unitsNeeded) * 100));

          return (
            <div
              key={req.id}
              className={`p-4 sm:p-5 rounded-2xl bg-[#171b26] border transition-all ${
                isCritical
                  ? 'border-[#ff5451]/40 shadow-sm'
                  : isFulfilled
                  ? 'border-[#00a572]/30'
                  : 'border-[#262a35]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Blood Group Badge + Details */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold shrink-0 ${
                      isCritical
                        ? 'bg-[#ff5451] text-[#5c0008]'
                        : isFulfilled
                        ? 'bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/40'
                        : 'bg-[#262a35] text-[#4cd7f6]'
                    }`}
                  >
                    <span className="text-base leading-none">{req.bloodGroup}</span>
                    <span className="text-[10px] font-normal uppercase opacity-80 mt-0.5">
                      {req.component}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-headline font-bold text-base text-white">
                        {req.hospitalName}
                      </span>
                      <span className="font-mono text-xs text-[#dfe2f1]/60">{req.requestId}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isFulfilled
                            ? 'bg-[#00a572]/20 text-[#4edea3]'
                            : isCritical
                            ? 'bg-[#ff5451]/20 text-[#ffb3ad]'
                            : 'bg-[#262a35] text-[#4cd7f6]'
                        }`}
                      >
                        {isFulfilled ? 'FULFILLED (100%)' : req.urgencyLabel}
                      </span>
                      <span className="text-[10px] font-mono text-[#dfe2f1]/50">
                        {req.elapsedTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#dfe2f1]/70 mt-1 flex-wrap">
                      <span>{req.location}</span>
                      <span>·</span>
                      <span>Required by: <strong className="text-white">{req.requiredBy}</strong></span>
                      <span>·</span>
                      <span>{req.doctorName}</span>
                    </div>

                    {/* Multi-source fulfillment status */}
                    <div className="mt-2 flex items-center gap-4 text-xs font-mono flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#dfe2f1]/60">Sourced:</span>
                        <span className="text-[#4cd7f6] font-bold">
                          {req.unitsFulfilled}/{req.unitsNeeded} units ({pct}%)
                        </span>
                      </div>

                      {req.sourceBreakdown?.inventoryUnits > 0 && (
                        <span className="text-[11px] text-[#4edea3]">
                          ✓ {req.sourceBreakdown.inventoryUnits}u via Bank Reserve
                        </span>
                      )}

                      {req.sourceBreakdown?.donorUnits > 0 && (
                        <span className="text-[11px] text-[#ffb3ad]">
                          ✓ {req.sourceBreakdown.donorUnits}u via Volunteer Donor
                        </span>
                      )}

                      {req.courierName && !isFulfilled && (
                        <span className="text-[11px] text-[#4cd7f6]">
                          🚚 Courier: {req.courierName} (ETA: {req.eta})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Progress bar + Action Buttons */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 lg:shrink-0">
                  {/* Progress bar preview */}
                  <div className="w-full sm:w-36 text-right font-mono text-xs">
                    <span className="text-[11px] text-[#dfe2f1]/60 block">
                      Timeline Step {req.timelineStep || 3}/7
                    </span>
                    <div className="w-full bg-[#262a35] h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${
                          isFulfilled ? 'bg-[#00a572]' : isCritical ? 'bg-[#ff5451]' : 'bg-[#4cd7f6]'
                        }`}
                        style={{ width: `${Math.min(100, (req.timelineStep / 7) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDispatchTracking(req)}
                      className="px-3 py-1.5 rounded-xl bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      Track (7 Steps)
                    </button>

                    {!isFulfilled && (
                      <>
                        <button
                          type="button"
                          onClick={() => onAdvanceStep(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#4cd7f6]/20 text-[#4cd7f6] hover:bg-[#4cd7f6]/30 border border-[#4cd7f6]/40 text-xs font-medium cursor-pointer"
                          title="Simulate advancing to next timeline milestone"
                        >
                          Advance Step →
                        </button>
                        <button
                          type="button"
                          onClick={() => onConfirmReceipt(req.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#00a572] hover:bg-[#00a572]/90 text-[#00311f] font-headline font-bold text-xs transition-colors cursor-pointer"
                        >
                          Confirm Receipt
                        </button>
                      </>
                    )}

                    {isFulfilled && (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00a572]/15 text-[#4edea3] text-xs font-medium">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Delivered</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
