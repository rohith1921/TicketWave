import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import {
  Calendar, MapPin, Ticket, Loader, User,
  Mail, Edit2, Check, X, QrCode, Sparkles, Lock
} from "lucide-react";
import { api } from "../api/axios";
import toast from "react-hot-toast";

// --- Types ---
interface Booking {
  id: number;
  eventTitle: string;
  venueName: string;
  eventDate: string;
  seatNumbers: string[];
  totalPrice: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  qrCodeData: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

// --- Main Component ---
export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [tempName, setTempName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, userRes] = await Promise.all([
          api.get("/booking/my"),
          api.get("/users/me")
        ]);

        setBookings(bookingsRes.data);
        setUser(userRes.data);
        setTempName(userRes.data.name); // Initialize edit field
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    
    if(!user) return;

    try {
      await api.put("/users/me", { name: tempName });
      setUser({ ...user, name: tempName });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Failed to save changes. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 pb-20 overflow-x-hidden">

      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-12 relative z-10">

        {/* 1. PROFILE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

          {/* User Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={120} />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-purple-600 p-[2px] shadow-2xl shadow-primary/20">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <User size={48} className="text-slate-400" />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 w-full space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">My Profile</h2>
                    <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => { if(user) { setTempName(user.name); setIsEditing(true); }}}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                    >
                      <Edit2 size={18} className="text-slate-400" />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditing(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-colors"><X size={18} /></button>
                      <button onClick={handleSaveProfile} className="p-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl text-green-400 transition-colors"><Check size={18} /></button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold uppercase ml-1">Full Name</label>
                    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${isEditing ? 'bg-black/30 border-primary/50 ring-2 ring-primary/20' : 'bg-white/5 border-white/5'}`}>
                      <User size={18} className="text-slate-400" />
                      {isEditing ? (
                        <input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="bg-transparent border-none outline-none text-white w-full font-medium"
                        />
                      ) : (
                        <span className="font-medium text-slate-200">{user?.name || "User"}</span>
                      )}
                    </div>
                  </div>

                  {/* Email Field (READ ONLY) */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold uppercase ml-1 flex items-center gap-2">
                      Email Address <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">Read-Only</span>
                    </label>
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/5 opacity-70 cursor-not-allowed">
                      <Mail size={18} className="text-slate-400" />
                      <span className="font-medium text-slate-400 truncate">{user?.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-lg font-medium text-slate-300">Total Bookings</h3>
              <p className="text-5xl font-black text-white mt-2">{bookings.length}</p>
            </div>
            <div className="relative z-10 mt-8">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-purple-500 w-[75%]" />
              </div>
              <p className="text-xs text-slate-400 mt-2">You are in the top 5% of fans!</p>
            </div>
          </motion.div>
        </div>


        {/* 2. TICKETS SECTION */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">My Tickets</h2>
            <p className="text-slate-400">Manage your upcoming events</p>
          </div>
          <button className="hidden md:flex text-sm text-primary hover:text-white transition-colors items-center gap-1">
            View History <Ticket size={14} />
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
            <Ticket size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-500 text-lg">Your wallet is empty.</p>
            <button className="mt-4 text-primary font-bold hover:underline">Browse Events</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {bookings.map((ticket, i) => (
              <TicketCard key={ticket.id} ticket={ticket} index={i} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// 🎫 PREMIUM TICKET COMPONENT (Conditional QR)
function TicketCard({ ticket, index }: { ticket: Booking, index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // 🔒 CHECK: Can we show the QR?
  const canShowQr = ticket.status === "CONFIRMED" && ticket.qrCodeData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative h-[340px] md:h-72 w-full group perspective-1000"
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        
        {/* === FRONT FACE === */}
        <div 
            className="absolute inset-0 z-20" 
            style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="h-full w-full bg-[#0F172A] rounded-3xl border border-white/10 flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
            
            {/* ... Left Side (Details) Code Remains the Same ... */}
            <div className="flex-1 p-6 relative z-10 flex flex-col justify-between">
               {/* (Paste your existing details code here) */}
               <div className="flex justify-between items-start">
                 <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                    ticket.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                 }`}>
                    {ticket.status}
                 </span>
                 <Ticket size={24} className="text-white/10" />
               </div>

               <div className="mt-4 md:mt-0">
                  <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">{ticket.eventTitle}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin size={14} className="text-primary" /> {ticket.venueName}
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-4">
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Date</p>
                    <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                       <Calendar size={14} /> {new Date(ticket.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Seat(s)</p>
                    <p className="text-sm font-medium text-white bg-white/10 inline-block px-2 py-0.5 rounded">
                       {ticket.seatNumbers.join(", ")}
                    </p>
                  </div>
               </div>
            </div>

            {/* Divider */}
            <div className="hidden md:flex relative w-8 h-full bg-[#020617] flex-col items-center justify-center">
               <div className="absolute top-[-10px] w-6 h-6 rounded-full bg-[#020617] border border-white/10 shadow-inner" />
               <div className="h-full w-[1px] border-l-2 border-dashed border-slate-700" />
               <div className="absolute bottom-[-10px] w-6 h-6 rounded-full bg-[#020617] border border-white/10 shadow-inner" />
            </div>

            {/* Right Side (Action Stub) */}
            <div className="h-16 md:h-full md:w-24 bg-slate-900 flex md:flex-col items-center justify-between md:justify-center p-4 md:p-2 border-t md:border-t-0 md:border-l border-white/5">
                <div className="md:flex-1 flex items-center justify-center">
                   <div className="md:rotate-90 whitespace-nowrap text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase">
                      ADMIT ONE
                   </div>
                </div>
                
                {/* 🚀 CONDITIONAL BUTTON: Only show if confirmed */}
                {canShowQr ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                    title="View QR Code"
                  >
                     <QrCode size={20} />
                  </button>
                ) : (
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 text-slate-600 flex items-center justify-center cursor-not-allowed border border-white/5">
                     <Lock size={18} />
                  </div>
                )}
            </div>
          </div>
        </div>


        {/* === BACK FACE (QR Code) === */}
        {/* Only render back face content if QR exists to be safe */}
        {canShowQr && (
          <div 
            className="absolute inset-0 h-full w-full bg-white rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8 shadow-2xl"
            style={{ 
                backfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)' 
            }} 
          >
             {/* ... Same Back Face Code as before ... */}
             <div className="w-40 h-40 md:w-48 md:h-48 bg-black p-2 rounded-2xl shrink-0">
                 <div className="w-full h-full bg-white rounded-xl p-2 flex items-center justify-center">
                   <QRCode 
                     value={ticket.qrCodeData} 
                     size={140}
                     className="w-full h-full"
                   />
                 </div>
             </div>

             <div className="flex-1 h-full flex flex-col justify-center text-slate-900 w-full text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2">Scan Entry</h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                   Present this code at the gate.
                </p>
                
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-100 flex justify-between items-center w-full">
                   <div className="text-left">
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Booking ID</p>
                      <p className="font-mono font-bold">#{ticket.id}</p>
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                     className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                   >
                      Close
                   </button>
                </div>
             </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}