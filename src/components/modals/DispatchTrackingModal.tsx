import React from 'react';
import { EmergencyRequest } from '../../types/bloodlink';

interface DispatchTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EmergencyRequest | null;
  onAdvanceStep?: (requestId: string) => void;
}

export const DispatchTrackingModal: React.FC<DispatchTrackingModalProps> = ({
  isOpen,
  onClose,
  request,
  onAdvanceStep,
}) => {
  if (!isOpen || !request) return null;

  // 7-Stage Official Workflow Steps
  const timelineStages = [
    { step: 1, title: 'Request Created', desc: 'Hospital physician logged urgent blood request' },
    { step: 2, title: 'Inventory Checked', desc: 'Screened nearby blood bank reserves for stock' },
    { step: 3, title: 'Donors Notified', desc: 'Broadcasted to compatible volunteer donors in radius' },
    { step: 4, title: 'Donor Accepted', desc: 'Volunteer accepted ping and routing to centre' },
    { step: 5, title: 'Blood Centre Screening', desc: 'Authorized centre conducts clinical cross-match & vitals' },
    { step: 6, title: 'Donation Verified', desc: 'Component screened and verified in cold chain' },
    { step: 7, title: 'Fulfilled', desc: 'Bedside handover completed at recipient hospital' },
  ];

  const currentStep = request.timelineStep || 3;
  const fulfilledCount = request.unitsFulfilled;
  const neededCount = request.unitsNeeded;
  const pct = Math.min(100, Math.round((fulfilledCount / neededCount) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#171b26] border border-[#262a35] rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#262a35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">local_shipping</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-base font-bold text-white">
                  Multi-Source Request Tracking
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                    currentStep === 7
                      ? 'bg-[#00a572]/20 text-[#4edea3]'
                      : 'bg-[#ff5451]/20 text-[#ffb3ad]'
                  }`}
                >
                  {currentStep === 7 ? 'FULFILLED' : request.urgencyLabel}
                </span>
              </div>
              <p className="text-xs text-[#dfe2f1]/60">
                {request.hospitalName} · {request.requestId} · {request.location}
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

        {/* Units Breakdown Banner (Per Prompt Specification) */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-[#ff5451] px-2 py-1 rounded bg-[#ff5451]/15">
              {request.bloodGroup}
            </span>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-white text-sm">
                {request.unitsNeeded} units requested ({request.component.toUpperCase()})
              </span>
              <span className="text-[#4cd7f6] font-mono text-[11px]">
                {fulfilledCount}/{neededCount} units fulfilled ({pct}%)
              </span>
            </div>
          </div>

          <div className="text-right font-mono self-end sm:self-center">
            <span
              className={`text-xs font-bold ${
                neededCount - fulfilledCount === 0 ? 'text-[#4edea3]' : 'text-[#ffb3ad]'
              }`}
            >
              {neededCount - fulfilledCount === 0
                ? 'All units secured ✓'
                : `${neededCount - fulfilledCount} unit(s) remaining`}
            </span>
            <span className="text-[10px] text-[#dfe2f1]/50 block">
              {currentStep === 7 ? 'Delivery Verified' : request.eta || 'Searching'}
            </span>
          </div>
        </div>

        {/* 3 Metric Cards with Real Units Fulfilled */}
        <div className="mt-3 grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
            <span className="text-[10px] text-[#dfe2f1]/60 uppercase block">Fulfilment Progress</span>
            <span className="font-headline text-lg font-bold text-[#ffb3ad] block mt-0.5 tabular-nums">
              {fulfilledCount}/{neededCount} units ({pct}%)
            </span>
            <span className="text-[10px] text-[#dfe2f1]/60">
              {request.bloodGroup} {request.component.toUpperCase()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
            <span className="text-[10px] text-[#dfe2f1]/60 uppercase block">Cold-Chain Temp</span>
            <span className="font-headline text-lg font-bold text-[#4edea3] block mt-0.5">
              {request.temperature || '3.4°C'}
            </span>
            <span className="text-[10px] text-[#4edea3]">Monitored Transit</span>
          </div>

          <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
            <span className="text-[10px] text-[#dfe2f1]/60 uppercase block">Estimated Arrival</span>
            <span className="font-headline text-lg font-bold text-[#4cd7f6] block mt-0.5">
              {currentStep === 7 ? 'Delivered' : request.eta || '8 mins'}
            </span>
            <span className="text-[10px] text-[#dfe2f1]/60">{request.requiredBy}</span>
          </div>
        </div>

        {/* Multi-Source Fulfilment Breakdown */}
        <div className="mt-3.5 p-3 rounded-xl bg-[#0a0e18] border border-[#262a35] flex flex-col gap-2 text-xs font-mono">
          <div className="flex items-center justify-between text-[#dfe2f1]/70">
            <span>MULTI-SOURCE SUPPLY BREAKDOWN</span>
            <span className="text-[#4cd7f6]">{fulfilledCount}/{neededCount} Units Secured</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-[#1c1f2a] border border-[#262a35]">
              <span className="text-[#dfe2f1]/50 block">Bank Inventory Stock:</span>
              <span className="text-white font-bold">
                {request.sourceBreakdown?.inventoryUnits || 0} unit(s)
              </span>
              <span className="text-[10px] text-[#4cd7f6] block">
                {request.sourceBreakdown?.inventorySource || 'Reserve Depot'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#1c1f2a] border border-[#262a35]">
              <span className="text-[#dfe2f1]/50 block">Volunteer Donor Transfusion:</span>
              <span className="text-white font-bold">
                {request.sourceBreakdown?.donorUnits || 0} unit(s)
              </span>
              <span className="text-[10px] text-[#4edea3] block">
                {request.sourceBreakdown?.donorNames?.join(', ') || 'Volunteers notified'}
              </span>
            </div>
          </div>
        </div>

        {/* 7-Stage Interactive Timeline */}
        <div className="mt-4 p-4 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex flex-col gap-3">
          <span className="text-xs font-mono text-[#dfe2f1]/70 uppercase">
            Official 7-Stage Request Timeline
          </span>

          <div className="flex flex-col gap-2.5">
            {timelineStages.map((stage) => {
              const isCompleted = stage.step < currentStep;
              const isCurrent = stage.step === currentStep;

              return (
                <div
                  key={stage.step}
                  className={`flex items-start gap-3 text-xs transition-opacity ${
                    isCompleted
                      ? 'text-white'
                      : isCurrent
                      ? 'text-white font-medium'
                      : 'text-[#dfe2f1]/40 opacity-60'
                  }`}
                >
                  {/* Step indicator circle */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-[#00a572] text-[#00311f]'
                        : isCurrent
                        ? 'bg-[#ff5451] text-[#5c0008] shadow-md shadow-[#ff5451]/30 animate-pulse'
                        : 'bg-[#262a35] text-[#dfe2f1]/60'
                    }`}
                  >
                    {isCompleted ? '✓' : stage.step}
                  </div>

                  {/* Stage description */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isCurrent ? 'text-[#ffb3ad]' : ''}`}>
                        {stage.title}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded bg-[#ff5451]/20 text-[#ffb3ad] text-[9px] font-mono">
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#dfe2f1]/60">{stage.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier Contact Bar */}
        {request.courierName && (
          <div className="mt-3.5 p-3 rounded-xl bg-[#0a0e18] border border-[#262a35] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">
                local_shipping
              </span>
              <span className="text-white font-medium">Logistics: {request.courierName}</span>
            </div>
            <span className="text-[11px] text-[#4edea3] font-mono">Monitored GPS Link Active</span>
          </div>
        )}

        {/* Footer with Advance Step Interactive Control */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#262a35]">
          {onAdvanceStep && currentStep < 7 ? (
            <button
              type="button"
              onClick={() => onAdvanceStep(request.id)}
              className="px-3.5 py-2 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs hover:brightness-110 cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">fast_forward</span>
              <span>Simulate Next Step ({currentStep + 1}/7)</span>
            </button>
          ) : (
            <span className="text-xs text-[#4edea3] font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              Request fully verified & fulfilled
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#dfe2f1]/70 hover:bg-[#262a35] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
