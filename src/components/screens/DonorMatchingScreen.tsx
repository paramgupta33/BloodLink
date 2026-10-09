import React, { useState } from 'react';
import { Donor, BloodGroup, DonorStatus } from '../../types/bloodlink';
import { LeafletMapView, MapMarker, MapCircle } from '../maps/LeafletMapView';
import { formatDistance } from '../../utils/geoUtils';

interface DonorMatchingScreenProps {
  donors: Donor[];
  onOpenDonorPassport: (donor: Donor) => void;
  onUpdateDonorStatus?: (donorId: string, status: DonorStatus) => void;
}

export const DonorMatchingScreen: React.FC<DonorMatchingScreenProps> = ({
  donors,
  onOpenDonorPassport,
  onUpdateDonorStatus,
}) => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expansionLog, setExpansionLog] = useState<string | null>(null);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [matchingViewMode, setMatchingViewMode] = useState<'both' | 'map' | 'cards'>('both');

  // Hospital Epicenter (Emergency Requisition Origin)
  const hospitalEpicenter = {
    name: 'Lilavati Hospital Trauma ICU',
    lat: 19.0519,
    lng: 72.8295,
  };

  // Filtered donors by radius and blood group
  const filteredDonors = donors.filter((d) => {
    if (selectedBloodGroup !== 'ALL' && d.bloodGroup !== selectedBloodGroup) return false;
    if (d.distanceKm > selectedRadius) return false;
    return true;
  });

  // Progressive radius expansion simulation: 2 km → 5 km → 10 km → 25 km
  const handleSimulateProgressiveExpansion = () => {
    setIsExpanding(true);
    setExpansionLog('Initiating donor perimeter search at 2 km...');
    setSelectedRadius(2);

    setTimeout(() => {
      setExpansionLog('2 km pool insufficient (1 donor found). Expanding search radius to 5 km...');
      setSelectedRadius(5);
    }, 1200);

    setTimeout(() => {
      setExpansionLog('5 km pool analyzed. Expanding perimeter to 10 km corridor...');
      setSelectedRadius(10);
      if (onUpdateDonorStatus && donors[0]) {
        onUpdateDonorStatus(donors[0].id, 'accepted');
      }
      if (onUpdateDonorStatus && donors[1]) {
        onUpdateDonorStatus(donors[1].id, 'notified');
      }
    }, 2400);

    setTimeout(() => {
      setIsExpanding(false);
      setExpansionLog('Target requirement satisfied (2 verified donors confirmed). Broadcast terminated to avoid donor fatigue.');
    }, 3800);
  };

  const handleNotifyIndividual = (donor: Donor) => {
    if (onUpdateDonorStatus) {
      const nextStatus: DonorStatus = donor.status === 'available' ? 'notified' : 'accepted';
      onUpdateDonorStatus(donor.id, nextStatus);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Header & Progressive Expansion Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5451]"></span>
            <span className="font-mono text-[11px] font-semibold text-[#ffb3ad] uppercase tracking-wider">
              Emergency Donor Mobilization Engine
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-white mt-1">
            Donor Matching & Progressive Radius Triage
          </h1>
          <p className="text-xs text-[#dfe2f1]/70 mt-0.5">
            Geofenced triage algorithm matching blood compatibility, donation interval (&gt;90 days), and proximity.
          </p>
        </div>

        <button
          onClick={handleSimulateProgressiveExpansion}
          disabled={isExpanding}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-xs hover:brightness-110 shadow-md cursor-pointer disabled:opacity-50 self-start md:self-auto"
        >
          {isExpanding ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
              <span>Expanding Radius...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">radar</span>
              <span>Simulate Radius Expansion (2→25km)</span>
            </>
          )}
        </button>
      </div>

      {/* Progressive Radius Expansion Stepper Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-[#4cd7f6] font-semibold uppercase">
            Progressive Search Corridor: 2 km → 5 km → 10 km → 25 km
          </span>
          <span className="text-xs font-mono text-[#dfe2f1]/60">
            Active Radius: <strong className="text-white">&le; {selectedRadius} km</strong>
          </span>
        </div>

        {/* Stepper Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { rad: 2, label: '2 km (Immediate Walking/Bike)' },
            { rad: 5, label: '5 km (Neighbourhood Transit)' },
            { rad: 10, label: '10 km (Suburban Corridor)' },
            { rad: 25, label: '25 km (Metro-Wide Geofence)' },
          ].map((item) => (
            <button
              key={item.rad}
              type="button"
              onClick={() => setSelectedRadius(item.rad)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRadius === item.rad
                  ? 'bg-[#1c1f2a] border-[#4cd7f6] shadow-sm'
                  : 'bg-[#171b26] border-[#262a35] opacity-75 hover:opacity-100'
              }`}
            >
              <span className="font-mono text-base font-bold text-white block">
                {item.rad} km
              </span>
              <span className="text-[10px] text-[#dfe2f1]/60 block mt-0.5 truncate">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Live Expansion Log Feed */}
        {expansionLog && (
          <div className="p-3 rounded-xl bg-[#0a0e18] border border-[#4cd7f6]/40 flex items-center gap-2 text-xs font-mono text-[#4cd7f6] animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[16px] animate-pulse">info</span>
            <span>{expansionLog}</span>
          </div>
        )}
      </div>

      {/* Clinical Screening Disclaimer Notice */}
      <div className="p-3.5 rounded-xl bg-[#0a0e18] border border-[#262a35] flex items-start gap-3 text-xs text-[#dfe2f1]/70">
        <span className="material-symbols-outlined text-[#4cd7f6] text-[18px] shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-white">Clinical Verification Notice</span>
          <span className="text-[11px] leading-relaxed">
            BloodLink coordinates rapid emergency donor notification and triage. Final medical eligibility, hemoglobin screening, and collection must be performed at an authorized blood centre or hospital transfusion unit.
          </span>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Blood Group Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-[#dfe2f1]/60 mr-1">Filter Group:</span>
          {['ALL', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setSelectedBloodGroup(bg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                selectedBloodGroup === bg
                  ? 'bg-[#ff5451] text-[#5c0008] font-bold shadow-md shadow-[#ff5451]/20'
                  : 'bg-[#171b26] text-[#dfe2f1]/70 hover:bg-[#262a35] border border-[#262a35]'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[#1c1f2a] p-1 rounded-xl border border-[#262a35] self-start sm:self-auto">
          {(['both', 'map', 'cards'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMatchingViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium capitalize transition-colors cursor-pointer ${
                matchingViewMode === mode
                  ? 'bg-[#262a35] text-white font-bold shadow-sm'
                  : 'text-[#dfe2f1]/60 hover:text-white'
              }`}
            >
              {mode === 'both' ? 'Split View' : mode === 'map' ? 'Map Only' : 'Cards Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Progressive Geographic Search: Leaflet Map & Donor Roster */}
      {(() => {
        // Build Leaflet Markers
        const mapMarkers: MapMarker[] = [
          // Epicenter (Requesting Hospital)
          {
            id: 'epicenter-hospital',
            lat: hospitalEpicenter.lat,
            lng: hospitalEpicenter.lng,
            title: hospitalEpicenter.name,
            subtitle: 'Requisition Epicenter (Trauma Wing)',
            type: 'hospital',
            status: 'critical',
            badge: 'EPICENTER',
          },
          // Filtered Donors inside active radius (approximate neighborhood coordinates only)
          ...filteredDonors
            .filter((d) => d.lat && d.lng)
            .map((d) => ({
              id: d.id,
              lat: d.lat!,
              lng: d.lng!,
              title: `${d.name} (${d.bloodGroup})`,
              subtitle: `Area: ${d.locationArea} · ${d.distanceKm} km · Status: ${d.status.toUpperCase()}`,
              type: 'donor' as const,
              status: d.status,
              badge: d.bloodGroup,
            })),
        ];

        // Concentric Geofence Rings: 2km, 5km, 10km, 25km
        const mapCircles: MapCircle[] = [
          // Active Radius Ring
          {
            id: `active-circle-${selectedRadius}`,
            lat: hospitalEpicenter.lat,
            lng: hospitalEpicenter.lng,
            radiusMeters: selectedRadius * 1000,
            color: '#4cd7f6',
            fillColor: '#4cd7f6',
            fillOpacity: 0.08,
            dashArray: '6, 6',
            label: `Active Corridor: ${selectedRadius} km`,
          },
        ];

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Interactive Progressive Radius Map */}
            {(matchingViewMode === 'both' || matchingViewMode === 'map') && (
              <div
                className={`${
                  matchingViewMode === 'both' ? 'lg:col-span-7' : 'lg:col-span-12'
                } flex flex-col gap-2`}
              >
                <LeafletMapView
                  center={[hospitalEpicenter.lat, hospitalEpicenter.lng]}
                  zoom={selectedRadius <= 2 ? 14 : selectedRadius <= 5 ? 13 : selectedRadius <= 10 ? 12 : 10}
                  height={matchingViewMode === 'map' ? '540px' : '460px'}
                  markers={mapMarkers}
                  circles={mapCircles}
                  selectedMarkerId={selectedDonorId}
                  onSelectMarker={(id) => {
                    if (id !== 'epicenter-hospital') {
                      setSelectedDonorId(id);
                    }
                  }}
                  legend={
                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1.5 text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5451]"></span> Hospital Epicenter
                      </span>
                      <span className="flex items-center gap-1.5 text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00a572]"></span> Confirmed Donor
                      </span>
                      <span className="flex items-center gap-1.5 text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span> Pinging / Available
                      </span>
                      <span className="text-[#dfe2f1]/50 border-l border-[#262a35] pl-2">
                        Privacy Shield Active: Neighbourhood Centroids Only
                      </span>
                    </div>
                  }
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-[#dfe2f1]/50 px-1">
                  <span>
                    Current Pool: <strong className="text-white">{filteredDonors.length} matching candidates</strong> within {selectedRadius} km
                  </span>
                  <span>Personal home addresses redacted</span>
                </div>
              </div>
            )}

            {/* Right: Matching Donors Cards */}
            {(matchingViewMode === 'both' || matchingViewMode === 'cards') && (
              <div
                className={`${
                  matchingViewMode === 'both' ? 'lg:col-span-5' : 'lg:col-span-12'
                } flex flex-col gap-4 max-h-[580px] overflow-y-auto pr-1`}
              >
                {filteredDonors.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#171b26] border border-[#262a35] text-center text-xs text-[#dfe2f1]/60">
                    No eligible donors found within {selectedRadius} km. Try expanding to the next radius ring.
                  </div>
                ) : (
                  filteredDonors.map((donor) => {
                    const isSelected = selectedDonorId === donor.id;
                    const isAccepted = donor.status === 'accepted';
                    const isNotified = donor.status === 'notified';

                    return (
                      <div
                        key={donor.id}
                        onClick={() => setSelectedDonorId(donor.id)}
                        className={`p-4 rounded-xl bg-[#171b26] border flex flex-col justify-between gap-3 transition-all cursor-pointer shadow-md ${
                          isSelected
                            ? 'border-[#4cd7f6] ring-1 ring-[#4cd7f6] shadow-lg shadow-[#4cd7f6]/10'
                            : isAccepted
                            ? 'border-[#00a572]/50'
                            : isNotified
                            ? 'border-[#4cd7f6]/40'
                            : 'border-[#262a35] hover:border-[#353944]'
                        }`}
                      >
                        <div>
                          {/* Header: Avatar, Name, Status */}
                          <div className="flex items-start gap-3">
                            <img
                              src={donor.avatarUrl}
                              alt={donor.name}
                              className="w-12 h-12 rounded-xl object-cover border border-[#262a35] shrink-0"
                            />
                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-headline font-bold text-sm text-white truncate">
                                  {donor.name}
                                </h3>
                                <span
                                  className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold shrink-0 ${
                                    isAccepted
                                      ? 'bg-[#00a572]/20 text-[#4edea3]'
                                      : isNotified
                                      ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                                      : 'bg-[#262a35] text-[#dfe2f1]/70'
                                  }`}
                                >
                                  {donor.status.toUpperCase()}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-0.5 text-xs">
                                <span className="font-mono font-bold text-[#ff5451]">
                                  {donor.bloodGroup}
                                </span>
                                <span className="text-[#dfe2f1]/40">·</span>
                                <span className="text-[#dfe2f1]/60">
                                  {donor.distanceKm} km ({donor.locationArea})
                                </span>
                              </div>

                              <div className="text-[10px] text-[#4edea3] mt-0.5 font-mono">
                                Donated {donor.daysSinceDonation}d ago ({donor.verifiedDonationsCount} total)
                              </div>
                            </div>
                          </div>

                          {/* Badges strip */}
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {donor.badges.slice(0, 2).map((b) => (
                              <span
                                key={b}
                                className="px-2 py-0.5 rounded bg-[#1c1f2a] border border-[#262a35] text-[9px] text-[#dfe2f1]/80 font-medium"
                              >
                                ★ {b}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-[#262a35]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDonorPassport(donor);
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer text-center"
                          >
                            Profile
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotifyIndividual(donor);
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                              isAccepted
                                ? 'bg-[#00a572] text-[#00311f]'
                                : isNotified
                                ? 'bg-[#4cd7f6] text-[#003640]'
                                : 'bg-[#ff5451] text-[#5c0008] hover:brightness-110'
                            }`}
                          >
                            {isAccepted ? 'Accepted ✓' : isNotified ? 'Pinging...' : 'Mobilize'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
