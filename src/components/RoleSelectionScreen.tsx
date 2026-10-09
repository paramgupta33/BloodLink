import React from 'react';
import { UserRole } from '../types/bloodlink';
import { BRAND_LOGO_URL } from '../data/mockData';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
  const roles: {
    id: UserRole;
    title: string;
    subtitle: string;
    icon: string;
    accentColor: string;
    bgAccent: string;
    badge: string;
    description: string;
    features: string[];
  }[] = [
    {
      id: 'hospital',
      title: 'Hospital / Recipient',
      subtitle: 'Request and track blood',
      icon: 'local_hospital',
      accentColor: 'text-[#ff5451]',
      bgAccent: 'bg-[#ff5451]/15',
      badge: 'CLINICAL PORTAL',
      description:
        'Create emergency blood requisitions, inspect nearby centre inventory, and track cold-chain multi-source fulfilment in real time.',
      features: [
        'Emergency Requisition Form',
        'Automated Inventory Pre-Check',
        '7-Stage Bedside Dispatch Tracker',
        'Nearby Blood Depot Discovery',
      ],
    },
    {
      id: 'centre',
      title: 'Authorized Blood Centre',
      subtitle: 'Manage inventory and donations',
      icon: 'bloodtype',
      accentColor: 'text-[#4cd7f6]',
      bgAccent: 'bg-[#4cd7f6]/15',
      badge: 'BANK ADMINISTRATION',
      description:
        'Maintain component reserve levels, accept incoming hospital requests, screen voluntary donors, and review predictive shortage forecasts.',
      features: [
        'Component Inventory Management',
        'Incoming Requisition Triage',
        'Donor Screening & Verification',
        '7-Day ML Shortage Forecasting',
      ],
    },
    {
      id: 'donor',
      title: 'Voluntary Donor',
      subtitle: 'Find where your blood is needed',
      icon: 'volunteer_activism',
      accentColor: 'text-[#4edea3]',
      bgAccent: 'bg-[#4edea3]/15',
      badge: 'VOLUNTEER PORTAL',
      description:
        'Discover nearby authorized centres with critical shortages, register for community collection drives, and view verified lifesaver records.',
      features: [
        'Donate Where It Matters',
        'Radius-Based Centre Matching',
        'Emergency Transfusion Appeals',
        'Verified Non-Monetary Badges',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e18] text-[#dfe2f1] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <img src={BRAND_LOGO_URL} alt="BloodLink" className="h-8 w-auto object-contain" />
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-bold text-xl text-white tracking-tight">
              BloodLink
            </span>
            <span className="hidden sm:inline text-xs font-mono text-[#4cd7f6]">
              Role-Based Coordination System
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#dfe2f1]/50 px-2.5 py-1 rounded-lg bg-[#171b26] border border-[#262a35]">
          Demo Access Mode
        </span>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full my-auto py-8 flex flex-col items-center">
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171b26] border border-[#262a35] text-xs font-mono text-[#4cd7f6] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse"></span>
            <span>Three Dedicated Role-Based Experiences</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Choose Your Operational Portal
          </h1>
          <p className="text-sm text-[#dfe2f1]/70 mt-2">
            Select a role to experience BloodLink's purpose-built interface, workflows, and tailored permissions.
          </p>
        </div>

        {/* 3 Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {roles.map((role) => (
            <div
              key={role.id}
              className="p-6 rounded-2xl bg-[#171b26] border border-[#262a35] hover:border-[#4cd7f6]/50 hover:bg-[#1a1f2c] transition-all flex flex-col justify-between gap-6 shadow-xl group"
            >
              <div className="flex flex-col gap-4">
                {/* Header Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl ${role.bgAccent} ${role.accentColor} flex items-center justify-center font-bold`}
                  >
                    <span className="material-symbols-outlined text-[26px]">
                      {role.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#dfe2f1]/50 border border-[#262a35] px-2 py-0.5 rounded">
                    {role.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="font-headline font-bold text-lg text-white">
                    {role.title}
                  </h3>
                  <p className="text-xs font-mono font-medium text-[#4cd7f6] mt-0.5">
                    "{role.subtitle}"
                  </p>
                  <p className="text-xs text-[#dfe2f1]/70 mt-2 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="pt-2 border-t border-[#262a35]/60 flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-[#dfe2f1]/50 uppercase tracking-wider">
                    Role Capabilities:
                  </span>
                  {role.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-2 text-xs text-[#dfe2f1]/80"
                    >
                      <span className="text-[#4edea3] text-[10px] font-mono">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onSelectRole(role.id)}
                className={`w-full py-2.5 rounded-xl font-headline font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  role.id === 'hospital'
                    ? 'bg-[#ff5451] text-[#5c0008] hover:brightness-110 shadow-md shadow-[#ff5451]/20'
                    : role.id === 'centre'
                    ? 'bg-[#4cd7f6] text-[#003640] hover:brightness-110 shadow-md shadow-[#4cd7f6]/20'
                    : 'bg-[#4edea3] text-[#003824] hover:brightness-110 shadow-md shadow-[#4edea3]/20'
                }`}
              >
                <span>Continue as {role.title.split('/')[0].trim()}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-6xl mx-auto w-full text-center py-4 border-t border-[#262a35]/50 text-xs text-[#dfe2f1]/50 font-mono">
        <span>
          Core Principle: Check existing blood-centre inventory first · Coordinate donors when supply is insufficient · Anticipate future shortages with historical data
        </span>
      </div>
    </div>
  );
};
