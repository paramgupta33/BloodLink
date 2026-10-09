import React, { useState } from 'react';
import { BloodGroup, EmergencyRequest, Donor } from '../../types/bloodlink';
import { LeafletMapView, MapMarker, MapCircle, MapPolyline } from '../maps/LeafletMapView';

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
  const [showDonors, setShowDonors] = useState<boolean>(true);

  const spotlightDonor = donors[0];

  const mapMarkers: MapMarker[] = [
    {
      id: 'lilavati',
      lat: 19.0519,
      lng: 72.8295,
      title: 'Lilavati Hospital & Research Centre',
      subtitle: '3 Units O- Needed · In-Transit ETA 8m · Bandra West',
      type: 'hospital',
      status: 'critical',
      badge: 'REQ-9041',
    },
    {
      id: 'rotary',
      lat: 19.0573,
      lng: 72.8415,
      title: 'Rotary Blood Bank & Research Centre',
      subtitle: '1 Unit Dispatched · 3.4°C Cold Chain Active',
      type: 'centre',
      status: 'low',
      badge: 'FULFILLING DEPOT',
    },
    {
      id: 'kem',
      lat: 19.0034,
      lng: 72.8427,
      title: 'KEM Hospital Emergency Ward',
      subtitle: '1 Unit AB- Matched · Parel Desk · ETA 16m',
      type: 'hospital',
      status: 'low',
      badge: 'HIGH URGENCY',
    },
    ...(showDonors
      ? [
          {
            id: 'rahul',
            lat: 19.1310,
            lng: 72.8320,
            title: 'Rahul Shah (Voluntary Donor)',
            subtitle: 'O- Negative · En Route to Bandra Depot',
            type: 'donor' as const,
            status: 'accepted' as const,
            badge: 'VOLUNTEER',
          },
          {
            id: 'priya',
            lat: 19.0178,
            lng: 72.8478,
            title: 'Priya Mehta (Voluntary Donor)',
            subtitle: 'AB- Negative · Standby Volunteer (Dadar Central)',
            type: 'donor' as const,
            status: 'notified' as const,
            badge: 'STANDBY',
          },
        ]
      : []),
  ];

  const mapPolylines: MapPolyline[] = [
    {
      id: 'courier-dispatch-route-1',
      positions: [
        [19.0573, 72.8415], // Rotary Blood Bank (Bandra West Station)
        [19.0558, 72.8370], // SV Road Junction
        [19.0532, 72.8325], // Hill Road Corridor
        [19.0519, 72.8295], // Lilavati Hospital Trauma Wing
      ],
      color: '#4cd7f6',
      weight: 4,
      dashArray: '6, 6',
      label: 'Cold-Chain Transit Route: Rotary Depot → Lilavati (1.8 km · ETA 8 mins)',
    },
    {
      id: 'courier-dispatch-route-2',
      positions: [
        [19.0573, 72.8415], // Rotary Blood Bank
        [19.0350, 72.8420], // Mahim Causeway
        [19.0180, 72.8450], // Dadar TT
        [19.0034, 72.8427], // KEM Hospital Emergency Ward
      ],
      color: '#4edea3',
      weight: 3.5,
      dashArray: '8, 8',
      label: 'Emergency Secondary Route: Rotary Depot → KEM Hospital (6.2 km · ETA 16 mins)',
    },
  ];

  const mapCircles: MapCircle[] = [
    {
      id: 'corridor-inner',
      lat: 19.0519,
      lng: 72.8295,
      radiusMeters: 3000,
      color: '#4cd7f6',
      fillColor: '#4cd7f6',
      fillOpacity: 0.05,
      dashArray: '3, 3',
      label: '3 km Immediate Priority Perimeter',
    },
    {
      id: 'corridor-outer',
      lat: 19.0519,
      lng: 72.8295,
      radiusMeters: 10000,
      color: '#ff5451',
      fillColor: '#ff5451',
      fillOpacity: 0.03,
      dashArray: '4, 4',
      label: '10 km Suburban Dispatch Geofence',
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

            <div className="flex items-center gap-2">
              {/* Privacy Toggle: Show/Hide Voluntary Donors */}
              <button
                type="button"
                onClick={() => setShowDonors(!showDonors)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showDonors
                    ? 'bg-[#262a35] text-[#4edea3] border border-[#00a572]/40'
                    : 'bg-[#1c1f2a] text-[#dfe2f1]/60 hover:text-white border border-[#262a35]'
                }`}
                title="Toggle donor markers on or off to protect privacy"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {showDonors ? 'visibility' : 'visibility_off'}
                </span>
                <span>{showDonors ? 'Donors Visible' : 'Donors Hidden (Privacy Mode)'}</span>
              </button>

              <button
                onClick={onOpenBroadcast}
                className="px-3 py-1.5 rounded-lg bg-[#ff5451]/20 border border-[#ff5451]/40 text-[#ffb3ad] hover:bg-[#ff5451]/30 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                <span className="hidden sm:inline">Broadcast Alert</span>
              </button>
            </div>
          </div>

          {/* Functional Leaflet Map Canvas */}
          <div className="flex flex-col gap-2">
            <LeafletMapView
              center={[19.0519, 72.8295]}
              zoom={12}
              height="480px"
              markers={mapMarkers}
              circles={mapCircles}
              polylines={mapPolylines}
              selectedMarkerId={activePin}
              onSelectMarker={(id) => setActivePin(id)}
              legend={
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5451]"></span> Hospital (Stat Target)
                  </span>
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span> Blood Bank Depot
                  </span>
                  {showDonors && (
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00a572]"></span> Voluntary Donor
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-[#4cd7f6] font-mono">
                    <span className="inline-block w-4 h-0.5 bg-[#4cd7f6] border-t border-dashed border-[#4cd7f6]"></span> Active Dispatch Route (ETA 8m)
                  </span>
                </div>
              }
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-[#dfe2f1]/50 px-1">
              <span>Simulated Real-Time Cold-Chain Transit Lines</span>
              <span>&copy; OpenStreetMap contributors</span>
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
