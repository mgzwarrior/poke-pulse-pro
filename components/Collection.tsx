
import React from 'react';
import { CollectionItem, PokemonCard, CollectionStatus } from '../types';
import { LayoutGrid, Search } from 'lucide-react';

interface CollectionProps {
  items: CollectionItem[];
  cards: Record<string, PokemonCard>;
}

const Collection: React.FC<CollectionProps> = ({ items, cards }) => {
  const [activeTab, setActiveTab] = React.useState<CollectionStatus>(CollectionStatus.OWNED);

  const filteredItems = items.filter(i => i.status === activeTab);
  const totalValue = filteredItems.reduce((acc, item) => acc + (cards[item.cardId]?.marketPrice || 0) * item.quantity, 0);

  return (
    <div className="p-6 pb-24 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white">Vault</h2>
          <p className="text-zinc-500 font-medium">Tracking {items.length} assets</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Portfolio Value</div>
          <div className="text-xl font-black text-green-400">${totalValue.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        {[CollectionStatus.OWNED, CollectionStatus.WANTED, CollectionStatus.FOR_TRADE].map(status => (
          <button 
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === status ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text" 
          placeholder="Search your collection..." 
          className="w-full bg-zinc-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium border border-zinc-800 focus:border-zinc-600 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const card = cards[item.cardId];
          if (!card) return null;
          return (
            <div key={item.cardId} className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 hover:border-zinc-700 transition-colors group">
              <div className="aspect-[3/4] overflow-hidden rounded-xl mb-3 relative">
                <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-black">
                  x{item.quantity}
                </div>
              </div>
              <h4 className="font-bold text-sm truncate">{card.name}</h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{item.condition}</span>
                <span className="text-xs font-black text-white">${card.marketPrice.toFixed(0)}</span>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-2 py-20 flex flex-col items-center justify-center text-zinc-500 gap-4 opacity-50">
             <LayoutGrid size={48} strokeWidth={1} />
             <p className="font-medium">No cards in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
