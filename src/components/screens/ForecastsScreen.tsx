import React from 'react';
import { ForecastItem } from '../../types/bloodlink';

interface ForecastsScreenProps {
  forecasts: ForecastItem[];
  onOpenBroadcast: () => void;
}

export const ForecastsScreen: React.FC<ForecastsScreenProps> = ({
  forecasts,
  onOpenBroadcast,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Header & Architectural Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
            <span className="font-mono text-[11px] font-semibold text-[#4cd7f6] uppercase tracking-wider">
              Predictive Demand Modeling
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-white mt-1">
            AI/ML Demand Forecasting & Gap Projections
          </h1>
          <p className="text-xs text-[#dfe2f1]/70 mt-0.5">
            Predictive consumption analytics projecting 7-day municipal blood group requirements before deficits occur.
          </p>
        </div>

        {/* Required Explicit Sample Data Tag */}
        <div className="px-3.5 py-2 rounded-xl bg-[#171b26] border border-[#262a35] text-[11px] font-mono text-[#dfe2f1]/70 flex items-center gap-2 self-start md:self-auto">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]">info</span>
          <span>Sample data: Prepared for future Python FastAPI service (XGBoost/ARIMA)</span>
        </div>
      </div>

      {/* Featured Headline Demonstration Card (Directly from prompt specification) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1c1f2a] to-[#171b26] border border-[#ff5451]/40 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#ff5451]/20 text-[#ffb3ad] font-mono text-[10px] font-bold">
              HIGH RISK FORECAST
            </span>
            <span className="text-xs font-mono text-[#dfe2f1]/60">
              Target Horizon: Next 7 Days (Oct 10–17)
            </span>
          </div>

          <h2 className="font-headline text-lg sm:text-xl font-bold text-white">
            Projected O+ Demand Surge: 35 Unit Supply Deficit
          </h2>

          <p className="text-xs text-[#dfe2f1]/80 max-w-xl leading-relaxed">
            Anticipated scheduled cardiovascular procedures and trauma ward baselines indicate an upcoming deficit across Bandra and Parel hubs.
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 text-center shrink-0">
          <div className="p-3 rounded-xl bg-[#0a0e18] border border-[#262a35]">
            <span className="text-[10px] font-mono text-[#dfe2f1]/50 uppercase block">Predicted Demand</span>
            <span className="font-headline text-xl font-bold text-white block mt-0.5 tabular-nums">
              195 units
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0a0e18] border border-[#262a35]">
            <span className="text-[10px] font-mono text-[#dfe2f1]/50 uppercase block">Expected Supply</span>
            <span className="font-headline text-xl font-bold text-[#4cd7f6] block mt-0.5 tabular-nums">
              160 units
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0a0e18] border border-[#ff5451]/40">
            <span className="text-[10px] font-mono text-[#ffb3ad] uppercase block">Projected Gap</span>
            <span className="font-headline text-xl font-bold text-[#ff5451] block mt-0.5 tabular-nums">
              35 units
            </span>
          </div>
        </div>
      </div>

      {/* Compact Comparative Visual Chart: Demand vs Expected Supply */}
      <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline text-sm font-bold text-white">
              7-Day Projected Demand vs. Expected Supply (By Blood Group)
            </h3>
            <p className="text-xs text-[#dfe2f1]/60">
              Red bars indicate projected requirement; blue bars indicate baseline replenishment
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded bg-[#ff5451]"></span> Projected Demand
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded bg-[#4cd7f6]"></span> Expected Supply
            </span>
          </div>
        </div>

        {/* SVG Projection Chart */}
        <div className="w-full h-44 bg-[#0a0e18] rounded-xl border border-[#262a35] p-4 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 540 120" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="30" x2="540" y2="30" stroke="#262a35" strokeWidth="1" />
            <line x1="0" y1="60" x2="540" y2="60" stroke="#262a35" strokeWidth="1" />
            <line x1="0" y1="90" x2="540" y2="90" stroke="#262a35" strokeWidth="1" />

            {/* O+ */}
            <rect x="25" y="15" width="20" height="85" rx="3" fill="#ff5451" />
            <rect x="49" y="30" width="20" height="70" rx="3" fill="#4cd7f6" />
            <text x="47" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">O+</text>

            {/* O- */}
            <rect x="90" y="35" width="20" height="65" rx="3" fill="#ff5451" />
            <rect x="114" y="65" width="20" height="35" rx="3" fill="#4cd7f6" />
            <text x="112" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">O-</text>

            {/* AB- */}
            <rect x="155" y="55" width="20" height="45" rx="3" fill="#ff5451" />
            <rect x="179" y="75" width="20" height="25" rx="3" fill="#4cd7f6" />
            <text x="177" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">AB-</text>

            {/* B- */}
            <rect x="220" y="50" width="20" height="50" rx="3" fill="#ff5451" />
            <rect x="244" y="60" width="20" height="40" rx="3" fill="#4cd7f6" />
            <text x="242" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">B-</text>

            {/* B+ */}
            <rect x="285" y="30" width="20" height="70" rx="3" fill="#ff5451" />
            <rect x="309" y="35" width="20" height="65" rx="3" fill="#4cd7f6" />
            <text x="307" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">B+</text>

            {/* A- */}
            <rect x="350" y="45" width="20" height="55" rx="3" fill="#ff5451" />
            <rect x="374" y="45" width="20" height="55" rx="3" fill="#4cd7f6" />
            <text x="372" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">A-</text>

            {/* A+ */}
            <rect x="415" y="25" width="20" height="75" rx="3" fill="#ff5451" />
            <rect x="439" y="20" width="20" height="80" rx="3" fill="#4cd7f6" />
            <text x="437" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">A+</text>

            {/* AB+ */}
            <rect x="480" y="40" width="20" height="60" rx="3" fill="#ff5451" />
            <rect x="504" y="35" width="20" height="65" rx="3" fill="#4cd7f6" />
            <text x="502" y="112" fill="#dfe2f1" fontSize="10" fontFamily="sans-serif" textAnchor="middle">AB+</text>
          </svg>
        </div>
      </div>

      {/* Forecast Data Table with Shortage Risk Level & Recommendations */}
      <div className="p-5 rounded-2xl bg-[#171b26] border border-[#262a35] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-base font-bold text-white">
            Blood Group Risk Matrix & Prescriptive Interventions
          </h3>
          <span className="text-xs font-mono text-[#dfe2f1]/50">Updated Hourly</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#262a35] text-[#dfe2f1]/60 font-mono">
                <th className="py-2.5 px-3">Blood Group</th>
                <th className="py-2.5 px-3">30D Demand</th>
                <th className="py-2.5 px-3">Current Reserve</th>
                <th className="py-2.5 px-3">Predicted 7D</th>
                <th className="py-2.5 px-3">Expected 7D</th>
                <th className="py-2.5 px-3">Projected Gap</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Action Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a35]/60 font-mono">
              {forecasts.map((row) => {
                const isCrit = row.riskLevel === 'critical';
                const isHigh = row.riskLevel === 'high';
                const isMod = row.riskLevel === 'moderate';

                return (
                  <tr key={row.bloodGroup} className="hover:bg-[#1c1f2a]/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-white text-sm">
                      {row.bloodGroup}
                    </td>
                    <td className="py-3 px-3 text-[#dfe2f1]/70 tabular-nums">
                      {row.historicalDemand30D}u
                    </td>
                    <td className="py-3 px-3 text-white font-semibold tabular-nums">
                      {row.currentInventory}u
                    </td>
                    <td className="py-3 px-3 text-[#ffb3ad] font-semibold tabular-nums">
                      {row.predictedDemand7D}u
                    </td>
                    <td className="py-3 px-3 text-[#4cd7f6] tabular-nums">
                      {row.expectedSupply7D}u
                    </td>
                    <td className="py-3 px-3 tabular-nums">
                      {row.projectedGap > 0 ? (
                        <span className="font-bold text-[#ff5451]">-{row.projectedGap}u</span>
                      ) : (
                        <span className="text-[#4edea3]">Surplus</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCrit
                            ? 'bg-[#ff5451] text-[#5c0008]'
                            : isHigh
                            ? 'bg-[#ff5451]/20 text-[#ffb3ad]'
                            : isMod
                            ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                            : 'bg-[#00a572]/20 text-[#4edea3]'
                        }`}
                      >
                        {row.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-xs text-[#dfe2f1]/80 max-w-xs">
                      {row.recommendedAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Future FastAPI & XGBoost / ARIMA Integration Architecture Card */}
      <div className="p-5 rounded-2xl bg-[#0a0e18] border border-[#262a35] flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">
            integration_instructions
          </span>
          <h3 className="font-headline text-sm font-bold text-white">
            Architecture Blueprint: Future FastAPI Microservice Pipeline
          </h3>
        </div>

        <p className="text-xs text-[#dfe2f1]/70 leading-relaxed">
          The application frontend contracts with an asynchronous prediction interface. A future Python service powered by <strong>XGBoost (gradient boosted trees)</strong> and <strong>ARIMA/Prophet time-series models</strong> ingest historical hospital admission rates, local weather, weekend trauma variance, and donor turnout to supply live inference via:
        </p>

        <div className="p-3 rounded-xl bg-[#171b26] border border-[#262a35] text-[11px] font-mono text-[#4cd7f6] overflow-x-auto">
          <code>
            POST /api/v1/forecast/predict &#123; "region": "mumbai_metro", "horizon_days": 7, "features": ["weather_rain", "holiday_weekend", "bed_occupancy"] &#125;
          </code>
        </div>
      </div>
    </div>
  );
};
