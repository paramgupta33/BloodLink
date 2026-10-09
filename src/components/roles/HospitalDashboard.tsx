import React, { useState } from 'react';
import {
  EmergencyRequest,
  InventoryItem,
  BloodCentre,
  BloodGroup,
  ComponentType,
  UrgencyLevel,
  HospitalTab,
} from '../../types/bloodlink';
import { MAP_MUMBAI_URL } from '../../data/mockData';
import { LeafletMapView, MapMarker } from '../maps/LeafletMapView';
import {
  calculateHaversineDistance,
  formatDistance,
  getExternalDirectionsUrl,
  PRESET_MUMBAI_AREAS,
} from '../../utils/geoUtils';

interface HospitalDashboardProps {
  requests: EmergencyRequest[];
  inventory: InventoryItem[];
  centres: BloodCentre[];
  onOpenNewRequest: () => void;
  onOpenTracking: (req: EmergencyRequest) => void;
  onSubmitRequest: (newReq: EmergencyRequest) => void;
  activeTab: HospitalTab;
  setActiveTab: (tab: HospitalTab) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  requests,
  inventory,
  centres,
  onOpenNewRequest,
  onOpenTracking,
  onSubmitRequest,
  activeTab,
  setActiveTab,
}) => {
  // New Request Form State (for inline tab)
  const [formHospital, setFormHospital] = useState('Lilavati Hospital & Research Centre');
  const [formLocation, setFormLocation] = useState('Bandra West, Mumbai');
  const [formBloodGroup, setFormBloodGroup] = useState<BloodGroup>('O-');
  const [formComponent, setFormComponent] = useState<ComponentType>('whole');
  const [formUnits, setFormUnits] = useState(3);
  const [formUrgency, setFormUrgency] = useState<UrgencyLevel>('immediate');
  const [formRequiredBy, setFormRequiredBy] = useState('Within 30 mins (Critical STAT)');
  const [formDoctor, setFormDoctor] = useState('Dr. A. Kulkarni (Trauma ICU)');
  const [formNotes, setFormNotes] = useState('Accident trauma patient, emergency transfusion required.');
  const [formSubmittedSuccess, setFormSubmittedSuccess] = useState(false);

  // Expanded map toggle
  const [showExpandedMap, setShowExpandedMap] = useState(false);

  // Selected blood centre for quick stock preview
  const [selectedCentreModal, setSelectedCentreModal] = useState<BloodCentre | null>(null);

  // Map state for Nearby Centres
  const [selectedMapCentreId, setSelectedMapCentreId] = useState<string | null>(null);
  const [targetBloodGroupFilter, setTargetBloodGroupFilter] = useState<BloodGroup>('O-');
  const [centresViewMode, setCentresViewMode] = useState<'both' | 'map' | 'list'>('both');
  const [hospitalLocation, setHospitalLocation] = useState({
    name: 'Lilavati Hospital & Research Centre',
    lat: 19.0519,
    lng: 72.8295,
  });

  // Metrics calculation
  const activeRequests = requests.filter((r) => r.status !== 'fulfilled');
  const fulfilledRequests = requests.filter((r) => r.status === 'fulfilled');
  const totalUnitsFulfilled = requests.reduce((sum, r) => sum + r.unitsFulfilled, 0);
  const totalUnitsRequested = requests.reduce((sum, r) => sum + r.unitsNeeded, 0);
  const awaitingRequests = requests.filter(
    (r) => r.status !== 'fulfilled' && r.unitsFulfilled < r.unitsNeeded
  );
  const criticalRequests = requests.filter(
    (r) => r.urgency === 'immediate' && r.status !== 'fulfilled'
  );

  // Filter requests for hospital
  const hospitalRequests = requests;

  // Handle New Request Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check relevant blood-centre inventory first
    const stockItem = inventory.find(
      (item) => item.bloodGroup === formBloodGroup && item.component === formComponent
    ) || inventory.find((item) => item.bloodGroup === formBloodGroup);

    const availableReserve = stockItem ? stockItem.inStockUnits : 0;
    // Suitable existing stock allocated first
    const unitsFromStock = Math.min(formUnits, availableReserve > 5 ? 1 : 0);
    const remainingForDonors = formUnits - unitsFromStock;

    const newReq: EmergencyRequest = {
      id: `req-${Date.now()}`,
      requestId: `#REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalName: formHospital,
      location: formLocation,
      bloodGroup: formBloodGroup,
      component: formComponent,
      unitsNeeded: formUnits,
      unitsFulfilled: unitsFromStock,
      urgency: formUrgency,
      urgencyLabel:
        formUrgency === 'immediate'
          ? 'Critical'
          : formUrgency === '2hrs'
          ? 'Urgent'
          : 'Scheduled',
      elapsedTime: 'Just now',
      doctorName: formDoctor,
      status: remainingForDonors > 0 ? 'critical' : 'matched',
      timelineStep: remainingForDonors > 0 ? 3 : 2,
      sourceBreakdown: {
        inventoryUnits: unitsFromStock,
        inventorySource: unitsFromStock > 0 ? 'Rotary Blood Bank Reserve' : undefined,
        donorUnits: 0,
        donorNames: [],
      },
      requiredBy: formRequiredBy,
      notes: formNotes,
      eta: unitsFromStock > 0 ? 'Routing from Depot (14 mins)' : 'Searching Donors in 10 km',
    };

    onSubmitRequest(newReq);
    setFormSubmittedSuccess(true);
    setTimeout(() => {
      setFormSubmittedSuccess(false);
      setActiveTab('my-requests');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Hospital Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262a35] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'overview' as HospitalTab, label: 'Overview', icon: 'dashboard' },
            { id: 'new-request' as HospitalTab, label: 'New Request', icon: 'add_circle' },
            { id: 'my-requests' as HospitalTab, label: 'My Requests', icon: 'emergency' },
            { id: 'nearby-centres' as HospitalTab, label: 'Nearby Blood Centres', icon: 'local_hospital' },
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

        {activeTab !== 'new-request' && (
          <button
            onClick={() => setActiveTab('new-request')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-xs hover:brightness-110 shadow-md cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Emergency Request</span>
          </button>
        )}
      </div>

      {/* VIEW 1: HOSPITAL OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35]">
              <span className="text-xs font-medium text-[#dfe2f1]/60">Active Requests</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-headline text-3xl font-bold text-white tabular-nums">
                  {activeRequests.length}
                </span>
                <span className="text-xs text-[#4cd7f6] font-mono">in progress</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35]">
              <span className="text-xs font-medium text-[#dfe2f1]/60">Units Fulfilled</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-headline text-3xl font-bold text-[#4edea3] tabular-nums">
                  {totalUnitsFulfilled}/{totalUnitsRequested}
                </span>
                <span className="text-xs text-[#dfe2f1]/60 font-mono">
                  {Math.round((totalUnitsFulfilled / (totalUnitsRequested || 1)) * 100)}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#171b26] border border-[#262a35]">
              <span className="text-xs font-medium text-[#dfe2f1]/60">Awaiting Fulfilment</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-headline text-3xl font-bold text-[#ffb3ad] tabular-nums">
                  {awaitingRequests.length}
                </span>
                <span className="text-xs text-[#dfe2f1]/60 font-mono">requests</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#171b26] border border-[#ff5451]/40">
              <span className="text-xs font-medium text-[#ffb3ad]">Critical Requests</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="font-headline text-3xl font-bold text-[#ff5451] tabular-nums">
                  {criticalRequests.length}
                </span>
                <span className="text-xs text-[#ff5451] font-mono">Immediate STAT</span>
              </div>
            </div>
          </div>

          {/* Active Requests Table */}
          <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-white">Active Blood Requests</h3>
                <p className="text-xs text-[#dfe2f1]/60">
                  Track hospital requisitions, inventory allocations, and courier progress.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('my-requests')}
                className="text-xs text-[#4cd7f6] hover:underline cursor-pointer font-mono"
              >
                View all ({hospitalRequests.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#262a35] text-[#dfe2f1]/60 font-mono">
                    <th className="py-2.5 px-3">Request ID</th>
                    <th className="py-2.5 px-3">Blood Group</th>
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3">Units Progress</th>
                    <th className="py-2.5 px-3">Urgency</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a35]/60">
                  {hospitalRequests.slice(0, 4).map((req) => {
                    const isFulfilled = req.status === 'fulfilled';
                    const isCritical = req.urgency === 'immediate' && !isFulfilled;
                    const pct = Math.round((req.unitsFulfilled / req.unitsNeeded) * 100);

                    return (
                      <tr key={req.id} className="hover:bg-[#1c1f2a]/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {req.requestId}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isCritical ? 'text-[#ff5451]' : 'text-[#4cd7f6]'
                            }`}
                          >
                            {req.bloodGroup}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono uppercase text-[#dfe2f1]/80">
                          {req.component}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white tabular-nums">
                              {req.unitsFulfilled}/{req.unitsNeeded} units
                            </span>
                            <div className="w-16 bg-[#262a35] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  isFulfilled
                                    ? 'bg-[#00a572]'
                                    : isCritical
                                    ? 'bg-[#ff5451]'
                                    : 'bg-[#4cd7f6]'
                                }`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-[#dfe2f1]/50 font-mono">
                              ({pct}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isCritical
                                ? 'bg-[#ff5451]/20 text-[#ffb3ad]'
                                : req.urgency === '2hrs'
                                ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                                : 'bg-[#262a35] text-[#dfe2f1]/70'
                            }`}
                          >
                            {req.urgencyLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs text-white">
                            {isFulfilled ? 'Fulfilled' : req.eta || 'Searching'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenTracking(req)}
                            className="px-3 py-1 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nearby Blood Centres Summary */}
          <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-white">Nearby Authorized Blood Centres</h3>
                <p className="text-xs text-[#dfe2f1]/60">
                  Municipal storage depots and transfusion banks serving your hospital zone.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpandedMap(!showExpandedMap)}
                  className="px-3 py-1 rounded-lg bg-[#1c1f2a] border border-[#262a35] text-xs text-[#4cd7f6] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showExpandedMap ? 'map' : 'explore'}
                  </span>
                  <span>{showExpandedMap ? 'Hide Map' : 'Show Metro Map'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('nearby-centres')}
                  className="text-xs text-[#4cd7f6] hover:underline cursor-pointer font-mono"
                >
                  View All ({centres.length}) →
                </button>
              </div>
            </div>

            {/* Optional Map Preview if toggled */}
            {showExpandedMap && (
              <div className="relative w-full h-56 bg-[#0a0e18] rounded-xl border border-[#262a35] overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
                  style={{ backgroundImage: `url('${MAP_MUMBAI_URL}')` }}
                ></div>
                <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
                  <span className="text-[11px] font-mono text-[#dfe2f1]/60 bg-black/60 px-2 py-0.5 rounded self-start">
                    Simulated Metro Depot Network
                  </span>
                </div>
              </div>
            )}

            {/* Centres List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {centres.slice(0, 3).map((centre) => {
                const oNegStock = centre.stockByGroup['O-']?.units || 0;
                const isShort = oNegStock < 5;

                return (
                  <div
                    key={centre.id}
                    className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="font-headline font-bold text-xs text-white">
                          {centre.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#4cd7f6]">
                          {centre.distanceKm} km
                        </span>
                      </div>
                      <p className="text-[11px] text-[#dfe2f1]/60 mt-0.5 truncate">
                        {centre.address}
                      </p>

                      <div className="mt-2.5 p-2 rounded-lg bg-[#0a0e18] flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#dfe2f1]/60">O- Reserve:</span>
                        <span className={isShort ? 'text-[#ff5451] font-bold' : 'text-[#4edea3] font-bold'}>
                          {oNegStock} units {isShort ? '(Low)' : '(Available)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                      <span className="text-[#dfe2f1]/50">{centre.phone}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCentreModal(centre)}
                        className="text-[#4cd7f6] hover:underline cursor-pointer"
                      >
                        View Stock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: NEW EMERGENCY REQUEST */}
      {activeTab === 'new-request' && (
        <div className="max-w-2xl mx-auto w-full p-6 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5451]"></span>
              <span className="font-mono text-[11px] font-semibold text-[#ffb3ad] uppercase">
                Hospital Emergency Requisition
              </span>
            </div>
            <h2 className="font-headline text-xl font-bold text-white mt-1">
              Create Emergency Blood Request
            </h2>
            <p className="text-xs text-[#dfe2f1]/60 mt-0.5">
              Automated multi-source routing: checks nearby blood centres before donor triage.
            </p>
          </div>

          {formSubmittedSuccess ? (
            <div className="p-6 rounded-xl bg-[#00a572]/20 border border-[#00a572]/40 text-center flex flex-col items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[36px] text-[#4edea3]">
                check_circle
              </span>
              <span className="font-headline font-bold text-base text-white">
                Request Broadcasted Successfully!
              </span>
              <p className="text-xs text-[#dfe2f1]/70">
                Checking local depots and routing available units...
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#dfe2f1]/70 font-medium">Hospital Name</label>
                  <input
                    type="text"
                    required
                    value={formHospital}
                    onChange={(e) => setFormHospital(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#dfe2f1]/70 font-medium">Hospital Ward / Location</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#dfe2f1]/70 font-medium">Blood Group</label>
                  <select
                    value={formBloodGroup}
                    onChange={(e) => setFormBloodGroup(e.target.value as BloodGroup)}
                    className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono font-bold text-white focus:outline-none focus:border-[#4cd7f6]"
                  >
                    <option value="O-">O-</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="A+">A+</option>
                    <option value="B-">B-</option>
                    <option value="B+">B+</option>
                    <option value="AB-">AB-</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#dfe2f1]/70 font-medium">Component</label>
                  <select
                    value={formComponent}
                    onChange={(e) => setFormComponent(e.target.value as ComponentType)}
                    className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono text-white focus:outline-none focus:border-[#4cd7f6]"
                  >
                    <option value="whole">Whole Blood</option>
                    <option value="prbc">PRBC</option>
                    <option value="platelets">Platelets</option>
                    <option value="plasma">Plasma</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#dfe2f1]/70 font-medium">Units Needed</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={formUnits}
                    onChange={(e) => setFormUnits(parseInt(e.target.value) || 1)}
                    className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono text-white focus:outline-none focus:border-[#4cd7f6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#dfe2f1]/70 font-medium">Urgency Level</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as UrgencyLevel)}
                    className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                  >
                    <option value="immediate">Critical (&lt; 30 mins)</option>
                    <option value="2hrs">Urgent (Within 2 Hours)</option>
                    <option value="24hrs">Scheduled (Routine)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#dfe2f1]/70 font-medium">Required-by Time</label>
                  <input
                    type="text"
                    required
                    value={formRequiredBy}
                    onChange={(e) => setFormRequiredBy(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#dfe2f1]/70 font-medium">Attending Physician</label>
                <input
                  type="text"
                  required
                  value={formDoctor}
                  onChange={(e) => setFormDoctor(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#dfe2f1]/70 font-medium">Optional Clinical Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                ></textarea>
              </div>

              {/* Automated Pre-check Box */}
              <div className="p-3 rounded-xl bg-[#0a0e18] border border-[#262a35] text-xs flex flex-col gap-1">
                <span className="font-mono text-[10px] text-[#4cd7f6] uppercase">
                  Automated Blood-Centre Inventory Check
                </span>
                <p className="text-[11px] text-[#dfe2f1]/70">
                  On submit, BloodLink checks available reserves across 5 authorized centres. If stock is insufficient, nearby verified voluntary donors are automatically triaged.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#262a35]">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#dfe2f1]/70 hover:bg-[#262a35]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-xs hover:brightness-110 shadow-md cursor-pointer"
                >
                  Broadcast Requisition
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* VIEW 3: MY REQUESTS (FULL TABLE) */}
      {activeTab === 'my-requests' && (
        <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-lg font-bold text-white">All Hospital Blood Requisitions</h2>
              <p className="text-xs text-[#dfe2f1]/60">
                Complete requisition history with live multi-source tracking.
              </p>
            </div>
            <span className="text-xs font-mono text-[#dfe2f1]/60">
              Total: {hospitalRequests.length} requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#262a35] text-[#dfe2f1]/60 font-mono">
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Hospital / Ward</th>
                  <th className="py-2.5 px-3">Blood Group</th>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Fulfilled / Requested</th>
                  <th className="py-2.5 px-3">Urgency</th>
                  <th className="py-2.5 px-3">Status / ETA</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a35]/60 font-mono">
                {hospitalRequests.map((req) => {
                  const isFulfilled = req.status === 'fulfilled';
                  const isCritical = req.urgency === 'immediate' && !isFulfilled;
                  const pct = Math.round((req.unitsFulfilled / req.unitsNeeded) * 100);

                  return (
                    <tr key={req.id} className="hover:bg-[#1c1f2a]/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{req.requestId}</td>
                      <td className="py-3 px-3 font-sans text-white">{req.hospitalName}</td>
                      <td className="py-3 px-3 font-bold text-sm">
                        <span className={isCritical ? 'text-[#ff5451]' : 'text-[#4cd7f6]'}>
                          {req.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[#dfe2f1]/80">{req.component}</td>
                      <td className="py-3 px-3">
                        <span className="text-white font-bold">
                          {req.unitsFulfilled}/{req.unitsNeeded} units ({pct}%)
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCritical
                              ? 'bg-[#ff5451]/20 text-[#ffb3ad]'
                              : req.urgency === '2hrs'
                              ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                              : 'bg-[#262a35] text-[#dfe2f1]/70'
                          }`}
                        >
                          {req.urgencyLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-xs text-[#dfe2f1]/80">
                        {isFulfilled ? 'Fulfilled' : req.eta || 'Searching'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenTracking(req)}
                          className="px-3 py-1 rounded-lg bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors cursor-pointer"
                        >
                          View Tracker
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: NEARBY BLOOD CENTRES */}
      {activeTab === 'nearby-centres' && (() => {
        // Compute Haversine distances from hospital location
        const centresWithDistance = centres.map((centre) => {
          const distance =
            centre.lat && centre.lng
              ? calculateHaversineDistance(
                  hospitalLocation.lat,
                  hospitalLocation.lng,
                  centre.lat,
                  centre.lng
                )
              : centre.distanceKm;
          return { ...centre, calculatedDistance: distance };
        });

        // Generate Leaflet Markers
        const mapMarkers: MapMarker[] = [
          // Hospital Marker
          {
            id: 'hospital-origin',
            lat: hospitalLocation.lat,
            lng: hospitalLocation.lng,
            title: hospitalLocation.name,
            subtitle: 'Hospital Origin (Request Location)',
            type: 'hospital',
            status: 'critical',
            badge: 'HOSPITAL',
          },
          // Centre Markers
          ...centresWithDistance
            .filter((c) => c.lat && c.lng)
            .map((c) => {
              const stock = c.stockByGroup[targetBloodGroupFilter] || {
                units: 0,
                status: 'stable',
              };
              return {
                id: c.id,
                lat: c.lat!,
                lng: c.lng!,
                title: c.name,
                subtitle: `${c.calculatedDistance} km away · ${stock.units}u of ${targetBloodGroupFilter}`,
                type: 'centre' as const,
                status: stock.status,
                badge: `${stock.units}u`,
              };
            }),
        ];

        return (
          <div className="flex flex-col gap-5">
            {/* Control Bar: View Toggle, Blood Group Filter, Hospital Preset */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
                    <span className="font-mono text-[11px] font-semibold text-[#4cd7f6] uppercase tracking-wider">
                      Municipal Transfusion Grid
                    </span>
                  </div>
                  <h2 className="font-headline text-lg sm:text-xl font-bold text-white mt-0.5">
                    Nearby Authorized Blood Centres
                  </h2>
                  <p className="text-xs text-[#dfe2f1]/60">
                    Showing certified transfusion reserves relative to{' '}
                    <strong className="text-white">{hospitalLocation.name}</strong>.
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 self-start lg:self-auto">
                  <div className="flex items-center bg-[#1c1f2a] p-1 rounded-xl border border-[#262a35]">
                    {(['both', 'map', 'list'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCentresViewMode(mode)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium capitalize transition-colors cursor-pointer ${
                          centresViewMode === mode
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

              {/* Filters: Inspect Blood Group & Origin Hospital */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-[#262a35] items-center">
                {/* Blood Group Switcher */}
                <div className="md:col-span-7 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-mono text-[#dfe2f1]/70 whitespace-nowrap">
                    Inspect Group:
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setTargetBloodGroupFilter(bg)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          targetBloodGroupFilter === bg
                            ? 'bg-[#ff5451] text-[#5c0008] shadow-sm'
                            : 'bg-[#1c1f2a] text-[#dfe2f1]/70 hover:bg-[#262a35] border border-[#262a35]'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hospital Origin Switcher */}
                <div className="md:col-span-5 flex items-center justify-end gap-2 text-xs font-mono text-[#dfe2f1]/60">
                  <span className="hidden sm:inline">Hospital:</span>
                  <select
                    value={hospitalLocation.name}
                    onChange={(e) => {
                      const selected = PRESET_MUMBAI_AREAS.find((p) => p.name.includes(e.target.value.slice(0, 7)));
                      if (selected) {
                        setHospitalLocation({
                          name: selected.name,
                          lat: selected.lat,
                          lng: selected.lng,
                        });
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
                  >
                    <option value="Lilavati Hospital & Research Centre">Lilavati Hospital (Bandra)</option>
                    <option value="KEM Hospital Emergency Ward">KEM Hospital (Parel)</option>
                    <option value="Rajiv Gandhi Super-Speciality Hospital">Rajiv Gandhi Hospital (Andheri)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Split Content: Interactive Leaflet Map + Centres List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left/Top: Interactive Map */}
              {(centresViewMode === 'both' || centresViewMode === 'map') && (
                <div
                  className={`${
                    centresViewMode === 'both' ? 'lg:col-span-7' : 'lg:col-span-12'
                  } flex flex-col gap-2`}
                >
                  <LeafletMapView
                    center={[hospitalLocation.lat, hospitalLocation.lng]}
                    zoom={12}
                    height={centresViewMode === 'map' ? '540px' : '440px'}
                    markers={mapMarkers}
                    selectedMarkerId={selectedMapCentreId}
                    onSelectMarker={(id) => {
                      if (id !== 'hospital-origin') {
                        setSelectedMapCentreId(id);
                      }
                    }}
                    legend={
                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5451]"></span> Hospital Origin
                        </span>
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5451]"></span> Critical Need (&lt;5u)
                        </span>
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]"></span> Low Stock
                        </span>
                        <span className="flex items-center gap-1.5 text-white">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span> Adequate Stock
                        </span>
                      </div>
                    }
                  />

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#dfe2f1]/50 px-1">
                    <span>Distances: Straight-line (Haversine formula)</span>
                    <span>Click marker to focus depot</span>
                  </div>
                </div>
              )}

              {/* Right/Bottom: Synchronized Centres List */}
              {(centresViewMode === 'both' || centresViewMode === 'list') && (
                <div
                  className={`${
                    centresViewMode === 'both' ? 'lg:col-span-5' : 'lg:col-span-12'
                  } flex flex-col gap-3.5 max-h-[580px] overflow-y-auto pr-1`}
                >
                  {centresWithDistance.map((centre) => {
                    const isSelected = selectedMapCentreId === centre.id;
                    const stock = centre.stockByGroup[targetBloodGroupFilter] || {
                      units: 0,
                      status: 'stable',
                    };
                    const isCrit = stock.status === 'critical';
                    const isLow = stock.status === 'low';

                    return (
                      <div
                        key={centre.id}
                        onClick={() => setSelectedMapCentreId(centre.id)}
                        className={`p-4 rounded-xl bg-[#1c1f2a] border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'border-[#4cd7f6] ring-1 ring-[#4cd7f6] shadow-lg shadow-[#4cd7f6]/10'
                            : isCrit
                            ? 'border-[#ff5451]/40 hover:border-[#ff5451]'
                            : 'border-[#262a35] hover:border-[#353944]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="font-headline font-bold text-sm text-white">
                              {centre.name}
                            </span>
                            <span className="text-xs font-mono text-[#4cd7f6] font-bold">
                              {formatDistance(centre.calculatedDistance)}
                            </span>
                          </div>
                          <p className="text-xs text-[#dfe2f1]/60 mt-0.5">{centre.address}</p>

                          {/* Quick Stock Indicator for Selected Blood Group */}
                          <div className="mt-3 p-2.5 rounded-lg bg-[#0a0e18] border border-[#262a35] flex items-center justify-between font-mono text-xs">
                            <span className="text-[#dfe2f1]/70">
                              {targetBloodGroupFilter} Reserve:
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  isCrit ? 'text-[#ff5451]' : isLow ? 'text-[#4cd7f6]' : 'text-[#4edea3]'
                                }`}
                              >
                                {stock.units} units
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  isCrit
                                    ? 'bg-[#ff5451]/20 text-[#ffb3ad]'
                                    : isLow
                                    ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                                    : 'bg-[#00a572]/20 text-[#4edea3]'
                                }`}
                              >
                                {isCrit ? 'CRITICAL' : isLow ? 'LOW' : 'STABLE'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#262a35] text-xs font-mono">
                          <span className="text-[#dfe2f1]/50">{centre.operatingHours}</span>
                          <div className="flex items-center gap-2">
                            {centre.lat && centre.lng && (
                              <a
                                href={getExternalDirectionsUrl(
                                  centre.lat,
                                  centre.lng,
                                  hospitalLocation.lat,
                                  hospitalLocation.lng
                                )}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#dfe2f1]/60 hover:text-white flex items-center gap-0.5 text-[11px]"
                                title="Open routing directions in OpenStreetMap"
                              >
                                <span className="material-symbols-outlined text-[14px]">directions</span>
                                <span>Directions</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCentreModal(centre);
                              }}
                              className="text-[#4cd7f6] hover:underline cursor-pointer"
                            >
                              All Stock
                            </button>
                          </div>
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

      {/* Simple Stock Details Modal for Blood Centre */}
      {selectedCentreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#171b26] border border-[#262a35] rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#262a35]">
              <div>
                <h3 className="font-headline text-base font-bold text-white">
                  {selectedCentreModal.name}
                </h3>
                <p className="text-xs text-[#dfe2f1]/60">{selectedCentreModal.address}</p>
              </div>
              <button
                onClick={() => setSelectedCentreModal(null)}
                className="p-1 rounded-lg text-[#dfe2f1]/60 hover:text-white hover:bg-[#262a35]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => {
                const info = selectedCentreModal.stockByGroup[bg];
                const units = info?.units || 0;
                const isShort = units < 5;

                return (
                  <div key={bg} className="p-2 rounded-lg bg-[#1c1f2a] border border-[#262a35]">
                    <span className="text-white font-bold block">{bg}</span>
                    <span className={isShort ? 'text-[#ff5451] font-bold text-sm' : 'text-[#4edea3] text-sm'}>
                      {units}u
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-[#dfe2f1]/60 font-mono">
              Direct Phone: <strong className="text-white">{selectedCentreModal.phone}</strong>
            </div>

            <button
              onClick={() => setSelectedCentreModal(null)}
              className="w-full py-2 rounded-xl bg-[#262a35] hover:bg-[#313540] text-xs font-medium text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
