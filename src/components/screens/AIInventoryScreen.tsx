import React, { useState } from 'react';
import { BloodGroup, ComponentType, InventoryItem } from '../../types/bloodlink';

interface AIInventoryScreenProps {
  inventory: InventoryItem[];
  onUpdateInventoryUnits: (bloodGroup: BloodGroup, component: ComponentType, delta: number) => void;
  onOpenBroadcast: () => void;
}

export const AIInventoryScreen: React.FC<AIInventoryScreenProps> = ({
  inventory,
  onUpdateInventoryUnits,
  onOpenBroadcast,
}) => {
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = inventory.filter((item) => {
    if (selectedComponent !== 'all' && item.component !== selectedComponent) return false;
    return true;
  });

  const criticalItems = inventory.filter((i) => i.status === 'critical');
  const totalUnits = inventory.reduce((acc, curr) => acc + curr.inStockUnits, 0);

  const handleAdjust = (bloodGroup: BloodGroup, component: ComponentType, delta: number) => {
    onUpdateInventoryUnits(bloodGroup, component, delta);
    setToastMessage(`Adjusted ${bloodGroup} (${component.toUpperCase()}) stock by ${delta > 0 ? `+${delta}` : delta} units.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#00a572] text-[#00311f] font-headline font-bold text-xs shadow-2xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Mobilize Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
            <span className="font-mono text-[11px] font-semibold text-[#4cd7f6] uppercase tracking-wider">
              Reserve Ledger & Cold Chain Stock
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-white mt-1">
            Blood-Centre Reserve Inventory
          </h1>
          <p className="text-xs text-[#dfe2f1]/70 mt-0.5">
            Real-time reserve levels across 5 municipal blood storage banks with interactive stock adjustment for hackathon simulation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenBroadcast}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-xs hover:brightness-110 shadow-md cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            <span>Broadcast Shortage Alert</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulator Callout & Status Banner */}
      <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">tune</span>
          </div>
          <div>
            <h3 className="font-headline text-sm font-bold text-white">
              Interactive Reserve Simulation
            </h3>
            <p className="text-xs text-[#dfe2f1]/70">
              Click <strong className="text-white">+5</strong> or <strong className="text-white">-5</strong> on any blood group below to see how reserve changes trigger critical alerts across the platform.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
            <span className="text-[#dfe2f1]/50 block text-[10px]">TOTAL IN STOCK</span>
            <span className="text-white font-bold text-sm tabular-nums">{totalUnits} Units</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#1c1f2a] border border-[#ff5451]/30">
            <span className="text-[#dfe2f1]/50 block text-[10px]">CRITICAL GROUPS</span>
            <span className="text-[#ff5451] font-bold text-sm tabular-nums">
              {criticalItems.length} Groups
            </span>
          </div>
        </div>
      </div>

      {/* Critical Shortage Warning Banner */}
      {criticalItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#93000a]/20 border border-[#ff5451]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5451] text-[#5c0008] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
            <div>
              <h3 className="font-headline text-sm font-bold text-white">
                Critical Reserve Deficit: {criticalItems.map((i) => `${i.bloodGroup} (${i.inStockUnits}u)`).join(', ')}
              </h3>
              <p className="text-xs text-[#dfe2f1]/70">
                Current reserve is below municipal safe threshold. Emergency donor mobilization and inter-bank routing recommended.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenBroadcast}
            className="px-4 py-2 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-xs hover:brightness-110 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Mobilize Standby Donors
          </button>
        </div>
      )}

      {/* Component Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262a35] pb-2">
        <span className="text-xs font-mono text-[#dfe2f1]/60 mr-2">Filter Component:</span>
        {[
          { id: 'all', label: 'All Components' },
          { id: 'whole', label: 'Whole Blood' },
          { id: 'prbc', label: 'PRBC' },
          { id: 'platelets', label: 'Platelets' },
          { id: 'plasma', label: 'Plasma' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedComponent(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              selectedComponent === tab.id
                ? 'bg-[#262a35] text-white font-bold'
                : 'text-[#dfe2f1]/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const isCritical = item.status === 'critical';
          const isLow = item.status === 'low';
          const percentage = Math.min(
            100,
            Math.round((item.inStockUnits / item.targetMinUnits) * 100)
          );

          return (
            <div
              key={`${item.bloodGroup}-${item.component}`}
              className={`p-4 rounded-2xl bg-[#171b26] border flex flex-col justify-between gap-3.5 transition-all ${
                isCritical
                  ? 'border-[#ff5451]/60 shadow-md shadow-[#ff5451]/5'
                  : isLow
                  ? 'border-[#4cd7f6]/40'
                  : 'border-[#262a35]'
              }`}
            >
              <div>
                {/* Header: Blood Group, Component, and Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-2xl font-bold text-white">
                      {item.bloodGroup}
                    </span>
                    <span className="text-xs font-mono font-semibold uppercase text-[#4cd7f6]">
                      {item.component}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      isCritical
                        ? 'bg-[#ff5451] text-[#5c0008]'
                        : isLow
                        ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                        : 'bg-[#00a572]/20 text-[#4edea3]'
                    }`}
                  >
                    {isCritical ? 'CRITICAL' : isLow ? 'LOW' : 'STABLE'}
                  </span>
                </div>

                {/* Stock Numbers */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-headline text-3xl font-bold text-white tabular-nums">
                    {item.inStockUnits}
                  </span>
                  <span className="text-xs text-[#dfe2f1]/60">
                    / {item.targetMinUnits} target units
                  </span>
                </div>

                {/* Level Progress */}
                <div className="w-full bg-[#262a35] h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCritical ? 'bg-[#ff5451]' : isLow ? 'bg-[#4cd7f6]' : 'bg-[#4edea3]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* Demand & Last Updated */}
                <div className="flex justify-between text-[11px] font-mono text-[#dfe2f1]/60 mt-2">
                  <span>7D Demand: ~{item.expectedDemand7D}u</span>
                  <span>Updated {item.lastUpdated}</span>
                </div>
              </div>

              {/* Interactive Stock Modifier Buttons */}
              <div className="pt-2 border-t border-[#262a35] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjust(item.bloodGroup, item.component, -5)}
                  className="flex-1 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-mono font-bold text-[#ffb3ad] transition-colors cursor-pointer"
                  title="Simulate reserve consumption (-5 units)"
                >
                  -5u
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjust(item.bloodGroup, item.component, 5)}
                  className="flex-1 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-mono font-bold text-[#4edea3] transition-colors cursor-pointer"
                  title="Simulate donation receipt (+5 units)"
                >
                  +5u
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 30-Day Demand Projection vs Available Supply Chart */}
      <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline text-base font-bold text-white">
              7-Day Anticipated Demand vs. Current Reserve
            </h3>
            <p className="text-xs text-[#dfe2f1]/60">
              Projected requirement against live blood bank inventory levels across Mumbai suburban depots
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded bg-[#ff5451]"></span> Demand
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded bg-[#4cd7f6]"></span> Current Reserve
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full h-44 bg-[#0a0e18] rounded-xl border border-[#262a35] p-4 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 520 120" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="30" x2="520" y2="30" stroke="#262a35" strokeWidth="1" />
            <line x1="0" y1="60" x2="520" y2="60" stroke="#262a35" strokeWidth="1" />
            <line x1="0" y1="90" x2="520" y2="90" stroke="#262a35" strokeWidth="1" />

            {/* O- */}
            <rect x="30" y="25" width="22" height="75" rx="3" fill="#ff5451" />
            <rect x="56" y="80" width="22" height="20" rx="3" fill="#4cd7f6" />
            <text x="54" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">O-</text>

            {/* AB- */}
            <rect x="100" y="45" width="22" height="55" rx="3" fill="#ff5451" />
            <rect x="126" y="85" width="22" height="15" rx="3" fill="#4cd7f6" />
            <text x="124" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">AB-</text>

            {/* B- */}
            <rect x="170" y="55" width="22" height="45" rx="3" fill="#ff5451" />
            <rect x="196" y="70" width="22" height="30" rx="3" fill="#4cd7f6" />
            <text x="194" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">B-</text>

            {/* B+ */}
            <rect x="240" y="40" width="22" height="60" rx="3" fill="#ff5451" />
            <rect x="266" y="50" width="22" height="50" rx="3" fill="#4cd7f6" />
            <text x="264" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">B+</text>

            {/* A+ */}
            <rect x="310" y="30" width="22" height="70" rx="3" fill="#ff5451" />
            <rect x="336" y="20" width="22" height="80" rx="3" fill="#4cd7f6" />
            <text x="334" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">A+</text>

            {/* O+ */}
            <rect x="380" y="25" width="22" height="75" rx="3" fill="#ff5451" />
            <rect x="406" y="15" width="22" height="85" rx="3" fill="#4cd7f6" />
            <text x="404" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">O+</text>

            {/* AB+ */}
            <rect x="450" y="50" width="22" height="50" rx="3" fill="#ff5451" />
            <rect x="476" y="35" width="22" height="65" rx="3" fill="#4cd7f6" />
            <text x="474" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">AB+</text>
          </svg>
        </div>
      </div>
    </div>
  );
};
