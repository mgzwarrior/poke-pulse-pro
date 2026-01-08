
import React from 'react';
import { PokemonCard, CollectionStatus } from '../types';
import DealIntelligence from './DealIntelligence';
import { ArrowLeft, Plus, History, Bookmark, Share2 } from 'lucide-react';

interface CardDetailsProps {
  card: PokemonCard;
  onBack: () => void;
  onAddToCollection: (status: CollectionStatus) => void;
}

const CardDetails: React.FC<CardDetailsProps> = ({ card, onBack, onAddToCollection }) => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 pb-24">
      {/* Header Sticky */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-6 bg-zinc-950/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button className="p-2 text-zinc-400"><Bookmark size={20} /></button>
          <button className="p-2 text-zinc-400"><Share2 size={20} /></button>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Card Visuals */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full opacity-50"></div>
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            className="w-full h-auto aspect-[3/4] object-contain rounded-2xl shadow-2xl relative z-10"
          />
        </div>

        {/* Info */}
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-black text-white leading-tight">{card.name}</h1>
            <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mt-1 shrink-0">
              {card.rarity}
            </span>
          </div>
          <p className="text-zinc-400 font-medium">{card.setName} • {card.number}</p>
        </div>

        {/* Market Pricing Highlights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Live Market Price</div>
            <div className="text-2xl font-black text-white">${card.marketPrice.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-1 text-green-400 text-xs font-bold">
              <History size={12} /> +2.4% vs last week
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-center">
             <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Confidence Score</div>
             <div className="text-xl font-bold text-blue-400 italic">98% Match</div>
          </div>
        </div>

        <DealIntelligence marketPrice={card.marketPrice} />

        {/* Data Sources */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Market Data</h3>
          <div className="space-y-2">
            {card.prices.map((p, idx) => (
              <div key={idx} className="bg-zinc-900/50 p-4 rounded-xl flex justify-between items-center border border-zinc-800/50">
                <div className="font-bold">{p.source}</div>
                <div className="text-right">
                  <div className="font-black text-white">${p.market.toFixed(2)}</div>
                  <div className="text-[10px] text-zinc-500">Last Sold: ${p.lastSold?.toFixed(2) || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-40">
        <button 
          onClick={() => onAddToCollection(CollectionStatus.OWNED)}
          className="w-full py-4 bg-white text-black font-black rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Plus size={20} strokeWidth={3} />
          ADD TO COLLECTION
        </button>
      </div>
    </div>
  );
};

export default CardDetails;
