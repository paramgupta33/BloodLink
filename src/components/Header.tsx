import React, { useState } from 'react';
import { UserRole } from '../types/bloodlink';
import { BRAND_LOGO_URL } from '../data/mockData';

interface HeaderProps {
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  unreadCount: number;
  onToggleNotifications: () => void;
  onReplayIntro?: () => void;
  onPrimaryRoleAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSwitchRole,
  unreadCount,
  onToggleNotifications,
  onReplayIntro,
  onPrimaryRoleAction,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { title: string; badge: string; color: string; icon: string }> = {
    hospital: {
      title: 'Hospital / Recipient',
      badge: 'CLINICAL PORTAL',
      color: 'text-[#ff5451]',
      icon: 'local_hospital',
    },
    centre: {
      title: 'Authorized Blood Centre',
      badge: 'BANK ADMIN',
      color: 'text-[#4cd7f6]',
      icon: 'bloodtype',
    },
    donor: {
      title: 'Voluntary Donor',
      badge: 'VOLUNTEER',
      color: 'text-[#4edea3]',
      icon: 'volunteer_activism',
    },
    unselected: {
      title: 'Select Role',
      badge: 'PORTAL',
      color: 'text-[#dfe2f1]',
      icon: 'tune',
    },
  };

  const activeRoleInfo = roleLabels[currentRole] || roleLabels.unselected;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0f131d]/95 backdrop-blur-md border-b border-[#262a35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSwitchRole('unselected')}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
            title="Go to Role Selection"
          >
            <img
              alt="BloodLink"
              className="h-7 w-auto object-contain"
              src={BRAND_LOGO_URL}
            />
            <span className="font-headline font-bold text-lg text-white tracking-tight">
              BloodLink
            </span>
          </button>
        </div>

        {/* Center: Role Switcher Control */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171b26] border border-[#262a35] hover:border-[#4cd7f6]/50 transition-all text-xs cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">
              {activeRoleInfo.icon}
            </span>
            <span className="text-[#dfe2f1]/60 font-mono hidden sm:inline">Role:</span>
            <span className="font-headline font-bold text-white truncate max-w-[140px] sm:max-w-none">
              {activeRoleInfo.title}
            </span>
            <span
              className={`hidden md:inline text-[9px] font-mono px-1.5 py-0.2 rounded border border-[#262a35] ${activeRoleInfo.color}`}
            >
              {activeRoleInfo.badge}
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#dfe2f1]/50 ml-0.5">
              arrow_drop_down
            </span>
          </button>

          {/* Role Dropdown Menu */}
          {roleDropdownOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#171b26] border border-[#262a35] rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[10px] font-mono text-[#dfe2f1]/50 border-b border-[#262a35]">
                SWITCH DEMONSTRATION PORTAL
              </div>

              {[
                {
                  id: 'hospital' as UserRole,
                  title: 'Hospital / Recipient',
                  desc: 'Request & track blood',
                  icon: 'local_hospital',
                  color: 'text-[#ff5451]',
                },
                {
                  id: 'centre' as UserRole,
                  title: 'Authorized Blood Centre',
                  desc: 'Manage inventory & verify',
                  icon: 'bloodtype',
                  color: 'text-[#4cd7f6]',
                },
                {
                  id: 'donor' as UserRole,
                  title: 'Voluntary Donor',
                  desc: 'Donate where it matters',
                  icon: 'volunteer_activism',
                  color: 'text-[#4edea3]',
                },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onSwitchRole(r.id);
                    setRoleDropdownOpen(false);
                  }}
                  className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    currentRole === r.id
                      ? 'bg-[#262a35] text-white font-bold'
                      : 'text-[#dfe2f1]/80 hover:bg-[#262a35]/40 hover:text-white'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${r.color} mt-0.5`}>
                    {r.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-headline font-semibold">{r.title}</span>
                    <span className="text-[10px] text-[#dfe2f1]/50">{r.desc}</span>
                  </div>
                </button>
              ))}

              <div className="pt-1 border-t border-[#262a35]">
                <button
                  onClick={() => {
                    onSwitchRole('unselected');
                    setRoleDropdownOpen(false);
                  }}
                  className="w-full text-center py-1.5 rounded-lg text-[11px] font-mono text-[#4cd7f6] hover:bg-[#262a35]/40 cursor-pointer"
                >
                  All Roles Selection Screen →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Notifications Toggle */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-xl bg-[#171b26] hover:bg-[#262a35] text-[#dfe2f1]/80 hover:text-white transition-colors border border-[#262a35] cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff5451]"></span>
            )}
          </button>

          {/* Primary Role Action Button */}
          {onPrimaryRoleAction && currentRole === 'hospital' && (
            <button
              onClick={onPrimaryRoleAction}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ff5451] text-[#5c0008] font-headline font-bold text-xs hover:brightness-110 shadow-md shadow-[#ff5451]/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span className="hidden sm:inline">Request Blood</span>
              <span className="sm:hidden">Request</span>
            </button>
          )}

          {onPrimaryRoleAction && currentRole === 'donor' && (
            <button
              onClick={onPrimaryRoleAction}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs hover:brightness-110 shadow-md shadow-[#4cd7f6]/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
              <span className="hidden sm:inline">Donate Nearby</span>
              <span className="sm:hidden">Donate</span>
            </button>
          )}

          {/* Replay Intro */}
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="hidden lg:flex p-2 rounded-xl bg-[#171b26] hover:bg-[#262a35] text-[#dfe2f1]/50 hover:text-white transition-colors border border-[#262a35] cursor-pointer"
              title="Replay BloodLink Intro"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
