
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PokemonCard, 
  CollectionItem, 
  CollectionStatus, 
  CardCondition 
} from './types';
import Scanner from './components/Scanner';
import CardDetails from './components/CardDetails';
import Collection from './components/Collection';
import { 
  Scan, 
  LayoutDashboard, 
  Box, 
  Search, 
  Settings,
  Flame,
  TrendingUp,
  History
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'collection' | 'scanner' | 'details' | 'search'>('home');
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [collection, setCollection] = useState<CollectionItem[]>(() => {
    const saved = localStorage.getItem('pokepulse_collection');
    return saved ? JSON.parse(saved) : [];
  });
  const [cardCache, setCardCache] = useState<Record<string, PokemonCard>>({});

  // Stats
  const portfolioValue = useMemo(() => {
    return collection.reduce((acc, item) => {
      const card = cardCache[item.cardId];
      return acc + (card?.marketPrice || 0) * item.quantity;
    }, 0);
  }, [collection, cardCache]);

  useEffect(() => {
    localStorage.setItem('pokepulse_collection', JSON.stringify(collection));
  }, [collection]);

  const handleCardFound = (card: PokemonCard) => {
    setSelectedCard(card);
    setCardCache(prev => ({ ...prev, [card.id]: card }));
    setCurrentView('details');
  };

  const addToCollection = (status: CollectionStatus) => {
    if (!selectedCard) return;
    const newItem: CollectionItem = {
      cardId: selectedCard.id,
      status,
      condition: CardCondition.NEAR_MINT,
      quantity: 1,
      addedAt: Date.now()
    };
    setCollection(prev => [...prev, newItem]);
    setCurrentView('collection');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-zinc-950 text-white relative flex flex-col">
      
      {/* View Rendering */}
      <main className="flex-1 overflow-y-auto pb-24">
        {currentView === 'home' && (
          <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter">POKÉPULSE</h1>
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Collector Pro Edition</p>
              </div>
              <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                <Settings size={20} className="text-zinc-400" />
              </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl shadow-lg relative overflow-hidden group">
                <TrendingUp size={64} className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform" />
                <div className="text-white/70 text-[10px] font-bold uppercase mb-1">Net Worth</div>
                <div className="text-2xl font-black">${portfolioValue.toFixed(2)}</div>
                <div className="text-xs font-bold text-white/50 mt-1">+12% Monthly</div>
              </div>
              <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800">
                <div className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Total Cards</div>
                <div className="text-2xl font-black">{collection.length}</div>
                <div className="text-xs font-bold text-green-400 mt-1">4 Active Trades</div>
              </div>
            </div>

            {/* Market Pulse */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" /> Trending Sets
                </h3>
                <button className="text-xs font-bold text-blue-400">View All</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {['Paldea Evolved', 'Silver Tempest', 'Lost Origin'].map(set => (
                   <div key={set} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl text-center">
                     <div className="w-10 h-10 bg-zinc-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Box size={20} className="text-zinc-500" />
                     </div>
                     <div className="text-[10px] font-bold truncate uppercase">{set}</div>
                   </div>
                 ))}
              </div>
            </section>

            {/* Recent Scans / History */}
            <section className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <History size={16} /> Recent Activity
              </h3>
              <div className="space-y-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/50">
                     <div className="w-12 h-16 bg-zinc-800 rounded-lg animate-pulse" />
                     <div className="flex-1">
                       <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2" />
                       <div className="h-3 w-1/2 bg-zinc-800/50 rounded" />
                     </div>
                     <div className="text-right">
                       <div className="text-xs font-black">$---</div>
                       <div className="text-[10px] text-zinc-500 uppercase">2h ago</div>
                     </div>
                   </div>
                 ))}
              </div>
            </section>
          </div>
        )}

        {currentView === 'collection' && (
          <Collection items={collection} cards={cardCache} />
        )}

        {currentView === 'details' && selectedCard && (
          <CardDetails 
            card={selectedCard} 
            onBack={() => setCurrentView('home')} 
            onAddToCollection={addToCollection} 
          />
        )}

        {currentView === 'scanner' && (
          <Scanner 
            onCardFound={handleCardFound} 
            onClose={() => setCurrentView('home')} 
          />
        )}
      </main>

      {/* Navigation Bar - Sticky Bottom */}
      <nav className="fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => setCurrentView('home')}
            className={`p-4 rounded-full transition-all ${currentView === 'home' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutDashboard size={24} strokeWidth={currentView === 'home' ? 3 : 2} />
          </button>
          
          <button 
            onClick={() => setCurrentView('collection')}
            className={`p-4 rounded-full transition-all ${currentView === 'collection' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            <Box size={24} strokeWidth={currentView === 'collection' ? 3 : 2} />
          </button>

          {/* Central Scan Action */}
          <button 
            onClick={() => setCurrentView('scanner')}
            className="w-20 h-20 -mt-12 bg-red-600 rounded-full border-[6px] border-zinc-950 flex items-center justify-center shadow-[0_15px_30px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all text-white"
          >
            <Scan size={32} strokeWidth={3} />
          </button>

          <button className="p-4 rounded-full text-zinc-500 hover:text-white">
            <Search size={24} />
          </button>
          
          <button className="p-4 rounded-full text-zinc-500 hover:text-white">
            <Settings size={24} />
          </button>
        </div>
      </nav>

      {/* Background Decor */}
      <div className="fixed top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 blur-[150px] -z-10 pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] -z-10 pointer-events-none" />
    </div>
  );
};

export default App;
