import React from 'react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  isRead: boolean;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 w-full max-w-sm bg-[#171b26] border border-[#262a35] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="p-4 border-b border-[#262a35] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff5451] text-[20px]">
            notifications
          </span>
          <span className="font-headline font-bold text-sm text-[#dfe2f1]">
            Live Operational Alerts
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#ff5451]/20 text-[#ffb3ad] font-mono text-[10px] font-bold">
            {notifications.filter((n) => !n.isRead).length} NEW
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] text-[#4cd7f6] hover:underline cursor-pointer"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#e4beba] hover:text-white hover:bg-[#262a35]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#262a35]/40">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#e4beba]/60">
            No active emergency alerts.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 flex items-start gap-3 transition-colors ${
                item.isRead ? 'bg-[#171b26]/50' : 'bg-[#1c1f2a]'
              } hover:bg-[#262a35]/50`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                  item.type === 'critical'
                    ? 'bg-[#ff5451] animate-ping'
                    : item.type === 'warning'
                    ? 'bg-[#4cd7f6]'
                    : 'bg-[#4edea3]'
                }`}
              ></div>
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#dfe2f1]">{item.title}</span>
                  <span className="font-mono text-[10px] text-[#e4beba]/60">{item.time}</span>
                </div>
                <p className="text-xs text-[#e4beba]/80 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
