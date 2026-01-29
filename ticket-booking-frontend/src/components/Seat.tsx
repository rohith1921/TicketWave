import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface SeatProps {
  id: number;
  seatNumber: number;
  // 🚀 FIX 1: Match Backend Type ("SOLD" instead of "BOOKED")
  status: 'AVAILABLE' | 'SOLD' | 'SELECTED'; 
  onToggle: () => void;
}

export default function Seat({ id, seatNumber, status, onToggle }: SeatProps) {
  // 🚀 FIX 2: Check for "SOLD"
  const isSold = status === 'SOLD'; 
  const isSelected = status === 'SELECTED';

  return (
    <motion.button
      whileTap={!isSold ? { scale: 0.9 } : {}}
      onClick={!isSold ? onToggle : undefined}
      disabled={isSold}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        "w-8 h-8 rounded-t-lg text-[10px] font-bold flex items-center justify-center transition-all duration-200 border-b-4 relative",
        
        // 1. AVAILABLE STATE
        status === 'AVAILABLE' && "bg-slate-700 hover:bg-slate-600 border-slate-800 text-gray-300 cursor-pointer hover:-translate-y-0.5",
        
        // 2. SELECTED STATE (Electric Indigo + Glow)
        status === 'SELECTED' && "bg-primary border-indigo-900 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] transform -translate-y-1 z-10",
        
        // 3. SOLD STATE (The "BookMyShow" Blocked Look)
        // Dark grey, low opacity, no border depth, not allowed cursor
        status === 'SOLD' && "bg-[#1e293b] border-transparent text-[#475569] cursor-not-allowed opacity-60"
      )}
    >
      {/* Optional: Add an 'X' icon for sold seats if you want strict visual cue */}
      {isSold ? (
         <span className="text-xl leading-none block pt-1">×</span> 
      ) : (
         seatNumber
      )}
    </motion.button>
  );
}