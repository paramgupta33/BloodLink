import React, { useState } from 'react';
import { BloodGroup, ComponentType, EmergencyRequest, UrgencyLevel, InventoryItem } from '../../types/bloodlink';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: EmergencyRequest) => void;
  inventory: InventoryItem[];
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  inventory,
}) => {
  const [hospitalName, setHospitalName] = useState('Lilavati Hospital & Research Centre');
  const [location, setLocation] = useState('Bandra West, Mumbai');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<ComponentType>('whole');
  const [unitsNeeded, setUnitsNeeded] = useState(3);
  const [urgency, setUrgency] = useState<UrgencyLevel>('immediate');
  const [requiredBy, setRequiredBy] = useState('Within 30 mins (STAT)');
  const [doctorName, setDoctorName] = useState('Dr. A. Kulkarni (Trauma ICU)');

  if (!isOpen) return null;

  // Real-time stock check for the selected blood group and component
  const matchingStockItem = inventory.find(
    (item) => item.bloodGroup === bloodGroup && item.component === component
  ) || inventory.find((item) => item.bloodGroup === bloodGroup);

  const availableUnitsInStock = matchingStockItem ? matchingStockItem.inStockUnits : 0;
  const canPartiallyFulfill = availableUnitsInStock > 0;
  const unitsFromInventory = Math.min(unitsNeeded, Math.max(0, availableUnitsInStock > 5 ? 1 : 0));
  const deficitForDonors = unitsNeeded - unitsFromInventory;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine timeline step:
    // If inventory covers all: step 2 (Inventory Checked & Routing)
    // If deficit triggers donors: step 3 (Donors Notified for remaining requirement)
    const initialStep = deficitForDonors > 0 ? 3 : 2;

    const newReq: EmergencyRequest = {
      id: `req-${Date.now()}`,
      requestId: `#REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalName,
      location,
      bloodGroup,
      component,
      unitsNeeded,
      unitsFulfilled: unitsFromInventory,
      urgency,
      urgencyLabel: urgency === 'immediate' ? 'CRITICAL STAT' : urgency === '2hrs' ? 'HIGH URGENCY' : 'ROUTINE',
      elapsedTime: 'Just now',
      doctorName,
      status: deficitForDonors > 0 ? 'critical' : 'matched',
      timelineStep: initialStep,
      sourceBreakdown: {
        inventoryUnits: unitsFromInventory,
        inventorySource: unitsFromInventory > 0 ? 'Rotary Central Blood Depot' : undefined,
        donorUnits: 0,
        donorNames: [],
      },
      requiredBy,
      eta: unitsFromInventory > 0 ? 'Routing 1 unit from Depot' : 'Searching Donors in 10 km',
    };

    onSubmit(newReq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#171b26] border border-[#262a35] rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#262a35]">
          <div>
            <h3 className="font-headline text-base font-bold text-white">
              Create Emergency Blood Request
            </h3>
            <p className="text-xs text-[#dfe2f1]/60">
              Automated multi-source routing: checks nearby blood centres before donor triage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#dfe2f1]/60 hover:text-white hover:bg-[#262a35]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#dfe2f1]/70 font-medium">Hospital Name</label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#dfe2f1]/70 font-medium">Hospital Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#dfe2f1]/70 font-medium">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono font-bold text-white focus:outline-none focus:border-[#4cd7f6]"
              >
                <option value="O-">O- (Universal Red Cells)</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="A+">A+</option>
                <option value="B-">B-</option>
                <option value="B+">B+</option>
                <option value="AB-">AB-</option>
                <option value="AB+">AB+ (Universal Plasma)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#dfe2f1]/70 font-medium">Component</label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value as ComponentType)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono text-white focus:outline-none focus:border-[#4cd7f6]"
              >
                <option value="whole">Whole Blood</option>
                <option value="prbc">PRBC (Packed Cells)</option>
                <option value="platelets">Platelets (RDP/SDP)</option>
                <option value="plasma">Plasma (FFP)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#dfe2f1]/70 font-medium">Units Needed</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(parseInt(e.target.value) || 1)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs font-mono text-white focus:outline-none focus:border-[#4cd7f6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#dfe2f1]/70 font-medium">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
              >
                <option value="immediate">Immediate / STAT (&lt; 30 mins)</option>
                <option value="2hrs">Within 2 Hours (Urgent)</option>
                <option value="24hrs">Routine (Within 24 Hours)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#dfe2f1]/70 font-medium">Required-by Time</label>
              <input
                type="text"
                required
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#dfe2f1]/70 font-medium">Attending Doctor & Ward</label>
            <input
              type="text"
              required
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#1c1f2a] border border-[#262a35] text-xs text-white focus:outline-none focus:border-[#4cd7f6]"
            />
          </div>

          {/* Automatic Inventory Pre-Check Preview Box */}
          <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-[#262a35] flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[#dfe2f1]/70">Automated Inventory Pre-Check</span>
              <span className="text-[#4cd7f6] font-semibold">
                Available Reserve: {availableUnitsInStock} units
              </span>
            </div>

            <p className="text-[11px] text-[#dfe2f1]/60 leading-relaxed">
              {unitsFromInventory > 0 ? (
                <>
                  Found <strong className="text-white">{unitsFromInventory} unit</strong> in local blood bank reserve. Will route available unit directly and initiate donor matching for remaining{' '}
                  <strong className="text-[#ffb3ad]">{deficitForDonors} units</strong>.
                </>
              ) : (
                <>
                  Local stock is critically constrained ({availableUnitsInStock} units). Request will directly initiate progressive donor matching in a 10 km radius.
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#262a35]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#dfe2f1]/70 hover:bg-[#262a35]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-xs hover:brightness-110 shadow-md cursor-pointer"
            >
              Broadcast Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
