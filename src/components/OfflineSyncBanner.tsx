import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, RefreshCw, Signal } from 'lucide-react';

interface OfflineSyncBannerProps {
  onlineStatus: ReturnType<typeof useOnlineStatus>;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({ onlineStatus }) => {
  const { isOnline, simulatedOffline, toggleSimulatedOffline, offlineQueue } = onlineStatus;

  return (
    <div className="bg-slate-100 border-b border-slate-200 text-xs py-1.5 px-4 text-slate-700">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Tsirang HQ Network Online</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-800 font-semibold">
              <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-600" />
              <span>Offline Mode (Remote Gewog Low-Connectivity)</span>
            </span>
          )}

          {offlineQueue.length > 0 && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-mono tabular-nums flex items-center gap-1 font-medium">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
              {offlineQueue.length} record(s) queued for sync
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSimulatedOffline}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors border ${
              simulatedOffline
                ? 'bg-amber-500/20 text-amber-900 border-amber-400 hover:bg-amber-500/30'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {simulatedOffline ? 'Disable Low-Conn Simulation' : 'Simulate Gewog Offline'}
          </button>

          <span className="text-slate-300 hidden sm:inline">·</span>
          <span className="text-slate-500 hidden sm:inline flex items-center gap-1 font-mono text-[11px]">
            <Signal className="w-3 h-3 text-slate-400" />
            Tsirang Gewog Mesh Node #04
          </span>
        </div>
      </div>
    </div>
  );
};
