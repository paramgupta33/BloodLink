import React, { useState } from 'react';
import {
  Donor,
  EmergencyRequest,
  BloodCentre,
  DonationCamp,
  DonationAppointment,
  DonorDonationRecord,
  BloodGroup,
  DonorTab,
} from '../../types/bloodlink';
import { LeafletMapView, MapMarker, MapCircle } from '../maps/LeafletMapView';
import {
  calculateHaversineDistance,
  formatDistance,
  getExternalDirectionsUrl,
  PRESET_MUMBAI_AREAS,
} from '../../utils/geoUtils';

interface DonorDashboardProps {
  donor: Donor;
  requests: EmergencyRequest[];
  centres: BloodCentre[];
  camps: DonationCamp[];
  appointments: DonationAppointment[];
  donationHistory: DonorDonationRecord[];
  onRegisterInterest: (requestId: string) => void;
  onBookAppointment: (appointment: DonationAppointment) => void;
  onRegisterCamp: (campId: string) => void;
  onToggleAvailability: () => void;
  activeTab: DonorTab;
  setActiveTab: (tab: DonorTab) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  donor,
  requests,
  centres,
  camps,
  appointments,
  donationHistory,
  onRegisterInterest,
  onBookAppointment,
  onRegisterCamp,
  onToggleAvailability,
  activeTab,
  setActiveTab,
}) => {
  // Donate Nearby Controls
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>(donor.bloodGroup);
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected centre for appointment booking modal
  const [selectedCentreForBooking, setSelectedCentreForBooking] = useState<BloodCentre | null>(null);
  const [bookingSlot, setBookingSlot] = useState('10:30 AM – 11:30 AM');
  const [bookingDate, setBookingDate] = useState('Tomorrow, Oct 10');
  const [bookingSuccessPass, setBookingSuccessPass] = useState<string | null>(null);

  // Map & Geolocation state for Donate Nearby
  const [selectedMapCentreId, setSelectedMapCentreId] = useState<string | null>(null);
  const [donorViewMode, setDonorViewMode] = useState<'both' | 'map' | 'list'>('both');
  const [selectedMapCampId, setSelectedMapCampId] = useState<string | null>(null);
  const [campsViewMode, setCampsViewMode] = useState<'both' | 'map' | 'list'>('both');
  const [donorLocation, setDonorLocation] = useState({
    lat: donor.lat || 19.1310,
    lng: donor.lng || 72.8320,
    isLive: false,
    areaLabel: donor.locationArea || 'Andheri West',
  });
  const [geoState, setGeoState] = useState<{
    status: 'idle' | 'requesting' | 'granted' | 'denied';
    message?: string;
  }>({ status: 'idle' });

  // Handle explicit geolocation request on user action
  const handleRequestLiveLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoState({
        status: 'denied',
        message: 'Browser geolocation is not supported on this device. Using manual area.',
      });
      return;
    }

    setGeoState({ status: 'requesting', message: 'Requesting device GPS coordinates...' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDonorLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isLive: true,
          areaLabel: 'GPS Live Location',
        });
        setGeoState({
          status: 'granted',
          message: 'GPS location activated. Radiuses calculated from current position.',
        });
      },
      (err) => {
        setGeoState({
          status: 'denied',
          message: `Location permission denied or unavailable (${err.message}). Using manual area fallback.`,
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Selected Certificate to view
  const [selectedCert, setSelectedCert] = useState<DonorDonationRecord | null>(null);

  // Registered interest set (ids)
  const [interestedRequestIds, setInterestedRequestIds] = useState<string[]>([]);

  // Filter Emergency Opportunities matching donor blood group
  const matchingRequests = requests.filter(
    (r) => r.status !== 'fulfilled' && (r.bloodGroup === donor.bloodGroup || donor.bloodGroup === 'O-')
  );

  // Filter centres strictly by maxDistance for Donate Nearby
  const nearbyCentres = centres
    .filter((c) => {
      if (c.distanceKm > maxDistance) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by critical stock first, then low stock, then distance
      const statusOrder: Record<string, number> = { critical: 1, low: 2, stable: 3 };
      const statusA = a.stockByGroup[selectedBloodGroup]?.status || 'stable';
      const statusB = b.stockByGroup[selectedBloodGroup]?.status || 'stable';
      if (statusOrder[statusA] !== statusOrder[statusB]) {
        return statusOrder[statusA] - statusOrder[statusB];
      }
      return a.distanceKm - b.distanceKm;
    });

  // Upcoming appointment for this donor (if any)
  const myUpcomingAppointment = appointments.find(
    (a) => a.donorName === donor.name && a.donationStatus !== 'completed'
  );

  // Handler: Book Appointment Submit
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCentreForBooking) return;

    const passRef = `BL-INTAKE-${Math.floor(100000 + Math.random() * 900000)}`;
    const newAppointment: DonationAppointment = {
      id: `apt-${Date.now()}`,
      donorName: donor.name,
      donorBloodGroup: selectedBloodGroup,
      centreId: selectedCentreForBooking.id,
      centreName: selectedCentreForBooking.name,
      date: bookingDate,
      timeSlot: bookingSlot,
      component: 'whole',
      arrivalStatus: 'scheduled',
      screeningStatus: 'pending',
      donationStatus: 'scheduled',
      isVerified: false,
      passRef,
    };

    onBookAppointment(newAppointment);
    setBookingSuccessPass(passRef);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Donor Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262a35] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'home' as DonorTab, label: 'Home', icon: 'home' },
            { id: 'emergencies' as DonorTab, label: 'Emergency Requests', icon: 'emergency' },
            { id: 'donate-nearby' as DonorTab, label: 'Donate Nearby', icon: 'volunteer_activism' },
            { id: 'camps' as DonorTab, label: 'Donation Camps', icon: 'event' },
            { id: 'my-donations' as DonorTab, label: 'My Donations', icon: 'workspace_premium' },
            { id: 'profile' as DonorTab, label: 'Profile', icon: 'person' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#262a35] text-white font-bold shadow-sm'
                  : 'text-[#dfe2f1]/70 hover:text-white hover:bg-[#262a35]/40'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span className="text-[#dfe2f1]/60">Donor:</span>
          <span className="text-white font-bold">{donor.name}</span>
          <span className="px-2 py-0.5 rounded-md bg-[#ff5451] text-[#5c0008] font-bold">
            {donor.bloodGroup}
          </span>
        </div>
      </div>

      {/* VIEW 1: DONOR HOME */}
      {activeTab === 'home' && (
        <div className="flex flex-col gap-6">
          {/* Welcome & Availability Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1c1f2a] to-[#171b26] border border-[#262a35] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={donor.avatarUrl}
                alt={donor.name}
                className="w-14 h-14 rounded-2xl object-cover border border-[#262a35] shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-headline font-bold text-lg text-white">
                    Welcome back, {donor.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#00a572]/20 text-[#4edea3] font-mono text-[10px] font-bold">
                    VERIFIED DONOR
                  </span>
                </div>
                <p className="text-xs text-[#dfe2f1]/70 mt-0.5">
                  Universal <strong className="text-[#ff5451]">{donor.bloodGroup}</strong> Volunteer · {donor.verifiedDonationsCount} Lifetime Donations · Last Donated: {donor.lastDonationDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onToggleAvailability}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  donor.isAvailable
                    ? 'bg-[#00a572]/20 text-[#4edea3] border border-[#00a572]/40'
                    : 'bg-[#262a35] text-[#dfe2f1]/60'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {donor.isAvailable ? 'check_circle' : 'do_not_disturb_on'}
                </span>
                <span>{donor.isAvailable ? 'Available for Emergency' : 'On Cooldown'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('donate-nearby')}
                className="px-4 py-2 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs hover:brightness-110 shadow-md cursor-pointer whitespace-nowrap"
              >
                Find Where I'm Needed →
              </button>
            </div>
          </div>

          {/* Upcoming Appointment Card (if any) */}
          {myUpcomingAppointment && (
            <div className="p-4 rounded-2xl bg-[#00a572]/15 border border-[#00a572]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00a572] text-[#00311f] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">event_available</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#4edea3] uppercase font-bold block">
                    Upcoming Scheduled Donation Intake
                  </span>
                  <h3 className="font-headline font-bold text-sm text-white">
                    {myUpcomingAppointment.centreName}
                  </h3>
                  <p className="text-xs text-[#dfe2f1]/70">
                    {myUpcomingAppointment.date} at {myUpcomingAppointment.timeSlot} · Pass: {myUpcomingAppointment.passRef}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-[#4edea3] px-3 py-1.5 rounded-lg bg-[#00a572]/20 self-start sm:self-auto">
                Status: {myUpcomingAppointment.arrivalStatus.toUpperCase()}
              </span>
            </div>
          )}

          {/* Active Emergency Appeals Matching You */}
          <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-white">
                  Urgent Emergency Appeals Matching {donor.bloodGroup}
                </h3>
                <p className="text-xs text-[#dfe2f1]/60">
                  Hospital emergency patients currently awaiting compatible red cell units.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('emergencies')}
                className="text-xs text-[#4cd7f6] hover:underline cursor-pointer font-mono"
              >
                View all ({matchingRequests.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingRequests.slice(0, 2).map((req) => {
                const isInterested = interestedRequestIds.includes(req.id);
                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-[#1c1f2a] border border-[#ff5451]/30 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-headline font-bold text-sm text-white">
                            {req.hospitalName}
                          </span>
                          <span className="text-xs text-[#dfe2f1]/60 block mt-0.5">
                            {req.location} · Required: {req.requiredBy}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#ff5451] text-[#5c0008] font-mono text-[10px] font-bold">
                          {req.bloodGroup} STAT
                        </span>
                      </div>

                      <div className="mt-3 p-2.5 rounded-lg bg-[#0a0e18] flex items-center justify-between text-xs font-mono">
                        <span className="text-[#dfe2f1]/60">Remaining Needed:</span>
                        <span className="text-[#ffb3ad] font-bold">
                          {req.unitsNeeded - req.unitsFulfilled} of {req.unitsNeeded} units
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#262a35]">
                      <span className="text-[11px] text-[#dfe2f1]/50 font-mono">
                        Attending: {req.doctorName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onRegisterInterest(req.id);
                          setInterestedRequestIds((prev) => [...prev, req.id]);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl font-headline font-bold text-xs transition-all cursor-pointer ${
                          isInterested
                            ? 'bg-[#00a572] text-[#00311f]'
                            : 'bg-[#ff5451] text-[#5c0008] hover:brightness-110'
                        }`}
                      >
                        {isInterested ? 'Interest Registered ✓' : "I'm Interested"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EMERGENCY REQUESTS (DONOR PERSPECTIVE) */}
      {activeTab === 'emergencies' && (
        <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
          <div>
            <h2 className="font-headline text-lg font-bold text-white">Active Emergency Opportunities</h2>
            <p className="text-xs text-[#dfe2f1]/60">
              Expressing interest notifies hospital triage and routes you to the designated authorized blood depot for screening.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingRequests.map((req) => {
              const isInterested = interestedRequestIds.includes(req.id);

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex flex-col justify-between gap-3.5"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-headline font-bold text-sm text-white">
                          {req.hospitalName}
                        </h3>
                        <p className="text-xs text-[#dfe2f1]/60 mt-0.5">{req.location}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#ff5451]/20 text-[#ffb3ad] font-mono text-[10px] font-bold">
                        {req.urgencyLabel}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 rounded bg-[#0a0e18]">
                        <span className="text-[#dfe2f1]/50 block text-[10px]">REQUIRED GROUP</span>
                        <span className="text-[#ff5451] font-bold text-sm">
                          {req.bloodGroup} ({req.component.toUpperCase()})
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#0a0e18]">
                        <span className="text-[#dfe2f1]/50 block text-[10px]">UNITS SOUGHT</span>
                        <span className="text-white font-bold text-sm">
                          {req.unitsNeeded - req.unitsFulfilled} units remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#262a35] flex items-center justify-between">
                    <span className="text-[11px] text-[#dfe2f1]/60">Required: {req.requiredBy}</span>
                    <button
                      type="button"
                      onClick={() => {
                        onRegisterInterest(req.id);
                        setInterestedRequestIds((prev) => [...prev, req.id]);
                      }}
                      className={`px-4 py-1.5 rounded-xl font-headline font-bold text-xs transition-all cursor-pointer ${
                        isInterested
                          ? 'bg-[#00a572] text-[#00311f]'
                          : 'bg-[#ff5451] text-[#5c0008] hover:brightness-110'
                      }`}
                    >
                      {isInterested ? 'Interest Registered ✓' : "I'm Interested"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DONATE NEARBY (KEY FEATURE WITH LEAFLET MAP) */}
      {activeTab === 'donate-nearby' && (() => {
        // Calculate true Haversine distance from donor location
        const dynamicNearbyCentres = centres
          .map((c) => {
            const dist =
              c.lat && c.lng
                ? calculateHaversineDistance(
                    donorLocation.lat,
                    donorLocation.lng,
                    c.lat,
                    c.lng
                  )
                : c.distanceKm;
            return { ...c, calculatedDistance: dist };
          })
          .filter((c) => {
            // Never send a donor to a centre outside selected distance
            if (c.calculatedDistance > maxDistance) return false;
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              return c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
            }
            return true;
          })
          .sort((a, b) => {
            // Sort by critical stock first, then predicted shortage gap, then distance
            const statusOrder: Record<string, number> = { critical: 1, low: 2, stable: 3 };
            const statusA = a.stockByGroup[selectedBloodGroup]?.status || 'stable';
            const statusB = b.stockByGroup[selectedBloodGroup]?.status || 'stable';
            if (statusOrder[statusA] !== statusOrder[statusB]) {
              return statusOrder[statusA] - statusOrder[statusB];
            }
            const gapA = a.stockByGroup[selectedBloodGroup]?.forecastGap || 0;
            const gapB = b.stockByGroup[selectedBloodGroup]?.forecastGap || 0;
            if (gapB !== gapA) {
              return gapB - gapA;
            }
            return a.calculatedDistance - b.calculatedDistance;
          });

        // Generate Leaflet Markers
        const mapMarkers: MapMarker[] = [
          // Donor Location Marker
          {
            id: 'donor-user-pin',
            lat: donorLocation.lat,
            lng: donorLocation.lng,
            title: `Your Location (${donorLocation.areaLabel})`,
            subtitle: `${donor.name} · ${donor.bloodGroup} Voluntary Donor`,
            type: 'user',
            status: 'active',
            badge: donorLocation.isLive ? 'GPS' : 'AREA',
          },
          // Centre Markers (only those within maxDistance)
          ...dynamicNearbyCentres
            .filter((c) => c.lat && c.lng)
            .map((c) => {
              const stock = c.stockByGroup[selectedBloodGroup] || {
                units: 0,
                status: 'stable',
                forecastGap: 0,
              };
              return {
                id: c.id,
                lat: c.lat!,
                lng: c.lng!,
                title: c.name,
                subtitle: `${formatDistance(c.calculatedDistance)} · ${stock.units}u ${selectedBloodGroup} (${stock.status.toUpperCase()})`,
                type: 'centre' as const,
                status: stock.status,
                badge: `${stock.units}u`,
              };
            }),
        ];

        // Search Radius Circle
        const mapCircles: MapCircle[] = [
          {
            id: 'donor-radius-ring',
            lat: donorLocation.lat,
            lng: donorLocation.lng,
            radiusMeters: maxDistance * 1000,
            color: '#4cd7f6',
            fillColor: '#4cd7f6',
            fillOpacity: 0.05,
            dashArray: '5, 5',
            label: `Max Search: ${maxDistance} km`,
          },
        ];

        return (
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
                  <span className="font-mono text-[11px] font-semibold text-[#4cd7f6] uppercase tracking-wider">
                    Voluntary Discovery Engine
                  </span>
                </div>
                <h1 className="font-headline text-2xl font-bold text-white mt-1">
                  Donate Where It Matters
                </h1>
                <p className="text-xs text-[#dfe2f1]/70 mt-0.5">
                  Find nearby authorized blood centres with critical reserve deficits for your blood group.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-[11px] font-mono text-[#dfe2f1]/50 px-3 py-1.5 rounded-xl bg-[#171b26] border border-[#262a35]">
                  Simulated Live Depot Inventory Feed
                </span>
              </div>
            </div>

            {/* Controls: Blood Group + Distance + Geolocation / Area Selection */}
            <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* 1. Blood Group */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#dfe2f1]/70 font-semibold uppercase">
                    1. Blood Group
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setSelectedBloodGroup(bg)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
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

                {/* 2. Maximum Distance */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-[#dfe2f1]/70 font-semibold uppercase">
                    2. Max Distance
                  </label>
                  <div className="flex items-center gap-2 bg-[#1c1f2a] p-1 rounded-xl border border-[#262a35]">
                    {[5, 10, 25].map((dist) => (
                      <button
                        key={dist}
                        type="button"
                        onClick={() => setMaxDistance(dist)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
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

                {/* 3. Donor Location Mode (Permission Geolocation + Fallback) */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-[#dfe2f1]/70 font-semibold uppercase">
                      3. Your Location
                    </label>
                    {donorLocation.isLive && (
                      <span className="text-[10px] font-mono text-[#4edea3]">● GPS Active</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRequestLiveLocation}
                      disabled={geoState.status === 'requesting'}
                      className="px-3 py-1.5 rounded-xl bg-[#262a35] hover:bg-[#313540] text-xs font-mono text-[#4cd7f6] border border-[#4cd7f6]/40 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Request browser geolocation"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {geoState.status === 'requesting' ? 'sync' : 'near_me'}
                      </span>
                      <span>{donorLocation.isLive ? 'Update GPS' : 'Use Current GPS'}</span>
                    </button>

                    {/* Fallback Area Selector */}
                    <select
                      value={donorLocation.areaLabel}
                      onChange={(e) => {
                        const area = PRESET_MUMBAI_AREAS.find((a) => a.areaLabel === e.target.value);
                        if (area) {
                          setDonorLocation({
                            lat: area.lat,
                            lng: area.lng,
                            isLive: false,
                            areaLabel: area.areaLabel,
                          });
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                    >
                      {PRESET_MUMBAI_AREAS.map((a) => (
                        <option key={a.areaLabel} value={a.areaLabel}>
                          {a.areaLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Notice if Geolocation was denied or active */}
              {geoState.message && (
                <div className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-[#0a0e18] border border-[#262a35] text-[#dfe2f1]/70 flex items-center justify-between">
                  <span>{geoState.message}</span>
                  <button
                    type="button"
                    onClick={() => setGeoState({ status: 'idle' })}
                    className="text-[#dfe2f1]/50 hover:text-white text-xs ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Summary Bar & View Mode Toggle */}
              <div className="pt-2 border-t border-[#262a35] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#dfe2f1]/60">
                <span>
                  Centres within <strong className="text-white">&le; {maxDistance} km</strong> of{' '}
                  <strong className="text-[#4cd7f6]">{donorLocation.areaLabel}</strong> seeking{' '}
                  <strong className="text-[#ff5451]">{selectedBloodGroup}</strong>: {dynamicNearbyCentres.length}
                </span>

                <div className="flex items-center gap-1.5 bg-[#1c1f2a] p-1 rounded-xl border border-[#262a35] self-start sm:self-auto">
                  {(['both', 'map', 'list'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDonorViewMode(mode)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium capitalize transition-colors cursor-pointer ${
                        donorViewMode === mode
                          ? 'bg-[#262a35] text-white font-bold shadow-sm'
                          : 'text-[#dfe2f1]/60 hover:text-white'
                      }`}
                    >
                      {mode === 'both' ? 'Split View' : mode === 'map' ? 'Map Only' : 'List Only'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Split Content: Interactive Leaflet Map + Centres Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Map View */}
              {(donorViewMode === 'both' || donorViewMode === 'map') && (
                <div
                  className={`${
                    donorViewMode === 'both' ? 'lg:col-span-7' : 'lg:col-span-12'
                  } flex flex-col gap-2`}
                >
                  <LeafletMapView
                    center={[donorLocation.lat, donorLocation.lng]}
                    zoom={maxDistance <= 5 ? 13 : maxDistance <= 10 ? 12 : 11}
                    height={donorViewMode === 'map' ? '540px' : '440px'}
                    markers={mapMarkers}
                    circles={mapCircles}
                    selectedMarkerId={selectedMapCentreId}
                    onSelectMarker={(id) => {
                      if (id !== 'donor-user-pin') {
                        setSelectedMapCentreId(id);
                      }
                    }}
                    legend={
                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span> Your Location
                        </span>
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5451]"></span> Critical Need
                        </span>
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span> Low Stock
                        </span>
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span> Adequate
                        </span>
                      </div>
                    }
                  />

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#dfe2f1]/50 px-1">
                    <span>Search Geofence: {maxDistance} km circle</span>
                    <span>Approx. straight-line distance (Haversine)</span>
                  </div>
                </div>
              )}

              {/* Centres Cards List */}
              {(donorViewMode === 'both' || donorViewMode === 'list') && (
                <div
                  className={`${
                    donorViewMode === 'both' ? 'lg:col-span-5' : 'lg:col-span-12'
                  } flex flex-col gap-4 max-h-[580px] overflow-y-auto pr-1`}
                >
                  {dynamicNearbyCentres.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#171b26] border border-[#262a35] text-center text-xs text-[#dfe2f1]/60">
                      No authorized centres within {maxDistance} km of {donorLocation.areaLabel}. Try expanding your search radius to 25 km.
                    </div>
                  ) : (
                    dynamicNearbyCentres.map((centre) => {
                      const isSelected = selectedMapCentreId === centre.id;
                      const stock = centre.stockByGroup[selectedBloodGroup] || {
                        units: 0,
                        status: 'stable',
                        forecastGap: 0,
                      };
                      const isCrit = stock.status === 'critical';
                      const isLow = stock.status === 'low';

                      return (
                        <div
                          key={centre.id}
                          onClick={() => setSelectedMapCentreId(centre.id)}
                          className={`p-5 rounded-2xl bg-[#171b26] border flex flex-col justify-between gap-4 shadow-md transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#4cd7f6] ring-1 ring-[#4cd7f6] shadow-lg shadow-[#4cd7f6]/10'
                              : isCrit
                              ? 'border-[#ff5451]/50 hover:border-[#ff5451]'
                              : isLow
                              ? 'border-[#4cd7f6]/40 hover:border-[#4cd7f6]'
                              : 'border-[#262a35] hover:border-[#353944]'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-headline font-bold text-sm text-white">
                                  {centre.name}
                                </h3>
                                <span className="text-xs text-[#dfe2f1]/60 mt-0.5 block">
                                  {formatDistance(centre.calculatedDistance)} away · {centre.address}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold shrink-0 ${
                                  isCrit
                                    ? 'bg-[#ff5451] text-[#5c0008]'
                                    : isLow
                                    ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                                    : 'bg-[#00a572]/20 text-[#4edea3]'
                                }`}
                              >
                                {isCrit ? 'CRITICAL NEED' : isLow ? 'LOW STOCK' : 'STABLE'}
                              </span>
                            </div>

                            <div className="mt-3.5 p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35] grid grid-cols-2 gap-2 text-xs font-mono">
                              <div>
                                <span className="text-[10px] text-[#dfe2f1]/50 block">RESERVE LEVEL</span>
                                <span className="font-headline text-base font-bold text-white">
                                  {stock.units} units
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-[#dfe2f1]/50 block">FORECAST GAP</span>
                                <span className="font-headline text-base font-bold text-[#ffb3ad]">
                                  {stock.forecastGap > 0 ? `-${stock.forecastGap}u deficit` : 'Surplus'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#262a35] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-[#dfe2f1]/50">
                              <span>{centre.operatingHours}</span>
                              {centre.lat && centre.lng && (
                                <a
                                  href={getExternalDirectionsUrl(
                                    centre.lat,
                                    centre.lng,
                                    donorLocation.lat,
                                    donorLocation.lng
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[#4cd7f6] hover:underline flex items-center gap-0.5 ml-1"
                                  title="View route in OpenStreetMap"
                                >
                                  <span className="material-symbols-outlined text-[13px]">directions</span>
                                  <span>Map</span>
                                </a>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCentreForBooking(centre);
                                setBookingSuccessPass(null);
                              }}
                              className={`px-3.5 py-1.5 rounded-xl font-headline font-bold text-xs transition-all cursor-pointer ${
                                isCrit
                                  ? 'bg-[#ff5451] text-[#5c0008] hover:brightness-110'
                                  : 'bg-[#4cd7f6] text-[#003640] hover:brightness-110'
                              }`}
                            >
                              I Want to Donate Here
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* VIEW 4: DONATION CAMPS WITH MAP */}
      {activeTab === 'camps' && (() => {
        // Build camp map markers
        const campMarkers: MapMarker[] = camps
          .filter((c) => c.lat && c.lng)
          .map((c) => ({
            id: c.id,
            lat: c.lat!,
            lng: c.lng!,
            title: c.title,
            subtitle: `${c.dateStr} · ${c.timeStr} · ${c.registeredCount}/${c.goalCount} registered`,
            type: 'camp' as const,
            badge: c.targetTag,
          }));

        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-headline text-lg font-bold text-white">Community Donation Drives</h2>
                <p className="text-xs text-[#dfe2f1]/60">
                  Pre-register for upcoming mass blood drives organized by authorized municipal hospitals.
                </p>
              </div>

              {/* Mobile / View toggle */}
              <div className="flex items-center bg-[#1c1f2a] p-1 rounded-xl border border-[#262a35] self-start sm:self-auto">
                {(['both', 'map', 'list'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCampsViewMode(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium capitalize transition-colors cursor-pointer ${
                      campsViewMode === mode
                        ? 'bg-[#262a35] text-white font-bold shadow-sm'
                        : 'text-[#dfe2f1]/60 hover:text-white'
                    }`}
                  >
                    {mode === 'both' ? 'Split View' : mode === 'map' ? 'Map Only' : 'List Only'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Camp Map */}
              {(campsViewMode === 'both' || campsViewMode === 'map') && (
                <div
                  className={`${
                    campsViewMode === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'
                  } flex flex-col gap-2`}
                >
                  <LeafletMapView
                    center={[19.0760, 72.8777]}
                    zoom={11}
                    height={campsViewMode === 'map' ? '500px' : '420px'}
                    markers={campMarkers}
                    selectedMarkerId={selectedMapCampId}
                    onSelectMarker={(id) => setSelectedMapCampId(id)}
                    legend={
                      <span className="flex items-center gap-1.5 text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffc107]"></span> Scheduled Blood Drive Location
                      </span>
                    }
                  />
                  <span className="text-[11px] font-mono text-[#dfe2f1]/50 px-1">
                    Click drive marker to inspect venue & target quota
                  </span>
                </div>
              )}

              {/* Camps Cards */}
              {(campsViewMode === 'both' || campsViewMode === 'list') && (
                <div
                  className={`${
                    campsViewMode === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'
                  } grid grid-cols-1 md:grid-cols-2 gap-4`}
                >
                  {camps.map((camp) => {
                    const isSelected = selectedMapCampId === camp.id;
                    return (
                      <div
                        key={camp.id}
                        onClick={() => setSelectedMapCampId(camp.id)}
                        className={`p-5 rounded-2xl bg-[#171b26] border flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#4cd7f6] ring-1 ring-[#4cd7f6] shadow-lg shadow-[#4cd7f6]/10'
                            : 'border-[#262a35] hover:border-[#353944]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-[#ff5451] text-[#5c0008] font-mono text-[10px] font-bold">
                              {camp.targetTag}
                            </span>
                            <span className="text-xs font-mono text-white">{camp.dateStr}</span>
                          </div>

                          <h3 className="font-headline font-bold text-sm text-white mt-2">
                            {camp.title}
                          </h3>
                          <p className="text-xs text-[#dfe2f1]/60 mt-0.5">{camp.address}</p>

                          <div className="mt-3 text-xs font-mono text-[#dfe2f1]/70">
                            Operating Hours: {camp.timeStr}
                          </div>

                          <div className="mt-2 text-xs font-mono text-[#4edea3]">
                            Registered: {camp.registeredCount} / {camp.goalCount} donors
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#262a35]">
                          {camp.lat && camp.lng && (
                            <a
                              href={getExternalDirectionsUrl(camp.lat, camp.lng)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 rounded-xl bg-[#262a35] hover:bg-[#313540] text-xs font-mono text-[#4cd7f6] flex items-center gap-1"
                              title="Directions"
                            >
                              <span className="material-symbols-outlined text-[14px]">directions</span>
                              <span>Map</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRegisterCamp(camp.id);
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs hover:brightness-110 transition-colors cursor-pointer text-center"
                          >
                            Pre-Register Slot
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* VIEW 5: MY DONATIONS */}
      {activeTab === 'my-donations' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-headline text-lg font-bold text-white">Verified Donation History</h2>
            <p className="text-xs text-[#dfe2f1]/60">
              Medical donation credentials verified by authorized transfusion officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {donationHistory.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-[#171b26] border border-[#00a572]/40 flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-mono text-[#4edea3] font-bold">
                      VERIFIED TRANSFUSION
                    </span>
                    <span className="font-mono text-xs text-white">{rec.date}</span>
                  </div>

                  <h3 className="font-headline font-bold text-sm text-white mt-2">
                    {rec.centreName}
                  </h3>
                  <p className="text-xs text-[#dfe2f1]/60 mt-0.5">
                    {rec.units} Unit {rec.bloodGroup} ({rec.component.toUpperCase()})
                  </p>

                  <div className="mt-3 p-2 rounded bg-[#0a0e18] text-[11px] font-mono text-[#dfe2f1]/70">
                    Cert: <strong className="text-[#4cd7f6]">{rec.certificateCode}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCert(rec)}
                  className="w-full py-1.5 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  View Digital Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 6: DONOR PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto w-full p-6 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-5 shadow-xl">
          <div className="flex items-center gap-4 pb-4 border-b border-[#262a35]">
            <img
              src={donor.avatarUrl}
              alt={donor.name}
              className="w-16 h-16 rounded-2xl object-cover border border-[#262a35]"
            />
            <div>
              <h2 className="font-headline text-lg font-bold text-white">{donor.name}</h2>
              <p className="text-xs text-[#dfe2f1]/60">
                Registered Volunteer Donor · {donor.locationArea}
              </p>
              <span className="text-xs font-mono text-[#4edea3] mt-0.5 block">
                {donor.phone || '+91 98201 44921'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
              <span className="text-[#dfe2f1]/50 block">BLOOD GROUP</span>
              <span className="font-headline text-xl font-bold text-[#ff5451] block mt-1">
                {donor.bloodGroup}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
              <span className="text-[#dfe2f1]/50 block">DONATIONS</span>
              <span className="font-headline text-xl font-bold text-[#4edea3] block mt-1">
                {donor.verifiedDonationsCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
              <span className="text-[#dfe2f1]/50 block">LAST DONATION</span>
              <span className="font-headline text-base font-bold text-white block mt-1">
                {donor.daysSinceDonation}d ago
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="p-4 rounded-xl bg-[#0a0e18] border border-[#262a35] flex flex-col gap-2">
            <span className="text-xs font-mono text-[#dfe2f1]/60 uppercase">
              Non-Monetary Recognition Badges
            </span>
            <div className="flex flex-wrap gap-2">
              {donor.badges.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1 rounded-lg bg-[#1c1f2a] border border-[#262a35] text-xs text-white"
                >
                  ★ {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Appointment Modal */}
      {selectedCentreForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#171b26] border border-[#262a35] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-start justify-between pb-2 border-b border-[#262a35]">
              <div>
                <h3 className="font-headline text-base font-bold text-white">
                  Schedule Voluntary Donation
                </h3>
                <p className="text-xs text-[#dfe2f1]/60">{selectedCentreForBooking.name}</p>
              </div>
              <button
                onClick={() => setSelectedCentreForBooking(null)}
                className="p-1 rounded text-[#dfe2f1]/60 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {bookingSuccessPass ? (
              <div className="flex flex-col gap-3 text-center py-2">
                <span className="material-symbols-outlined text-[36px] text-[#4edea3] mx-auto">
                  check_circle
                </span>
                <h4 className="font-headline font-bold text-base text-white">
                  Appointment Scheduled!
                </h4>
                <div className="p-3 rounded-xl bg-[#0a0e18] border border-[#00a572]/40 text-xs font-mono text-left flex flex-col gap-1">
                  <span className="text-[#4edea3]">Pass: {bookingSuccessPass}</span>
                  <span className="text-white">Centre: {selectedCentreForBooking.name}</span>
                  <span className="text-[#dfe2f1]/70">Date: {bookingDate} · {bookingSlot}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCentreForBooking(null)}
                  className="w-full py-2 rounded-xl bg-[#00a572] text-[#00311f] font-headline font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#dfe2f1]/70 font-medium">Preferred Date</label>
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white"
                  >
                    <option>Today (Walk-in Intake)</option>
                    <option>Tomorrow, Oct 10</option>
                    <option>Saturday, Oct 11</option>
                    <option>Sunday, Oct 12</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#dfe2f1]/70 font-medium">Time Window</label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white"
                  >
                    <option>09:30 AM – 10:30 AM</option>
                    <option>10:30 AM – 11:30 AM</option>
                    <option>12:00 PM – 01:00 PM</option>
                    <option>03:00 PM – 04:00 PM</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0a0e18] text-[11px] text-[#dfe2f1]/60">
                  Clinical vitals, weight (&gt;45kg), and hemoglobin will be verified at the centre prior to donation.
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#262a35]">
                  <button
                    type="button"
                    onClick={() => setSelectedCentreForBooking(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#dfe2f1]/70"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs"
                  >
                    Confirm Appointment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Digital Certificate Viewer Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#171b26] border border-[#4edea3]/40 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <span className="material-symbols-outlined text-[40px] text-[#4edea3] mx-auto">
              workspace_premium
            </span>
            <div>
              <h3 className="font-headline text-lg font-bold text-white">
                Certificate of Voluntary Donation
              </h3>
              <p className="text-xs text-[#dfe2f1]/60 mt-0.5">
                Authorized Municipal Transfusion Network
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0a0e18] border border-[#262a35] text-left text-xs font-mono flex flex-col gap-2">
              <div className="flex justify-between border-b border-[#262a35] pb-1.5">
                <span className="text-[#dfe2f1]/50">CERTIFICATE NO:</span>
                <span className="text-[#4cd7f6] font-bold">{selectedCert.certificateCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#dfe2f1]/50">DONOR NAME:</span>
                <span className="text-white font-bold">{donor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#dfe2f1]/50">BLOOD GROUP:</span>
                <span className="text-[#ff5451] font-bold">{selectedCert.bloodGroup} ({selectedCert.component.toUpperCase()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#dfe2f1]/50">DATE VERIFIED:</span>
                <span className="text-white">{selectedCert.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#dfe2f1]/50">CENTRE:</span>
                <span className="text-white">{selectedCert.centreName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#dfe2f1]/50">MEDICAL OFFICER:</span>
                <span className="text-[#4edea3]">{selectedCert.medicalOfficer}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCert(null)}
              className="w-full py-2 rounded-xl bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
