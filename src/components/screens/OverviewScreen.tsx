import React from 'react';
import { EmergencyRequest, InventoryItem, Donor, NavTab } from '../../types/bloodlink';
import { LeafletMapView, MapMarker, MapCircle } from '../maps/LeafletMapView';

interface OverviewScreenProps {
  requests: EmergencyRequest[];
  inventory: InventoryItem[];
  donors: Donor[];
  onOpenNewRequest: () => void;
  onOpenDispatchTracking: (req: EmergencyRequest) => void;
  onOpenDonorPassport: (donor: Donor) => void;
  setActiveTab: (tab: NavTab) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  requests,
  inventory,
  donors,
  onOpenNewRequest,
  onOpenDispatchTracking,
  onOpenDonorPassport,
  setActiveTab,
}) => {
  // Aggregate stats
  const activeRequests = requests.filter((r) => r.status !== 'fulfilled');
  const fulfilledRequests = requests.filter((r) => r.status === 'fulfilled');
  const totalInStock = inventory.reduce((sum, item) => sum + item.inStockUnits, 0);
  const criticalItems = inventory.filter((item) => item.status === 'critical');
  const uniqueCriticalGroups = Array.from(new Set(criticalItems.map((i) => i.bloodGroup)));

  // Recent operational activity
  const recentActivity = [
    {
      id: 'act-1',
      time: '14m ago',
      title: 'Courier En Route with 1 Unit O-',
      detail: 'Dispatched from Rotary Blood Bank to Lilavati Hospital ICU (ETA 8m).',
      tag: 'LOGISTICS',
      color: 'text-[#4cd7f6]',
      dot: 'bg-[#4cd7f6]',
    },
    {
      id: 'act-2',
      time: '22m ago',
      title: 'Cross-Match Verified for AB- Requirement',
      detail: 'KEM Hospital requirement paired with Red Cross Depot stock reserve.',
      tag: 'INVENTORY',
      color: 'text-[#4edea3]',
      dot: 'bg-[#4edea3]',
    },
    {
      id: 'act-3',
      time: '38m ago',
      title: 'Donor Acceptance Confirmed',
      detail: 'Rahul Shah accepted STAT ping for 1 Unit O- Negative bedside donation.',
      tag: 'DONOR TRIAGE',
      color: 'text-[#ffb3ad]',
      dot: 'bg-[#ff5451]',
    },
    {
      id: 'act-4',
      time: '45m ago',
      title: 'Bedside Delivery Confirmed (#REQ-8840)',
      detail: '2 Units B+ safely received at Memorial Medical Centre delivery station.',
      tag: 'COMPLETED',
      color: 'text-[#4edea3]',
      dot: 'bg-[#00a572]',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Editorial Platform Motto Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5451]"></span>
            <span className="font-mono text-[11px] font-semibold text-[#ffb3ad] tracking-wide uppercase">
              Emergency Coordination & Predictive Logistics
            </span>
          </div>
          <p className="font-headline text-base sm:text-lg font-semibold text-white tracking-tight">
            “BloodLink doesn't just find blood during emergencies. It helps make the right blood available before the next shortage.”
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('donate-nearby')}
            className="px-3.5 py-2 rounded-xl bg-[#1c1f2a] hover:bg-[#262a35] border border-[#262a35] text-xs font-medium text-[#4cd7f6] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Donate Nearby →
          </button>
          <button
            onClick={onOpenNewRequest}
            className="px-4 py-2 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-xs hover:brightness-110 shadow-md cursor-pointer whitespace-nowrap"
          >
            Create Request
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Emergency Requests */}
        <div
          onClick={() => setActiveTab('requests')}
          className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] hover:border-[#ff5451]/50 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#dfe2f1]/60">
              <span className="text-xs font-medium">Active Requests</span>
              <span className="material-symbols-outlined text-[18px] text-[#ff5451]">emergency</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline text-3xl font-bold text-white tabular-nums">
                {activeRequests.length}
              </span>
              <span className="text-xs text-[#ffb3ad] font-mono">
                {activeRequests.filter((r) => r.urgency === 'immediate').length} STAT
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#dfe2f1]/60 mt-3 pt-2 border-t border-[#262a35]/60 font-mono">
            <span>In Transit & Screening</span>
            <span className="text-[#4cd7f6]">View queue →</span>
          </div>
        </div>

        {/* Card 2: Available Blood Units */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] hover:border-[#4cd7f6]/50 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#dfe2f1]/60">
              <span className="text-xs font-medium">Available Units</span>
              <span className="material-symbols-outlined text-[18px] text-[#4cd7f6]">bloodtype</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline text-3xl font-bold text-white tabular-nums">
                {totalInStock}
              </span>
              <span className="text-xs text-[#dfe2f1]/60">across 5 centres</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#dfe2f1]/60 mt-3 pt-2 border-t border-[#262a35]/60 font-mono">
            <span>PRBC, Platelets & Whole</span>
            <span className="text-[#4cd7f6]">Audit stock →</span>
          </div>
        </div>

        {/* Card 3: Requests Fulfilled */}
        <div
          onClick={() => setActiveTab('requests')}
          className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] hover:border-[#4edea3]/50 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#dfe2f1]/60">
              <span className="text-xs font-medium">Requests Fulfilled</span>
              <span className="material-symbols-outlined text-[18px] text-[#4edea3]">check_circle</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline text-3xl font-bold text-[#4edea3] tabular-nums">
                {fulfilledRequests.length}
              </span>
              <span className="text-xs text-[#4edea3]/80 font-mono">100% On-time</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#dfe2f1]/60 mt-3 pt-2 border-t border-[#262a35]/60 font-mono">
            <span>Average ETA: 8.4m</span>
            <span className="text-[#4edea3]">History →</span>
          </div>
        </div>

        {/* Card 4: Critical Shortages */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-4 rounded-2xl bg-[#171b26] border border-[#ff5451]/40 hover:border-[#ff5451] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-[#dfe2f1]/60">
              <span className="text-xs font-medium">Critical Shortages</span>
              <span className="material-symbols-outlined text-[18px] text-[#ff5451]">warning</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-headline text-3xl font-bold text-[#ff5451] tabular-nums">
                {uniqueCriticalGroups.length}
              </span>
              <span className="text-xs text-[#ffb3ad] font-mono">
                {uniqueCriticalGroups.join(', ') || 'None'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#dfe2f1]/60 mt-3 pt-2 border-t border-[#262a35]/60 font-mono">
            <span>Deficit: -32u below target</span>
            <span className="text-[#ff5451]">Restock →</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Coordination Map & Urgent Requests (8 cols) + Recent Activity & Quick Mobilize (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Coordination Map & Top Emergency Queue (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Map Preview Card */}
          <div className="rounded-2xl bg-[#171b26] border border-[#262a35] overflow-hidden flex flex-col shadow-lg">
            <div className="p-4 border-b border-[#262a35] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">map</span>
                <div>
                  <h3 className="font-headline text-sm font-bold text-white">
                    Live Dispatch & Triage Grid
                  </h3>
                  <p className="text-xs text-[#dfe2f1]/60">
                    Active hospital requirements and courier transit corridors (Mumbai Metro)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('requests')}
                className="text-xs text-[#4cd7f6] hover:underline cursor-pointer font-mono"
              >
                Full Screen
              </button>
            </div>

            <div className="p-3">
              <LeafletMapView
                center={[19.0519, 72.8295]}
                zoom={12}
                height="280px"
                markers={[
                  {
                    id: 'overview-lilavati',
                    lat: 19.0519,
                    lng: 72.8295,
                    title: 'Lilavati Hospital & Research Centre',
                    subtitle: '3 Units O- Needed (2u Sourced, ETA 8m)',
                    type: 'hospital',
                    status: 'critical',
                  },
                  {
                    id: 'overview-rotary',
                    lat: 19.0573,
                    lng: 72.8415,
                    title: 'Rotary Blood Bank & Research Centre',
                    subtitle: '1 Unit Dispatched (3.4°C Cold Chain)',
                    type: 'centre',
                    status: 'low',
                  },
                  {
                    id: 'overview-donor',
                    lat: 19.1310,
                    lng: 72.8320,
                    title: 'Rahul Shah (Voluntary Donor)',
                    subtitle: 'O- Negative · En Route to Depot',
                    type: 'donor',
                    status: 'accepted',
                  },
                ]}
                circles={[
                  {
                    id: 'overview-corridor',
                    lat: 19.0519,
                    lng: 72.8295,
                    radiusMeters: 5000,
                    color: '#4cd7f6',
                    fillColor: '#4cd7f6',
                    fillOpacity: 0.05,
                    dashArray: '3, 3',
                  },
                ]}
                legend={
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-white">
                      <span className="w-2 h-2 rounded-full bg-[#ff5451]"></span> Hospital (Critical)
                    </span>
                    <span className="flex items-center gap-1 text-white">
                      <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span> Blood Centre
                    </span>
                    <span className="flex items-center gap-1 text-white">
                      <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span> Active Donor
                    </span>
                  </div>
                }
              />
            </div>
          </div>

          {/* Active Emergency Queue Mini-List */}
          <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-sm font-bold text-white">Priority Emergency Requests</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ff5451]/20 text-[#ffb3ad] font-mono text-[10px] font-bold">
                  {activeRequests.length} ACTIVE
                </span>
              </div>
              <button
                onClick={() => setActiveTab('requests')}
                className="text-xs text-[#4cd7f6] hover:underline cursor-pointer font-mono"
              >
                View all ({requests.length}) →
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {activeRequests.slice(0, 3).map((req) => {
                const pct = Math.round((req.unitsFulfilled / req.unitsNeeded) * 100);
                return (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] hover:border-[#ff5451]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#ff5451] text-[#5c0008] font-mono font-bold text-sm flex items-center justify-center shrink-0">
                        {req.bloodGroup}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-semibold text-sm text-white">
                            {req.hospitalName}
                          </span>
                          <span className="font-mono text-[10px] text-[#dfe2f1]/60">
                            {req.requestId}
                          </span>
                        </div>
                        <div className="text-xs text-[#dfe2f1]/70 mt-0.5">
                          {req.unitsNeeded} units {req.component.toUpperCase()} · {req.location} · {req.urgencyLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right font-mono text-xs">
                        <span className="text-white font-bold">
                          {req.unitsFulfilled}/{req.unitsNeeded} units ({pct}%)
                        </span>
                        <div className="w-24 bg-[#262a35] h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-[#4cd7f6] h-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenDispatchTracking(req)}
                        className="px-3 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Operational Activity & Standby Volunteers (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Recent Operational Activity */}
          <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#262a35] pb-2.5">
              <h3 className="font-headline text-sm font-bold text-white">
                Recent Activity
              </h3>
              <span className="text-[11px] font-mono text-[#dfe2f1]/50">Live audit log</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {recentActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className={`w-2 h-2 rounded-full ${act.dot} mt-1 shrink-0`}></div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{act.title}</span>
                      <span className="text-[10px] font-mono text-[#dfe2f1]/50">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-[#dfe2f1]/70 leading-relaxed">
                      {act.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Standby Donor Card */}
          <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-sm font-bold text-white">Verified Donors Nearby</h3>
              <button
                onClick={() => setActiveTab('donors')}
                className="text-xs text-[#4cd7f6] hover:underline cursor-pointer font-mono"
              >
                Expand Search →
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
              <img
                src={donors[0].avatarUrl}
                alt={donors[0].name}
                className="w-11 h-11 rounded-xl object-cover border border-[#262a35] shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-headline text-xs font-bold text-white truncate">
                    {donors[0].name}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#ff5451]">
                    {donors[0].bloodGroup}
                  </span>
                </div>
                <span className="text-[11px] text-[#dfe2f1]/60">
                  {donors[0].distanceKm} km · {donors[0].locationArea}
                </span>
                <span className="text-[10px] text-[#4edea3] mt-0.5">
                  {donors[0].verifiedDonationsCount} verified donations
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenDonorPassport(donors[0])}
              className="w-full py-2 rounded-xl bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
            >
              View Verified Donor Profile
            </button>
          </div>

          {/* Feature Spotlight: Donate Where It Matters */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c1f2a] to-[#171b26] border border-[#4cd7f6]/40 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">
                volunteer_activism
              </span>
              <span className="font-headline text-xs font-bold text-white">
                Donate Where It Matters
              </span>
            </div>
            <p className="text-xs text-[#dfe2f1]/70 leading-relaxed">
              Voluntary donors can view real-time blood centre inventory gaps and donate directly where their specific blood group is needed most.
            </p>
            <button
              onClick={() => setActiveTab('donate-nearby')}
              className="mt-1 w-full py-2 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs hover:brightness-110 transition-colors cursor-pointer text-center"
            >
              Find Centres In Need →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
