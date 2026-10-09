import React, { useState } from 'react';
import {
  EmergencyRequest,
  InventoryItem,
  BloodCentre,
  BloodGroup,
  ComponentType,
  DonationAppointment,
  DonationCamp,
  ForecastItem,
  CentreTab,
} from '../../types/bloodlink';
import { LeafletMapView, MapMarker, MapCircle } from '../maps/LeafletMapView';
import {
  getExternalDirectionsUrl,
  calculateHaversineDistance,
  formatDistance,
  PRESET_MUMBAI_AREAS,
} from '../../utils/geoUtils';

interface BloodCentreDashboardProps {
  inventory: InventoryItem[];
  requests: EmergencyRequest[];
  appointments: DonationAppointment[];
  camps: DonationCamp[];
  forecasts: ForecastItem[];
  centre: BloodCentre;
  onUpdateInventory: (bloodGroup: BloodGroup, component: ComponentType, delta: number) => void;
  onAcceptRequest: (requestId: string) => void;
  onFulfillRequest: (requestId: string) => void;
  onUpdateAppointment: (
    appointmentId: string,
    updates: Partial<DonationAppointment>
  ) => void;
  onCreateCamp: (camp: DonationCamp) => void;
  activeTab: CentreTab;
  setActiveTab: (tab: CentreTab) => void;
}

export const BloodCentreDashboard: React.FC<BloodCentreDashboardProps> = ({
  inventory,
  requests,
  appointments,
  camps,
  forecasts,
  centre,
  onUpdateInventory,
  onAcceptRequest,
  onFulfillRequest,
  onUpdateAppointment,
  onCreateCamp,
  activeTab,
  setActiveTab,
}) => {
  // Inventory filter
  const [componentFilter, setComponentFilter] = useState<string>('all');

  // Camp Creation Modal State
  const [isCampModalOpen, setIsCampModalOpen] = useState(false);
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampLocation, setNewCampLocation] = useState('BKC Ground Complex, Bandra Kurla Complex');
  const [newCampLat, setNewCampLat] = useState<number>(19.0600);
  const [newCampLng, setNewCampLng] = useState<number>(72.8600);
  const [newCampDate, setNewCampDate] = useState('Sun, Nov 16');
  const [newCampTime, setNewCampTime] = useState('09:00 AM – 05:00 PM');
  const [newCampTag, setNewCampTag] = useState('Whole Blood & Platelets');
  const [newCampGoal, setNewCampGoal] = useState(150);

  // Centre location state for Profile Map (editable by authorized staff)
  const [centreCoords, setCentreCoords] = useState<{ lat: number; lng: number }>({
    lat: centre.lat || 19.0573,
    lng: centre.lng || 72.8415,
  });
  const [centreAddress, setCentreAddress] = useState(centre.address);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // Camps Map state
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);
  const [campsViewMode, setCampsViewMode] = useState<'both' | 'map' | 'list'>('both');

  // Request review drawer / modal
  const [selectedRequestReview, setSelectedRequestReview] = useState<EmergencyRequest | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Metrics
  const totalAvailableUnits = inventory.reduce((sum, item) => sum + item.inStockUnits, 0);
  const lowStockItems = inventory.filter((item) => item.status === 'critical' || item.status === 'low');
  const uniqueLowStockGroups = Array.from(new Set(lowStockItems.map((i) => i.bloodGroup)));
  const incomingRequests = requests.filter((r) => r.status !== 'fulfilled');
  const upcomingAppointments = appointments.filter((a) => a.donationStatus !== 'completed');

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    if (componentFilter !== 'all' && item.component !== componentFilter) return false;
    return true;
  });

  const handleCreateCampSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle.trim()) return;

    const distance = calculateHaversineDistance(
      centreCoords.lat,
      centreCoords.lng,
      newCampLat,
      newCampLng
    );

    const camp: DonationCamp = {
      id: `camp-${Date.now()}`,
      title: newCampTitle,
      locationName: newCampLocation,
      address: `${newCampLocation}, Mumbai`,
      lat: newCampLat,
      lng: newCampLng,
      dateStr: newCampDate,
      timeStr: newCampTime,
      targetTag: newCampTag,
      bannerUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC420jFDwakS4_4a_sbp_GnzjmvVqWgQH6XKUR5W_P0TZZBwJJ_GCwl23CnbBZuVVYA4U8QRj2FMgym7y-Z0FIq4xk7gStjI23io9wUedMYqenPFyXj0njii30P9i5PqlydS4mChvrK989CV-Gxuwhwzmu6x-svjK5D7ulqi5ZHamH8-UVA0UFEmhVBkd6pLxBVsrMBDQCeGpRriTFmnH4zKlznW91rZRLNVD4Ygj1iEEJI5UPSTerL',
      registeredCount: 0,
      goalCount: newCampGoal,
    };

    onCreateCamp(camp);
    setSelectedCampId(camp.id);
    setIsCampModalOpen(false);
    showToast(`Donation drive "${camp.title}" scheduled (${formatDistance(distance)} from centre).`);
    setNewCampTitle('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#00a572] text-[#00311f] font-headline font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-Navigation for Blood Centre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262a35] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'overview' as CentreTab, label: 'Overview', icon: 'dashboard' },
            { id: 'inventory' as CentreTab, label: 'Inventory', icon: 'bloodtype' },
            { id: 'requests' as CentreTab, label: 'Blood Requests', icon: 'emergency' },
            { id: 'appointments' as CentreTab, label: 'Donors & Appointments', icon: 'person_search' },
            { id: 'camps' as CentreTab, label: 'Donation Camps', icon: 'event' },
            { id: 'forecasts' as CentreTab, label: 'Forecasts', icon: 'trending_up' },
            { id: 'profile' as CentreTab, label: 'Centre Profile', icon: 'verified_user' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
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

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] text-[#dfe2f1]/60">
          <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
          <span>{centre.name.split('&')[0].trim()}</span>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35]">
              <span className="text-xs font-medium text-[#dfe2f1]/60">Total Available Units</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-headline text-3xl font-bold text-white tabular-nums">
                  {totalAvailableUnits}
                </span>
                <span className="text-xs text-[#4cd7f6] font-mono">in cold-chain</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#171b26] border border-[#ff5451]/40">
              <span className="text-xs font-medium text-[#ffb3ad]">Low-Stock Groups</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-headline text-3xl font-bold text-[#ff5451] tabular-nums">
                  {uniqueLowStockGroups.length}
                </span>
                <span className="text-xs text-[#ffb3ad] font-mono">
                  {uniqueLowStockGroups.join(', ') || 'None'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35]">
              <span className="text-xs font-medium text-[#dfe2f1]/60">Incoming Requests</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-headline text-3xl font-bold text-white tabular-nums">
                  {incomingRequests.length}
                </span>
                <span className="text-xs text-[#4cd7f6] font-mono">hospital pings</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35]">
              <span className="text-xs font-medium text-[#dfe2f1]/60">Upcoming Donations</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-headline text-3xl font-bold text-[#4edea3] tabular-nums">
                  {upcomingAppointments.length}
                </span>
                <span className="text-xs text-[#dfe2f1]/60 font-mono">appointments</span>
              </div>
            </div>
          </div>

          {/* Quick Inventory Summary Strip */}
          <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-white">Reserve Inventory at a Glance</h3>
                <p className="text-xs text-[#dfe2f1]/60">
                  Real-time component units in cold-chain storage with quick simulation adjustment.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs text-[#4cd7f6] hover:underline cursor-pointer font-mono"
              >
                Detailed Inventory Management →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => {
                const totalGroupUnits = inventory
                  .filter((i) => i.bloodGroup === bg)
                  .reduce((sum, i) => sum + i.inStockUnits, 0);
                const isCrit = totalGroupUnits < 20;
                const isLow = totalGroupUnits < 45;

                return (
                  <div
                    key={bg}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-between gap-1 text-center ${
                      isCrit
                        ? 'bg-[#1c1f2a] border-[#ff5451]/50'
                        : isLow
                        ? 'bg-[#1c1f2a] border-[#4cd7f6]/40'
                        : 'bg-[#1c1f2a] border-[#262a35]'
                    }`}
                  >
                    <span className="font-mono font-bold text-sm text-white">{bg}</span>
                    <span
                      className={`font-headline text-lg font-bold tabular-nums ${
                        isCrit ? 'text-[#ff5451]' : isLow ? 'text-[#4cd7f6]' : 'text-[#4edea3]'
                      }`}
                    >
                      {totalGroupUnits}u
                    </span>
                    <span className="text-[10px] font-mono text-[#dfe2f1]/50">
                      {isCrit ? 'Critical' : isLow ? 'Low' : 'Stable'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incoming Hospital Requisitions Queue */}
          <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-white">Incoming Hospital Requests</h3>
                <p className="text-xs text-[#dfe2f1]/60">
                  Hospital requisitions routed to this centre for inventory allocation.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('requests')}
                className="text-xs text-[#4cd7f6] hover:underline cursor-pointer font-mono"
              >
                View all ({requests.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#262a35] text-[#dfe2f1]/60 font-mono">
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Hospital</th>
                    <th className="py-2.5 px-3">Blood Group</th>
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3">Units Needed</th>
                    <th className="py-2.5 px-3">Urgency</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a35]/60 font-mono">
                  {incomingRequests.slice(0, 4).map((req) => (
                    <tr key={req.id} className="hover:bg-[#1c1f2a]/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{req.requestId}</td>
                      <td className="py-3 px-3 font-sans text-white">{req.hospitalName}</td>
                      <td className="py-3 px-3 font-bold text-[#ff5451]">{req.bloodGroup}</td>
                      <td className="py-3 px-3 uppercase text-[#dfe2f1]/80">{req.component}</td>
                      <td className="py-3 px-3 text-white">
                        {req.unitsFulfilled}/{req.unitsNeeded} units
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff5451]/20 text-[#ffb3ad]">
                          {req.urgencyLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-xs text-[#dfe2f1]/80">
                        {req.status === 'in_transit' ? 'Dispatched' : req.status === 'matched' ? 'Stock Reserved' : 'Pending Review'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRequestReview(req)}
                          className="px-3 py-1 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline text-lg font-bold text-white">
                Component Reserve Management
              </h2>
              <p className="text-xs text-[#dfe2f1]/60">
                Adjust stock units to test real-time shortage updates and donor recommendation changes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#dfe2f1]/60">Component:</span>
              {['all', 'whole', 'prbc', 'platelets', 'plasma'].map((cmp) => (
                <button
                  key={cmp}
                  onClick={() => setComponentFilter(cmp)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase cursor-pointer transition-colors ${
                    componentFilter === cmp
                      ? 'bg-[#262a35] text-white font-bold'
                      : 'text-[#dfe2f1]/60 hover:text-white'
                  }`}
                >
                  {cmp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredInventory.map((item) => {
              const isCrit = item.status === 'critical';
              const isLow = item.status === 'low';

              return (
                <div
                  key={`${item.bloodGroup}-${item.component}`}
                  className={`p-4 rounded-2xl bg-[#171b26] border flex flex-col justify-between gap-3 ${
                    isCrit ? 'border-[#ff5451]/50' : isLow ? 'border-[#4cd7f6]/40' : 'border-[#262a35]'
                  }`}
                >
                  <div>
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
                          isCrit
                            ? 'bg-[#ff5451] text-[#5c0008]'
                            : isLow
                            ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                            : 'bg-[#00a572]/20 text-[#4edea3]'
                        }`}
                      >
                        {isCrit ? 'CRITICAL' : isLow ? 'LOW' : 'STABLE'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-headline text-3xl font-bold text-white tabular-nums">
                        {item.inStockUnits}
                      </span>
                      <span className="text-xs text-[#dfe2f1]/60">
                        / {item.targetMinUnits} target units
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#dfe2f1]/50 mt-2">
                      Updated {item.lastUpdated} · 7D demand ~{item.expectedDemand7D}u
                    </div>
                  </div>

                  {/* Stock Adjuster Buttons */}
                  <div className="pt-2 border-t border-[#262a35] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateInventory(item.bloodGroup, item.component, -5);
                        showToast(`Reduced ${item.bloodGroup} ${item.component} by 5 units.`);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-mono font-bold text-[#ffb3ad] cursor-pointer"
                      title="Simulate reserve dispatch (-5u)"
                    >
                      -5u
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateInventory(item.bloodGroup, item.component, 5);
                        showToast(`Added 5 units to ${item.bloodGroup} ${item.component}.`);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-mono font-bold text-[#4edea3] cursor-pointer"
                      title="Simulate donation receipt (+5u)"
                    >
                      +5u
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: BLOOD REQUESTS REVIEW */}
      {activeTab === 'requests' && (
        <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-lg font-bold text-white">Hospital Blood Requests</h2>
              <p className="text-xs text-[#dfe2f1]/60">
                Review, reserve stock, and dispatch units to requesting hospitals.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#262a35] text-[#dfe2f1]/60 font-mono">
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Hospital</th>
                  <th className="py-2.5 px-3">Blood Group</th>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Units Requested</th>
                  <th className="py-2.5 px-3">Fulfilled</th>
                  <th className="py-2.5 px-3">Urgency</th>
                  <th className="py-2.5 px-3">Centre Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a35]/60 font-mono">
                {requests.map((req) => {
                  const isFulfilled = req.status === 'fulfilled';
                  return (
                    <tr key={req.id} className="hover:bg-[#1c1f2a]/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{req.requestId}</td>
                      <td className="py-3 px-3 font-sans text-white">{req.hospitalName}</td>
                      <td className="py-3 px-3 font-bold text-[#ff5451]">{req.bloodGroup}</td>
                      <td className="py-3 px-3 uppercase text-[#dfe2f1]/80">{req.component}</td>
                      <td className="py-3 px-3 text-white">{req.unitsNeeded} units</td>
                      <td className="py-3 px-3 text-[#4edea3]">{req.unitsFulfilled} units</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff5451]/20 text-[#ffb3ad]">
                          {req.urgencyLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-xs text-[#dfe2f1]/80">
                        {isFulfilled ? 'Fulfilled & Handover Done' : req.status === 'in_transit' ? 'Courier In Transit' : 'Stock Reserved'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isFulfilled && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onAcceptRequest(req.id);
                                  showToast(`Reserved stock for requisition ${req.requestId}.`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#4cd7f6]/20 text-[#4cd7f6] hover:bg-[#4cd7f6]/30 text-xs font-sans cursor-pointer"
                              >
                                Reserve Stock
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onFulfillRequest(req.id);
                                  showToast(`Marked ${req.requestId} as fulfilled.`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#00a572] text-[#00311f] font-bold text-xs font-sans cursor-pointer"
                              >
                                Fulfill
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedRequestReview(req)}
                            className="px-2.5 py-1 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-sans text-white cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: DONORS & APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-lg font-bold text-white">Donor Intake & Clinical Screening</h2>
              <p className="text-xs text-[#dfe2f1]/60">
                Simulated authorized screening workflow. BloodLink does not medically determine eligibility; final screening occurs at this centre.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#262a35] text-[#dfe2f1]/60 font-mono">
                  <th className="py-2.5 px-3">Donor Name</th>
                  <th className="py-2.5 px-3">Blood Group</th>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Date & Slot</th>
                  <th className="py-2.5 px-3">Pass Ref</th>
                  <th className="py-2.5 px-3">Arrival Status</th>
                  <th className="py-2.5 px-3">Screening Status</th>
                  <th className="py-2.5 px-3">Donation Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a35]/60 font-mono">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#1c1f2a]/60 transition-colors">
                    <td className="py-3 px-3 font-sans font-bold text-white">{apt.donorName}</td>
                    <td className="py-3 px-3 font-bold text-[#ff5451]">{apt.donorBloodGroup}</td>
                    <td className="py-3 px-3 uppercase text-[#dfe2f1]/80">{apt.component}</td>
                    <td className="py-3 px-3 text-white">
                      {apt.date} · {apt.timeSlot}
                    </td>
                    <td className="py-3 px-3 text-[#4cd7f6]">{apt.passRef}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.arrivalStatus === 'arrived'
                            ? 'bg-[#00a572]/20 text-[#4edea3]'
                            : 'bg-[#262a35] text-[#dfe2f1]/70'
                        }`}
                      >
                        {apt.arrivalStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.screeningStatus === 'screened_eligible'
                            ? 'bg-[#00a572]/20 text-[#4edea3]'
                            : 'bg-[#ff5451]/20 text-[#ffb3ad]'
                        }`}
                      >
                        {apt.screeningStatus === 'screened_eligible' ? 'ELIGIBLE' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-white">
                        {apt.donationStatus === 'completed' ? 'Completed & Verified ✓' : apt.donationStatus === 'in_progress' ? 'In Progress' : 'Scheduled'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.arrivalStatus === 'scheduled' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateAppointment(apt.id, { arrivalStatus: 'arrived' });
                              showToast(`Logged arrival for donor ${apt.donorName}.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#262a35] text-white hover:bg-[#313540] text-xs font-sans cursor-pointer"
                          >
                            Mark Arrived
                          </button>
                        )}
                        {apt.screeningStatus === 'pending' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateAppointment(apt.id, { screeningStatus: 'screened_eligible' });
                              showToast(`Clinical vitals verified for ${apt.donorName}.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#4cd7f6]/20 text-[#4cd7f6] hover:bg-[#4cd7f6]/30 text-xs font-sans cursor-pointer"
                          >
                            Screen Eligible
                          </button>
                        )}
                        {apt.donationStatus !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateAppointment(apt.id, {
                                donationStatus: 'completed',
                                isVerified: true,
                              });
                              showToast(`Verified donation recorded for ${apt.donorName}.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#00a572] text-[#00311f] font-bold text-xs font-sans cursor-pointer"
                          >
                            Verify & Record
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: DONATION CAMPS WITH MAP */}
      {activeTab === 'camps' && (() => {
        const campMarkers: MapMarker[] = [
          // Blood Centre Headquarters Marker
          {
            id: 'centre-home',
            lat: centreCoords.lat,
            lng: centreCoords.lng,
            title: centre.name,
            subtitle: `${centreAddress} · Operating Blood Bank HQ & Cold Chain Lab`,
            type: 'centre',
            status: 'stable',
            badge: 'CENTRE HQ',
          },
          // Donation Camps
          ...camps
            .filter((c) => c.lat && c.lng)
            .map((c) => {
              const distFromHQ = calculateHaversineDistance(
                centreCoords.lat,
                centreCoords.lng,
                c.lat!,
                c.lng!
              );
              return {
                id: c.id,
                lat: c.lat!,
                lng: c.lng!,
                title: c.title,
                subtitle: `${c.dateStr} · ${c.timeStr} · ${formatDistance(distFromHQ)} from HQ`,
                type: 'camp' as const,
                badge: c.targetTag,
              };
            }),
        ];

        const campCircles: MapCircle[] = [
          {
            id: 'centre-operational-coverage',
            lat: centreCoords.lat,
            lng: centreCoords.lng,
            radiusMeters: 18000,
            color: '#4cd7f6',
            fillColor: '#4cd7f6',
            fillOpacity: 0.05,
            dashArray: '5, 5',
            label: '18 km Mobile Drive Coverage Radius',
          },
        ];

        return (
          <div className="flex flex-col gap-6">
            <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-lg font-bold text-white">Community Donation Drives</h2>
                <p className="text-xs text-[#dfe2f1]/60">
                  Organize field collection camps within your center's 18 km operational perimeter to replenish municipal reserves.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center bg-[#1c1f2a] p-1 rounded-xl border border-[#262a35]">
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

                <button
                  onClick={() => setIsCampModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs hover:brightness-110 cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>New Drive</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Camps Map */}
              {(campsViewMode === 'both' || campsViewMode === 'map') && (
                <div
                  className={`${
                    campsViewMode === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'
                  } flex flex-col gap-2`}
                >
                  <LeafletMapView
                    center={[centreCoords.lat, centreCoords.lng]}
                    zoom={11}
                    height={campsViewMode === 'map' ? '500px' : '420px'}
                    markers={campMarkers}
                    circles={campCircles}
                    selectedMarkerId={selectedCampId}
                    onSelectMarker={(id) => setSelectedCampId(id)}
                    legend={
                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span> Blood Centre HQ
                        </span>
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ffc107]"></span> Scheduled Drive
                        </span>
                        <span className="text-[#dfe2f1]/50 border-l border-[#262a35] pl-2 hidden sm:inline">
                          18 km Operational Area
                        </span>
                      </div>
                    }
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#dfe2f1]/50 px-1">
                    <span>Operational HQ + Field Collection Drives</span>
                    <span>Click marker to highlight drive card</span>
                  </div>
                </div>
              )}

              {/* Camps Cards List */}
              {(campsViewMode === 'both' || campsViewMode === 'list') && (
                <div
                  className={`${
                    campsViewMode === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'
                  } grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-1`}
                >
                  {camps.map((camp) => {
                    const isSelected = selectedCampId === camp.id;
                    return (
                      <div
                        key={camp.id}
                        onClick={() => setSelectedCampId(camp.id)}
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

                          <div className="mt-3 flex items-center justify-between text-xs font-mono">
                            <span className="text-[#dfe2f1]/60">Registered:</span>
                            <span className="text-[#4edea3] font-bold">
                              {camp.registeredCount} / {camp.goalCount} donors
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#262a35] flex items-center justify-between text-[11px] font-mono text-[#dfe2f1]/50">
                          <span>Operating: {camp.timeStr}</span>
                          {camp.lat && camp.lng && (
                            <a
                              href={getExternalDirectionsUrl(camp.lat, camp.lng)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#4cd7f6] hover:underline flex items-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[13px]">directions</span>
                              <span>Map</span>
                            </a>
                          )}
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

          {/* Create Camp Modal */}
          {isCampModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-md bg-[#171b26] border border-[#262a35] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex items-start justify-between pb-2 border-b border-[#262a35]">
                  <h3 className="font-headline text-base font-bold text-white">
                    Create New Donation Drive
                  </h3>
                  <button
                    onClick={() => setIsCampModalOpen(false)}
                    className="p-1 rounded text-[#dfe2f1]/60 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleCreateCampSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#dfe2f1]/70 font-medium">Drive Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bandra Tech Park Blood Drive"
                      value={newCampTitle}
                      onChange={(e) => setNewCampTitle(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                    />
                  </div>

                  {/* Venue Presets & Coordinate Picker */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-[#dfe2f1]/70 font-medium">Venue Preset</label>
                      <span className="text-[10px] font-mono text-[#4cd7f6]">Auto-Coordinates</span>
                    </div>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'bkc') {
                          setNewCampLocation('BKC Ground Complex, Bandra Kurla Complex');
                          setNewCampLat(19.0600);
                          setNewCampLng(72.8600);
                        } else if (val === 'dadar') {
                          setNewCampLocation('Shivaji Park Gymkhana Ground, Dadar');
                          setNewCampLat(19.0269);
                          setNewCampLng(72.8375);
                        } else if (val === 'andheri') {
                          setNewCampLocation('Andheri Sports Complex, Andheri West');
                          setNewCampLat(19.1305);
                          setNewCampLng(72.8310);
                        } else if (val === 'goregaon') {
                          setNewCampLocation('NESCO Exhibition Ground, Goregaon East');
                          setNewCampLat(19.1528);
                          setNewCampLng(72.8557);
                        } else if (val === 'vashi') {
                          setNewCampLocation('Inorbit Atrium, Sector 30A, Vashi');
                          setNewCampLat(19.0657);
                          setNewCampLng(72.9984);
                        } else if (val === 'thane') {
                          setNewCampLocation('Viviana Ground, Eastern Express Highway, Thane');
                          setNewCampLat(19.2088);
                          setNewCampLng(72.9712);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                    >
                      <option value="bkc">BKC Ground Complex (Bandra Kurla Complex) - 3.2 km</option>
                      <option value="dadar">Shivaji Park Gymkhana (Dadar) - 4.1 km</option>
                      <option value="andheri">Andheri Sports Complex (Andheri West) - 9.1 km</option>
                      <option value="goregaon">NESCO Exhibition Ground (Goregaon East) - 12.4 km</option>
                      <option value="vashi">Inorbit Mall Atrium (Vashi, Navi Mumbai) - 18.2 km</option>
                      <option value="thane">Viviana Mall Ground (Thane) - 23.5 km [Exceeds Limit]</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#dfe2f1]/70 font-medium">Venue Address / Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BKC Ground Complex"
                      value={newCampLocation}
                      onChange={(e) => setNewCampLocation(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                    />
                  </div>

                  {/* Coordinates & Operational Area Verification */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#dfe2f1]/60 font-mono">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        required
                        value={newCampLat}
                        onChange={(e) => setNewCampLat(parseFloat(e.target.value) || 19.0)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono text-white focus:outline-none focus:border-[#4cd7f6]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#dfe2f1]/60 font-mono">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        required
                        value={newCampLng}
                        onChange={(e) => setNewCampLng(parseFloat(e.target.value) || 72.8)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono text-white focus:outline-none focus:border-[#4cd7f6]"
                      />
                    </div>
                  </div>

                  {/* Verification Banner */}
                  {(() => {
                    const dist = calculateHaversineDistance(
                      centreCoords.lat,
                      centreCoords.lng,
                      newCampLat,
                      newCampLng
                    );
                    const isWithinOperationalArea = dist <= 20;

                    return (
                      <div
                        className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                          isWithinOperationalArea
                            ? 'bg-[#00a572]/15 border-[#00a572]/30 text-[#4edea3]'
                            : 'bg-[#ff5451]/15 border-[#ff5451]/30 text-[#ffb3ad]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">
                            {isWithinOperationalArea ? 'check_circle' : 'warning'}
                          </span>
                          <span>
                            {dist} km from HQ ({isWithinOperationalArea ? 'Within 20 km Limit' : 'Exceeds 20 km Area'})
                          </span>
                        </div>
                        <span className="text-[10px] opacity-80">
                          {isWithinOperationalArea ? 'Verified' : 'Flagged'}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#dfe2f1]/70 font-medium">Date</label>
                      <input
                        type="text"
                        required
                        value={newCampDate}
                        onChange={(e) => setNewCampDate(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#dfe2f1]/70 font-medium">Target Units</label>
                      <input
                        type="number"
                        required
                        value={newCampGoal}
                        onChange={(e) => setNewCampGoal(parseInt(e.target.value) || 100)}
                        className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#262a35]">
                    <button
                      type="button"
                      onClick={() => setIsCampModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-[#dfe2f1]/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs"
                    >
                      Publish Camp
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

      {/* VIEW 6: FORECASTS */}
      {activeTab === 'forecasts' && (
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline text-lg font-bold text-white">
                Predictive Demand Forecasting (7-Day Projection)
              </h2>
              <p className="text-xs text-[#dfe2f1]/60">
                Sample projections structured for future Python FastAPI service (XGBoost/ARIMA).
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#4cd7f6] px-2.5 py-1 rounded bg-[#1c1f2a] border border-[#262a35]">
              Sample Model Output
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#262a35] text-[#dfe2f1]/60 font-mono">
                  <th className="py-2.5 px-3">Blood Group</th>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Predicted Demand</th>
                  <th className="py-2.5 px-3">Expected Supply</th>
                  <th className="py-2.5 px-3">Projected Gap</th>
                  <th className="py-2.5 px-3">Shortage Risk</th>
                  <th className="py-2.5 px-3">Suggested Collection Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a35]/60 font-mono">
                {forecasts.map((fc) => (
                  <tr key={fc.bloodGroup} className="hover:bg-[#1c1f2a]/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-white text-sm">{fc.bloodGroup}</td>
                    <td className="py-3 px-3 uppercase text-[#dfe2f1]/80">{fc.component || 'whole'}</td>
                    <td className="py-3 px-3 text-[#ffb3ad] font-bold">{fc.predictedDemand7D}u</td>
                    <td className="py-3 px-3 text-[#4cd7f6]">{fc.expectedSupply7D}u</td>
                    <td className="py-3 px-3">
                      {fc.projectedGap > 0 ? (
                        <span className="text-[#ff5451] font-bold">-{fc.projectedGap}u</span>
                      ) : (
                        <span className="text-[#4edea3]">Covered</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          fc.riskLevel === 'critical'
                            ? 'bg-[#ff5451] text-[#5c0008]'
                            : fc.riskLevel === 'high'
                            ? 'bg-[#ff5451]/20 text-[#ffb3ad]'
                            : 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                        }`}
                      >
                        {fc.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-xs text-[#dfe2f1]/80">
                      {fc.recommendedAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 7: CENTRE PROFILE WITH MAP & LOCATION CONFIGURATION */}
      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#262a35]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[26px]">local_hospital</span>
                </div>
                <div>
                  <h2 className="font-headline text-lg sm:text-xl font-bold text-white">{centre.name}</h2>
                  <span className="text-xs font-mono text-[#4edea3]">Authorized Transfusion Bank</span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-2.5 py-1 rounded bg-[#00a572]/20 text-[#4edea3] text-[10px] font-mono font-bold">
                  LICENSED FDA-MH-2024
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(!isEditingLocation)}
                  className={`px-3 py-1.5 rounded-xl font-headline font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isEditingLocation
                      ? 'bg-[#262a35] text-white hover:bg-[#313540]'
                      : 'bg-[#4cd7f6] text-[#003640] hover:brightness-110'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isEditingLocation ? 'close' : 'edit_location'}
                  </span>
                  <span>{isEditingLocation ? 'Cancel Edit' : 'Edit Location'}</span>
                </button>
              </div>
            </div>

            {/* Centre Location Map */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#dfe2f1]/70">
                <span className="uppercase font-semibold">Registered Facility Coordinates</span>
                <span className="text-white">
                  {centreCoords.lat.toFixed(4)}° N, {centreCoords.lng.toFixed(4)}° E
                </span>
              </div>

              <LeafletMapView
                center={[centreCoords.lat, centreCoords.lng]}
                zoom={14}
                height="320px"
                markers={[
                  {
                    id: 'centre-registered-pin',
                    lat: centreCoords.lat,
                    lng: centreCoords.lng,
                    title: centre.name,
                    subtitle: centreAddress,
                    type: 'centre',
                    status: 'stable',
                    badge: 'REGISTERED',
                    isDraggable: isEditingLocation,
                  },
                ]}
                onMapClick={(lat, lng) => {
                  if (isEditingLocation) {
                    setCentreCoords({ lat, lng });
                  }
                }}
                legend={
                  <div className="text-[11px] text-white">
                    {isEditingLocation ? (
                      <span className="text-[#4cd7f6] font-bold">
                        Click anywhere on map or drag pin to relocate
                      </span>
                    ) : (
                      <span>Registered Facility Pin: {centre.name}</span>
                    )}
                  </div>
                }
              />

              {isEditingLocation && (
                <div className="p-3.5 rounded-xl bg-[#0a0e18] border border-[#4cd7f6]/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                  <div className="text-xs font-mono">
                    <span className="text-[#4cd7f6] font-bold block">Location Editing Active</span>
                    <span className="text-[#dfe2f1]/70 text-[11px]">
                      Lat: {centreCoords.lat.toFixed(5)}, Lng: {centreCoords.lng.toFixed(5)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingLocation(false);
                        showToast('Registered blood centre coordinates saved successfully.');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#00a572] text-[#00311f] font-headline font-bold text-xs hover:brightness-110 cursor-pointer shadow-md w-full sm:w-auto text-center"
                    >
                      Save Registered Location
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
                <span className="text-[#dfe2f1]/50 block">MUNICIPAL ADDRESS</span>
                <span className="text-white font-semibold mt-1 block font-sans">{centreAddress}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
                <span className="text-[#dfe2f1]/50 block">OPERATING HOURS</span>
                <span className="text-white font-semibold mt-1 block">{centre.operatingHours}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
                <span className="text-[#dfe2f1]/50 block">EMERGENCY HELPLINE</span>
                <span className="text-[#4cd7f6] font-bold mt-1 block">{centre.phone}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35]">
                <span className="text-[#dfe2f1]/50 block">TRANSFUSION LICENSE</span>
                <span className="text-white font-semibold mt-1 block">FDA-MH-2024-8841-B</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0a0e18] border border-[#262a35] text-xs">
              <span className="text-[#dfe2f1]/60 block font-mono">SUPPORTED APHERESIS & FRACTIONATION</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Whole Blood', 'Packed Red Blood Cells (PRBC)', 'Platelet Apheresis (SDP/RDP)', 'Fresh Frozen Plasma (FFP)'].map(
                  (comp) => (
                    <span key={comp} className="px-2.5 py-1 rounded-md bg-[#1c1f2a] border border-[#262a35] text-[11px] text-white">
                      ✓ {comp}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {selectedRequestReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#171b26] border border-[#262a35] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#262a35]">
              <div>
                <h3 className="font-headline text-base font-bold text-white">
                  Review Hospital Requisition
                </h3>
                <p className="text-xs text-[#dfe2f1]/60">
                  {selectedRequestReview.requestId} · {selectedRequestReview.hospitalName}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestReview(null)}
                className="p-1 rounded text-[#dfe2f1]/60 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#1c1f2a]">
                <span className="text-[#dfe2f1]/50 block">Blood Group & Component</span>
                <span className="text-white font-bold text-sm">
                  {selectedRequestReview.bloodGroup} ({selectedRequestReview.component.toUpperCase()})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1c1f2a]">
                <span className="text-[#dfe2f1]/50 block">Units Sourced</span>
                <span className="text-[#4cd7f6] font-bold text-sm">
                  {selectedRequestReview.unitsFulfilled}/{selectedRequestReview.unitsNeeded} units
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1c1f2a]">
                <span className="text-[#dfe2f1]/50 block">Required By</span>
                <span className="text-white font-semibold">{selectedRequestReview.requiredBy}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1c1f2a]">
                <span className="text-[#dfe2f1]/50 block">Attending Physician</span>
                <span className="text-white font-semibold">{selectedRequestReview.doctorName}</span>
              </div>
            </div>

            {selectedRequestReview.notes && (
              <div className="p-3 rounded-xl bg-[#0a0e18] text-xs text-[#dfe2f1]/80">
                <span className="text-[#dfe2f1]/50 font-mono block text-[10px]">CLINICAL NOTES</span>
                <p className="mt-0.5">{selectedRequestReview.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#262a35]">
              <button
                type="button"
                onClick={() => setSelectedRequestReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#dfe2f1]/70"
              >
                Close
              </button>
              {selectedRequestReview.status !== 'fulfilled' && (
                <button
                  type="button"
                  onClick={() => {
                    onFulfillRequest(selectedRequestReview.id);
                    setSelectedRequestReview(null);
                    showToast(`Dispatched & fulfilled ${selectedRequestReview.requestId}.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#00a572] text-[#00311f] font-headline font-bold text-xs"
                >
                  Confirm Fulfilment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
