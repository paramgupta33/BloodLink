import React, { useState } from 'react';
import { BloodGroup, EmergencyRequest, Donor } from '../../types/bloodlink';
import { MAP_MUMBAI_URL } from '../../data/mockData';

interface LiveCoordinationMapScreenProps {
  onOpenNewRequest: () => void;
  onOpenBroadcast: () => void;
  onOpenDonorPassport: (donor: Donor) => void;
  onOpenDispatchTracking: (req: EmergencyRequest) => void;
  requests: EmergencyRequest[];
  donors: Donor[];
}

export const LiveCoordinationMapScreen: React.FC<LiveCoordinationMapScreenProps> = ({
  onOpenNewRequest,
  onOpenBroadcast,
  onOpenDonorPassport,
  onOpenDispatchTracking,
  requests,
  donors,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [activePin, setActivePin] = useState<string>('lilavati');

  const spotlightDonor = donors[0];

  const mapPins = [
    {
      id: 'lilavati',
      name: 'Lilavati Hospital',
      sub: '3 Units O- Needed • ETA 8m',
      top: '50%',
      left: '52%',
      isCritical: true,
      type: 'hospital',
    },
    {
      id: 'rotary',
      name: 'Rotary Blood Bank',
      sub: '1 Unit Dispatched (3.4°C)',
      top: '34%',
      left: '30%',
      type: 'bank',
    },
    {
      id: 'kem',
      name: 'KEM Hospital',
      sub: '1 Unit AB- Matched',
      top: '72%',
      left: '46%',
      type: 'hospital',
    },
    {
      id: 'rahul',
      name: 'Rahul Shah (Donor)',
      sub: 'O- Negative • En Route',
      top: '32%',
      left: '68%',
      isDonor: true,
      type: 'donor',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* 4 Clean Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#171b26] border border-[#262a35] flex flex-col">
          <span className="text-xs text-[#dfe2f1]/60 font-medium">Critical Shortage</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline text-2xl font-bold text-[#ff5451]">O-</span>
            <span className="text-xs text-[#dfe2f1]/70">18 units left</span>
          </div>
          <span className="text-[11px] text-[#ff5451] mt-1 font-medium">Deficit: -32 units</span>
        </div>

        <div className="p-4 rounded-xl bg-[#171b26] border border-[#262a35] flex flex-col">
          <span className="text-xs text-[#dfe2f1]/60 font-medium">Active Requests</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline text-2xl font-bold text-white">12</span>
            <span className="text-xs text-[#4cd7f6]">In Transit</span>
          </div>
          <span className="text-[11px] text-[#dfe2f1]/60 mt-1 font-mono">Avg ETA: 8 mins</span>
        </div>

        <div className="p-4 rounded-xl bg-[#171b26] border border-[#262a35] flex flex-col">
          <span className="text-xs text-[#dfe2f1]/60 font-medium">Standby Donors</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline text-2xl font-bold text-[#4edea3]">1,482</span>
            <span className="text-xs text-[#dfe2f1]/70">&le; 15 km</span>
          </div>
          <span className="text-[11px] text-[#4edea3] mt-1 font-medium">+126 active today</span>
        </div>

        <div className="p-4 rounded-xl bg-[#171b26] border border-[#262a35] flex flex-col">
          <span className="text-xs text-[#dfe2f1]/60 font-medium">Fulfillment Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-headline text-2xl font-bold text-white">94.8%</span>
            <span className="text-xs text-[#4edea3]">+2.4%</span>
          </div>
          <span className="text-[11px] text-[#dfe2f1]/60 mt-1">Banks 68% • Donors 32%</span>
        </div>
      </div>

      {/* Main Grid: Map (8 cols) + Urgent Queue (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Map View */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#171b26] p-2.5 rounded-xl border border-[#262a35]">
            {/* Blood Type Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs text-[#dfe2f1]/60 mr-1 font-medium whitespace-nowrap">Filter:</span>
              {['ALL', 'O-', 'AB-', 'O+', 'A+', 'B+'].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedGroup(bg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    selectedGroup === bg
                      ? bg === 'O-'
                        ? 'bg-[#ff5451] text-[#5c0008] font-bold'
                        : 'bg-[#262a35] text-white font-bold'
                      : 'text-[#dfe2f1]/60 hover:text-white'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenBroadcast}
              className="px-3 py-1.5 rounded-lg bg-[#ff5451]/20 border border-[#ff5451]/40 text-[#ffb3ad] hover:bg-[#ff5451]/30 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">campaign</span>
              <span>Broadcast Alert</span>
            </button>
          </div>

          {/* Map Canvas */}
          <div className="relative w-full h-[460px] rounded-2xl bg-[#171b26] border border-[#262a35] overflow-hidden shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
              style={{ backgroundImage: `url('${MAP_MUMBAI_URL}')` }}
            ></div>

            {/* Geofence Radar Rings */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <circle cx="52%" cy="50%" r="50" fill="none" stroke="#4cd7f6" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="52%" cy="50%" r="110" fill="none" stroke="#4cd7f6" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="52%" cy="50%" r="170" fill="none" stroke="#ff5451" strokeWidth="1.2" strokeDasharray="4 4" />
              {/* Courier Route */}
              <path d="M 180 160 Q 280 200 370 230" fill="none" stroke="#4cd7f6" strokeWidth="2.5" strokeDasharray="4 4" />
            </svg>

            {/* Interactive Pins */}
            {mapPins.map((pin) => {
              const isSelected = activePin === pin.id;
              return (
                <div
                  key={pin.id}
                  onClick={() => setActivePin(pin.id)}
                  style={{ top: pin.top, left: pin.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="relative flex items-center justify-center">
                    {pin.isCritical && (
                      <div className="w-10 h-10 rounded-full bg-[#ff5451]/40 animate-ping absolute"></div>
                    )}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                        pin.isCritical
                          ? 'bg-[#ff5451] text-[#5c0008]'
                          : pin.isDonor
                          ? 'bg-[#4edea3] text-[#003824]'
                          : 'bg-[#4cd7f6] text-[#003640]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {pin.isDonor ? 'person' : pin.type === 'bank' ? 'bloodtype' : 'local_hospital'}
                      </span>
                    </div>
                  </div>

                  {/* Pin Popover */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 rounded-xl bg-[#1c1f2a] border shadow-xl text-center z-30 transition-all ${
                      isSelected
                        ? 'block border-[#4cd7f6]'
                        : 'hidden group-hover:block border-[#262a35]'
                    }`}
                  >
                    <div className="font-headline text-xs font-bold text-white">{pin.name}</div>
                    <div className="text-[11px] text-[#dfe2f1]/80 mt-0.5">{pin.sub}</div>
                  </div>
                </div>
              );
            })}

            {/* Simple Map Legend */}
            <div className="absolute bottom-3 left-3 right-3 bg-[#0f131d]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#262a35] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="w-2 h-2 rounded-full bg-[#ff5451]"></span> Hospital (Critical)
                </span>
                <span className="flex items-center gap-1.5 text-white">
                  <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span> Blood Bank
                </span>
                <span className="flex items-center gap-1.5 text-white">
                  <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span> Active Donor
                </span>
              </div>
              <span className="hidden sm:inline text-[#dfe2f1]/60">Mumbai Metro • 15 km Radius</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Active Requests & Quick Donor Contact */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-sm font-bold text-white">Urgent Requests</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#ff5451]/20 text-[#ffb3ad] font-mono text-[10px] font-bold">
                2 Live
              </span>
            </div>

            {/* Request 1 */}
            <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#ff5451]/40 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#ff5451]">O-</span>
                    <span className="font-headline text-xs font-bold text-white">Lilavati Hospital</span>
                  </div>
                  <span className="text-[11px] text-[#dfe2f1]/60">3 Units Needed • Bandra West</span>
                </div>
                <span className="text-[11px] font-mono text-[#ffb3ad]">ETA: 8m</span>
              </div>

              {/* Progress */}
              <div className="w-full bg-[#262a35] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#ff5451] h-full w-[67%]"></div>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#dfe2f1]/60">
                <span>2/3 Units Sourced</span>
                <span>Sunil K. En Route</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenDispatchTracking(requests[0])}
                  className="flex-1 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  Track Courier
                </button>
                <button
                  type="button"
                  onClick={onOpenBroadcast}
                  className="px-3 py-1.5 rounded-lg bg-[#ff5451] text-[#5c0008] text-xs font-bold hover:brightness-110 cursor-pointer"
                >
                  Expand Radius
                </button>
              </div>
            </div>

            {/* Request 2 */}
            <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#4cd7f6]">AB-</span>
                    <span className="font-headline text-xs font-bold text-white">KEM Hospital</span>
                  </div>
                  <span className="text-[11px] text-[#dfe2f1]/60">1 Unit • Parel</span>
                </div>
                <span className="text-[11px] font-mono text-[#4edea3]">Matched</span>
              </div>
              <div className="w-full bg-[#262a35] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#4cd7f6] h-full w-[100%]"></div>
              </div>
            </div>
          </div>

          {/* Quick Standby Donor Card */}
          <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#4edea3] font-semibold">Available Donor</span>
              <span className="text-[10px] text-[#dfe2f1]/60">2.4 km away</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={spotlightDonor.avatarUrl}
                alt={spotlightDonor.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#262a35]"
              />
              <div className="flex flex-col">
                <span className="font-headline text-sm font-bold text-white">
                  {spotlightDonor.name}
                </span>
                <span className="text-xs text-[#dfe2f1]/70">
                  Universal <strong className="text-[#ff5451]">O- Negative</strong>
                </span>
                <span className="text-[11px] text-[#4edea3]">6 verified donations</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenDonorPassport(spotlightDonor)}
              className="w-full py-2 rounded-xl bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
            >
              View Donor Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
