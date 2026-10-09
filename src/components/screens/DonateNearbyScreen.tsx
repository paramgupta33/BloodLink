import React, { useState } from 'react';
import { BloodGroup, BloodCentre } from '../../types/bloodlink';

interface DonateNearbyScreenProps {
  centres: BloodCentre[];
  onOpenDonateModal: (centre: BloodCentre, bloodGroup: BloodGroup) => void;
}

export const DonateNearbyScreen: React.FC<DonateNearbyScreenProps> = ({
  centres,
  onOpenDonateModal,
}) => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>('O-');
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [componentPreference, setComponentPreference] = useState<'whole' | 'platelets' | 'plasma'>('whole');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter centres strictly within selected maximum distance
  const filteredCentres = centres.filter((centre) => {
    if (centre.distanceKm > maxDistance) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return centre.name.toLowerCase().includes(q) || centre.address.toLowerCase().includes(q);
    }
    return true;
  });

  // Sort: Critical need first, then Low stock, then Stable; within same status sort by closest distance
  const sortedCentres = [...filteredCentres].sort((a, b) => {
    const statusOrder: Record<string, number> = { critical: 1, low: 2, stable: 3 };
    const statusA = a.stockByGroup[selectedBloodGroup]?.status || 'stable';
    const statusB = b.stockByGroup[selectedBloodGroup]?.status || 'stable';

    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    return a.distanceKm - b.distanceKm;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Header & Mission */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
            <span className="font-mono text-[11px] font-semibold text-[#4cd7f6] uppercase tracking-wider">
              Voluntary Donor Mobilization
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-white mt-1">
            Donate Where It Matters
          </h1>
          <p className="text-xs text-[#dfe2f1]/70 mt-1 max-w-2xl">
            Don’t wait for an emergency. Check real-time demand gaps at authorized blood centres and schedule a voluntary donation where your blood group is needed most.
          </p>
        </div>

        {/* Demo Data Disclaimer Badge */}
        <div className="px-3 py-2 rounded-xl bg-[#171b26] border border-[#262a35] text-[11px] font-mono text-[#dfe2f1]/60 self-start md:self-auto flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">info</span>
          <span>Simulated Reserve Feed for Hackathon Demo</span>
        </div>
      </div>

      {/* Donor Selection Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Blood Group Selector (6 cols) */}
          <div className="md:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[#dfe2f1]/70 font-semibold uppercase">
              1. Select Your Blood Group
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedBloodGroup(bg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedBloodGroup === bg
                      ? 'bg-[#ff5451] text-[#5c0008] shadow-md shadow-[#ff5451]/20'
                      : 'bg-[#1c1f2a] text-[#dfe2f1]/80 hover:bg-[#262a35] border border-[#262a35]'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Max Distance Selector (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[#dfe2f1]/70 font-semibold uppercase">
              2. Max Travel Distance
            </label>
            <div className="flex items-center gap-1.5 bg-[#1c1f2a] p-1 rounded-xl border border-[#262a35]">
              {[5, 10, 25].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setMaxDistance(dist)}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    maxDistance === dist
                      ? 'bg-[#262a35] text-[#4cd7f6] font-bold shadow-sm'
                      : 'text-[#dfe2f1]/60 hover:text-white'
                  }`}
                >
                  &le; {dist} km
                </button>
              ))}
            </div>
          </div>

          {/* Component Preference (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-mono text-[#dfe2f1]/70 font-semibold uppercase">
              3. Donation Type
            </label>
            <select
              value={componentPreference}
              onChange={(e) => setComponentPreference(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono text-white focus:outline-none focus:border-[#4cd7f6]"
            >
              <option value="whole">Whole Blood (Standard)</option>
              <option value="platelets">Platelets (Apheresis)</option>
              <option value="plasma">Plasma</option>
            </select>
          </div>
        </div>

        {/* Search bar inside controls */}
        <div className="pt-2 border-t border-[#262a35] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#dfe2f1]/40 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search centre name or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white placeholder-[#dfe2f1]/40 focus:outline-none focus:border-[#4cd7f6]"
            />
          </div>

          <div className="text-xs font-mono text-[#dfe2f1]/60">
            Showing <strong className="text-white">{sortedCentres.length}</strong> centres within {maxDistance} km
          </div>
        </div>
      </div>

      {/* Blood Group Urgency Summary Strip */}
      <div className="p-3.5 rounded-xl bg-[#171b26] border border-[#262a35] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff5451] text-[18px]">emergency</span>
          <span className="text-[#dfe2f1]/80">
            Selected Blood Group: <strong className="text-[#ff5451] font-mono text-sm">{selectedBloodGroup}</strong>
          </span>
          <span className="text-[#dfe2f1]/40">·</span>
          <span className="text-[#dfe2f1]/60">
            Centres are prioritized by local shortage level first, then proximity.
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5451]"></span> Critical Need
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span> Low Stock
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span> Stable
          </span>
        </div>
      </div>

      {/* Recommended Centres Cards Grid */}
      {sortedCentres.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#171b26] border border-[#262a35] text-center flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[#dfe2f1]/40 text-[40px]">
            location_off
          </span>
          <h3 className="font-headline font-bold text-white text-base">
            No authorized centres within {maxDistance} km
          </h3>
          <p className="text-xs text-[#dfe2f1]/60 max-w-sm">
            Try expanding your search radius to 25 km to view municipal blood depots across the broader metro network.
          </p>
          <button
            onClick={() => setMaxDistance(25)}
            className="px-4 py-2 rounded-xl bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Expand to 25 km
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedCentres.map((centre) => {
            const stockInfo = centre.stockByGroup[selectedBloodGroup] || {
              units: 0,
              status: 'stable',
              forecastGap: 0,
            };
            const isCritical = stockInfo.status === 'critical';
            const isLow = stockInfo.status === 'low';

            return (
              <div
                key={centre.id}
                className={`p-5 rounded-2xl bg-[#171b26] border flex flex-col justify-between gap-4 transition-all shadow-md ${
                  isCritical
                    ? 'border-[#ff5451]/50 shadow-[#ff5451]/5'
                    : isLow
                    ? 'border-[#4cd7f6]/40'
                    : 'border-[#262a35]'
                }`}
              >
                {/* Header: Name, Distance, Status */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline font-bold text-sm text-white">
                          {centre.name}
                        </span>
                      </div>
                      <span className="text-xs text-[#dfe2f1]/60 mt-0.5">
                        {centre.distanceKm} km away · {centre.address}
                      </span>
                    </div>

                    {/* Stock Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold shrink-0 ${
                        isCritical
                          ? 'bg-[#ff5451] text-[#5c0008]'
                          : isLow
                          ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                          : 'bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/40'
                      }`}
                    >
                      {isCritical ? 'CRITICAL NEED' : isLow ? 'LOW STOCK' : 'STABLE'}
                    </span>
                  </div>

                  {/* Stock & Demand Metrics Grid */}
                  <div className="mt-4 p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35] grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-[#dfe2f1]/60 block uppercase">
                        Current {selectedBloodGroup} Stock
                      </span>
                      <span className="font-headline text-lg font-bold text-white tabular-nums">
                        {stockInfo.units} units
                      </span>
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          isCritical ? 'text-[#ff5451]' : isLow ? 'text-[#4cd7f6]' : 'text-[#4edea3]'
                        }`}
                      >
                        {isCritical ? 'Below emergency reserve' : isLow ? 'Reserve dipping' : 'Nominal capacity'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#dfe2f1]/60 block uppercase">
                        7-Day Forecast Gap
                      </span>
                      <span className="font-headline text-lg font-bold text-[#ffb3ad] tabular-nums">
                        {stockInfo.forecastGap > 0 ? `-${stockInfo.forecastGap}u` : 'Surplus'}
                      </span>
                      <span className="text-[10px] text-[#dfe2f1]/60 block mt-0.5">
                        {stockInfo.forecastGap > 15
                          ? 'Shortage risk elevated'
                          : stockInfo.forecastGap > 0
                          ? 'Moderate deficit risk'
                          : 'Demand fully covered'}
                      </span>
                    </div>
                  </div>

                  {/* Operational Details */}
                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#dfe2f1]/60">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">
                        schedule
                      </span>
                      {centre.operatingHours}
                    </span>
                    <span>{centre.phone}</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenDonateModal(centre, selectedBloodGroup)}
                    className={`w-full py-2.5 rounded-xl font-headline font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCritical
                        ? 'bg-[#ff5451] text-[#5c0008] hover:brightness-110 shadow-md shadow-[#ff5451]/20'
                        : isLow
                        ? 'bg-[#4cd7f6] text-[#003640] hover:brightness-110'
                        : 'bg-[#262a35] text-white hover:bg-[#313540]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                    <span>I want to donate here</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
