
import React from 'react';
import { TrendingDown, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DealIntelligenceProps {
  marketPrice: number;
}

const DealIntelligence: React.FC<DealIntelligenceProps> = ({ marketPrice }) => {
  const tiers = [
    { label: 'Deep Value (80%)', pct: 0.80, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    { label: 'Great Deal (85%)', pct: 0.85, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
    { label: 'Fair Trade (90%)', pct: 0.90, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  ];

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4 text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
        <TrendingDown size={14} />
        Negotiation Benchmarks
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {tiers.map((tier) => (
          <div key={tier.label} className={`${tier.bg} ${tier.border} border rounded-xl p-3 flex flex-col items-center justify-center text-center`}>
            <span className={`text-xs font-semibold ${tier.color} mb-1`}>{tier.pct * 100}%</span>
            <span className="text-sm font-bold text-white">${(marketPrice * tier.pct).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-green-400 shrink-0" size={20} />
          <div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase">Buy Signal</div>
            <div className="text-xs font-medium">Under ${(marketPrice * 0.85).toFixed(0)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-400 shrink-0" size={20} />
          <div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase">Market Price</div>
            <div className="text-xs font-medium">${marketPrice.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealIntelligence;
