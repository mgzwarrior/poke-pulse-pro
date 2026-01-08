
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { identifyCardFromImage } from '../services/geminiService';
import { getCardByDetails } from '../services/cardDatabase';
import { PokemonCard } from '../types';
import { Camera, RefreshCw, X, Zap } from 'lucide-react';

interface ScannerProps {
  onCardFound: (card: PokemonCard) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onCardFound, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access denied. Please enable permissions.");
      }
    }
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    setIsScanning(true);
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Draw frame to canvas
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    const result = await identifyCardFromImage(base64Image);
    if (result) {
      const card = await getCardByDetails(result.name, result.set, result.number);
      if (card) {
        onCardFound(card);
      }
    } else {
      setError("Could not identify card. Try again with better lighting.");
      setTimeout(() => setError(null), 3000);
    }
    setIsScanning(false);
  }, [isScanning, onCardFound]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Scanner Overlay UI */}
        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
           <div className="w-full h-full border-2 border-yellow-400/50 rounded-lg relative">
             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400"></div>
             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-400"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-400"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400"></div>
           </div>
        </div>

        {/* Top Controls */}
        <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center pointer-events-auto">
          <button 
            onClick={onClose}
            className="p-3 bg-zinc-900/80 backdrop-blur rounded-full text-white active:scale-90 transition-transform"
          >
            <X size={24} />
          </button>
          <div className="bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-full text-yellow-400 font-bold flex items-center gap-2">
            <Zap size={16} fill="currentColor" />
            LIVE SCANNER
          </div>
          <button className="p-3 bg-zinc-900/80 backdrop-blur rounded-full text-white">
            <RefreshCw size={24} />
          </button>
        </div>

        {error && (
          <div className="absolute bottom-32 left-6 right-6 p-4 bg-red-500/90 text-white text-center rounded-xl font-medium animate-bounce">
            {error}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Capture Button */}
      <div className="bg-zinc-950 p-8 safe-bottom flex justify-center items-center">
        <button 
          onClick={captureAndScan}
          disabled={isScanning}
          className={`relative w-20 h-20 rounded-full border-4 ${isScanning ? 'border-zinc-700' : 'border-white'} flex items-center justify-center transition-all active:scale-95`}
        >
          <div className={`w-16 h-16 rounded-full ${isScanning ? 'bg-zinc-700 animate-pulse' : 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]'}`} />
          {isScanning && <RefreshCw className="absolute text-white animate-spin" size={32} />}
        </button>
      </div>
    </div>
  );
};

export default Scanner;
