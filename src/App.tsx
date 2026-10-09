/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserRole,
  HospitalTab,
  CentreTab,
  DonorTab,
  EmergencyRequest,
  Donor,
  DonationCamp,
  BloodGroup,
  ComponentType,
  InventoryItem,
  BloodCentre,
  DonationAppointment,
  DonorDonationRecord,
} from './types/bloodlink';
import {
  INITIAL_REQUESTS,
  INITIAL_DONORS,
  INITIAL_INVENTORY,
  INITIAL_CAMPS,
  AUTHORIZED_BLOOD_CENTRES,
  INITIAL_FORECASTS,
  INITIAL_APPOINTMENTS,
  INITIAL_DONOR_HISTORY,
} from './data/mockData';
import { OpeningIntro } from './components/OpeningIntro';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { HospitalDashboard } from './components/roles/HospitalDashboard';
import { BloodCentreDashboard } from './components/roles/BloodCentreDashboard';
import { DonorDashboard } from './components/roles/DonorDashboard';
import { DispatchTrackingModal } from './components/modals/DispatchTrackingModal';
import { NewRequestModal } from './components/modals/NewRequestModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  isRead: boolean;
}

export default function App() {
  // Opening Intro state (shown once on initial load for ~2s)
  const [showIntro, setShowIntro] = useState(true);

  // Active Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('unselected');

  // Role-specific Active Navigation Tabs
  const [hospitalTab, setHospitalTab] = useState<HospitalTab>('overview');
  const [centreTab, setCentreTab] = useState<CentreTab>('overview');
  const [donorTab, setDonorTab] = useState<DonorTab>('home');

  // Unified State Across Roles
  const [requests, setRequests] = useState<EmergencyRequest[]>(INITIAL_REQUESTS);
  const [donors, setDonors] = useState<Donor[]>(INITIAL_DONORS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [centres] = useState<BloodCentre[]>(AUTHORIZED_BLOOD_CENTRES);
  const [camps, setCamps] = useState<DonationCamp[]>(INITIAL_CAMPS);
  const [appointments, setAppointments] = useState<DonationAppointment[]>(INITIAL_APPOINTMENTS);
  const [donationHistory, setDonationHistory] = useState<DonorDonationRecord[]>(INITIAL_DONOR_HISTORY);
  const [forecasts] = useState(INITIAL_FORECASTS);

  // Modals
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedTrackingRequest, setSelectedTrackingRequest] = useState<EmergencyRequest | null>(
    INITIAL_REQUESTS[0]
  );
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Operational Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Critical O- Shortage',
      message: 'Lilavati Hospital requested 3 units of O- Negative (2/3 fulfilled).',
      time: '2m ago',
      type: 'critical',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Cold-Chain En Route',
      message: 'Courier Sunil K. en route to Lilavati Hospital with 1 unit O- (3.4°C safe).',
      time: '6m ago',
      type: 'success',
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'AB- Matched via Reserve',
      message: 'KEM Hospital AB- requirement matched with Red Cross Depot stock reserve.',
      time: '12m ago',
      type: 'info',
      isRead: false,
    },
  ]);

  const addNotification = (
    title: string,
    message: string,
    type: 'critical' | 'warning' | 'success' | 'info' = 'info'
  ) => {
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title,
        message,
        time: 'Just now',
        type,
        isRead: false,
      },
      ...prev,
    ]);
  };

  // --- HOSPITAL WORKFLOW HANDLERS ---
  const handleAddNewRequest = (newReq: EmergencyRequest) => {
    setRequests((prev) => [newReq, ...prev]);
    addNotification(
      `Hospital Requisition #${newReq.requestId}`,
      `${newReq.hospitalName} requested ${newReq.unitsNeeded} units of ${newReq.bloodGroup} (${newReq.component.toUpperCase()}).`,
      'critical'
    );
  };

  const handleAdvanceStep = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const nextStep = Math.min(7, (r.timelineStep || 1) + 1) as any;
          const isNowFulfilled = nextStep === 7;
          const updatedUnits = isNowFulfilled
            ? r.unitsNeeded
            : Math.min(r.unitsNeeded, r.unitsFulfilled + 1);

          return {
            ...r,
            timelineStep: nextStep,
            unitsFulfilled: updatedUnits,
            status: isNowFulfilled ? 'fulfilled' : nextStep >= 3 ? 'in_transit' : 'matched',
            eta: isNowFulfilled ? 'Delivered' : r.eta,
          };
        }
        return r;
      })
    );

    setSelectedTrackingRequest((prev) => {
      if (!prev || prev.id !== requestId) return prev;
      const nextStep = Math.min(7, (prev.timelineStep || 1) + 1) as any;
      const isNowFulfilled = nextStep === 7;
      return {
        ...prev,
        timelineStep: nextStep,
        unitsFulfilled: isNowFulfilled
          ? prev.unitsNeeded
          : Math.min(prev.unitsNeeded, prev.unitsFulfilled + 1),
        status: isNowFulfilled ? 'fulfilled' : nextStep >= 3 ? 'in_transit' : 'matched',
        eta: isNowFulfilled ? 'Delivered' : prev.eta,
      };
    });
  };

  // --- BLOOD CENTRE WORKFLOW HANDLERS ---
  const handleUpdateInventoryUnits = (
    bloodGroup: BloodGroup,
    component: ComponentType,
    delta: number
  ) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.bloodGroup === bloodGroup && item.component === component) {
          const newUnits = Math.max(0, item.inStockUnits + delta);
          let newStatus: 'critical' | 'low' | 'stable' = 'stable';
          if (newUnits < item.targetMinUnits * 0.4) {
            newStatus = 'critical';
          } else if (newUnits < item.targetMinUnits * 0.8) {
            newStatus = 'low';
          }
          return {
            ...item,
            inStockUnits: newUnits,
            status: newStatus,
            lastUpdated: 'Just now',
          };
        }
        return item;
      })
    );
  };

  const handleCentreAcceptRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'matched', timelineStep: 2 } : r))
    );
    addNotification('Stock Reserved', `Blood centre reserved units for #${requestId}.`, 'info');
  };

  const handleCentreFulfillRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              timelineStep: 7,
              unitsFulfilled: r.unitsNeeded,
              status: 'fulfilled',
              eta: 'Delivered',
            }
          : r
      )
    );
    addNotification('Requisition Fulfilled', `Handover verified for #${requestId}.`, 'success');
  };

  const handleUpdateAppointment = (
    appointmentId: string,
    updates: Partial<DonationAppointment>
  ) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, ...updates } : a))
    );

    // If marked completed and verified, increment donor records
    if (updates.donationStatus === 'completed') {
      const apt = appointments.find((a) => a.id === appointmentId);
      if (apt) {
        const newRecord: DonorDonationRecord = {
          id: `rec-${Date.now()}`,
          date: 'Today, Oct 09',
          centreName: apt.centreName,
          bloodGroup: apt.donorBloodGroup,
          component: apt.component,
          units: 1,
          verificationStatus: 'verified',
          certificateCode: `CERT-${Math.floor(1000 + Math.random() * 9000)}-${apt.donorBloodGroup}`,
          medicalOfficer: 'Dr. V. Rao, Transfusion Medicine',
        };
        setDonationHistory((prev) => [newRecord, ...prev]);

        // Increment donor's verified donation count
        setDonors((prev) =>
          prev.map((d) =>
            d.name === apt.donorName
              ? {
                  ...d,
                  verifiedDonationsCount: d.verifiedDonationsCount + 1,
                  daysSinceDonation: 0,
                  lastDonationDate: 'Today, Oct 09',
                }
              : d
          )
        );

        addNotification(
          'Donation Verified & Stock Added',
          `Verified donation recorded for ${apt.donorName}. Certificate issued.`,
          'success'
        );
      }
    }
  };

  const handleCreateCamp = (newCamp: DonationCamp) => {
    setCamps((prev) => [newCamp, ...prev]);
    addNotification('Donation Camp Published', `New field drive "${newCamp.title}" scheduled.`, 'info');
  };

  // --- DONOR WORKFLOW HANDLERS ---
  const handleDonorRegisterInterest = (requestId: string) => {
    addNotification(
      'Donor Interest Registered',
      'You are registered for emergency triage. Please proceed to the designated authorized centre for screening.',
      'success'
    );
  };

  const handleDonorBookAppointment = (newAppointment: DonationAppointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
    addNotification(
      'Appointment Confirmed',
      `Intake slot confirmed at ${newAppointment.centreName} for ${newAppointment.date}.`,
      'success'
    );
  };

  const handleDonorRegisterCamp = (campId: string) => {
    setCamps((prev) =>
      prev.map((c) => (c.id === campId ? { ...c, registeredCount: c.registeredCount + 1 } : c))
    );
    addNotification(
      'Camp Pre-Registration Confirmed',
      'You are registered for the scheduled community collection drive.',
      'success'
    );
  };

  const handleToggleDonorAvailability = () => {
    setDonors((prev) =>
      prev.map((d) => (d.id === donors[0].id ? { ...d, isAvailable: !d.isAvailable } : d))
    );
  };

  // Switch role handler
  const handleSwitchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'hospital') setHospitalTab('overview');
    if (role === 'centre') setCentreTab('overview');
    if (role === 'donor') setDonorTab('home');
  };

  return (
    <div className="min-h-screen bg-[#0f131d] text-[#dfe2f1] flex flex-col font-sans selection:bg-[#ff5451] selection:text-white">
      {/* 1. Opening Intro Screen (Shown once, ~2s) */}
      {showIntro && <OpeningIntro onComplete={() => setShowIntro(false)} />}

      {/* 2. Top Header (Shown once role is selected or available) */}
      {currentRole !== 'unselected' && (
        <Header
          currentRole={currentRole}
          onSwitchRole={handleSwitchRole}
          unreadCount={notifications.filter((n) => !n.isRead).length}
          onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
          onReplayIntro={() => setShowIntro(true)}
          onPrimaryRoleAction={
            currentRole === 'hospital'
              ? () => setHospitalTab('new-request')
              : currentRole === 'donor'
              ? () => setDonorTab('donate-nearby')
              : undefined
          }
        />
      )}

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        }
      />

      {/* Main View Area */}
      <main className={`w-full flex-1 ${currentRole !== 'unselected' ? 'pt-16' : ''}`}>
        {/* If no role is selected, show clean Role Selection Cards */}
        {currentRole === 'unselected' && (
          <RoleSelectionScreen onSelectRole={handleSwitchRole} />
        )}

        {/* ROLE 1: HOSPITAL / RECIPIENT DASHBOARD */}
        {currentRole === 'hospital' && (
          <HospitalDashboard
            requests={requests}
            inventory={inventory}
            centres={centres}
            onOpenNewRequest={() => setIsNewRequestModalOpen(true)}
            onOpenTracking={(req) => {
              setSelectedTrackingRequest(req);
              setIsTrackingModalOpen(true);
            }}
            onSubmitRequest={handleAddNewRequest}
            activeTab={hospitalTab}
            setActiveTab={setHospitalTab}
          />
        )}

        {/* ROLE 2: AUTHORIZED BLOOD CENTRE DASHBOARD */}
        {currentRole === 'centre' && (
          <BloodCentreDashboard
            inventory={inventory}
            requests={requests}
            appointments={appointments}
            camps={camps}
            forecasts={forecasts}
            centre={centres[0]}
            onUpdateInventory={handleUpdateInventoryUnits}
            onAcceptRequest={handleCentreAcceptRequest}
            onFulfillRequest={handleCentreFulfillRequest}
            onUpdateAppointment={handleUpdateAppointment}
            onCreateCamp={handleCreateCamp}
            activeTab={centreTab}
            setActiveTab={setCentreTab}
          />
        )}

        {/* ROLE 3: VOLUNTARY DONOR DASHBOARD */}
        {currentRole === 'donor' && (
          <DonorDashboard
            donor={donors[0]}
            requests={requests}
            centres={centres}
            camps={camps}
            appointments={appointments}
            donationHistory={donationHistory}
            onRegisterInterest={handleDonorRegisterInterest}
            onBookAppointment={handleDonorBookAppointment}
            onRegisterCamp={handleDonorRegisterCamp}
            onToggleAvailability={handleToggleDonorAvailability}
            activeTab={donorTab}
            setActiveTab={setDonorTab}
          />
        )}
      </main>

      {/* Footer (with portal switchers) */}
      <Footer currentRole={currentRole} onSelectRole={handleSwitchRole} />

      {/* Shared Tracking Modal */}
      <DispatchTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        request={selectedTrackingRequest}
        onAdvanceStep={handleAdvanceStep}
      />

      {/* Shared New Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSubmit={handleAddNewRequest}
        inventory={inventory}
      />
    </div>
  );
}
