import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, MapPin, Clock, Share2, ArrowLeft, 
  Ticket, ShieldCheck, AlertCircle, ChevronRight 
} from "lucide-react";
import { api } from "../api/axios";
import { useAuthGuard } from "../hooks/useAuthGuard";
import type { Event } from "../types/Event";

// Simple interface for pricing logic
interface Seat {
  id: number;
  price: number;
  status: string;
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuthGuard();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null); // 🟢 State for dynamic price
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Event Details
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data);

        // 2. Fetch Seats to find "Starting From" price
        const seatsRes = await api.get(`/events/${id}/seats`);
        const seats: Seat[] = seatsRes.data;

        // Logic: Find lowest price among AVAILABLE seats. 
        // If none available, fall back to all seats to show a baseline price.
        const availableSeats = seats.filter(s => s.status === 'AVAILABLE');
        const targetSeats = availableSeats.length > 0 ? availableSeats : seats;

        if (targetSeats.length > 0) {
           const prices = targetSeats.map(s => s.price);
           setMinPrice(Math.min(...prices));
        }

      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBook = () => {
    requireAuth(() => navigate(`/event/${id}/booking`));
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
            LOADING
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-slate-400 mb-6">The event you are looking for might have been removed or is unavailable.</p>
        <button 
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  // Formatting Date
  const eventDate = new Date(event.eventTime);
  const dateStr = eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const timeStr = eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-32 md:pb-12">
      
      {/* 1. IMMERSIVE HERO BACKGROUND */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {/* Background Image with Parallax-like fixed position */}
        <div className="absolute inset-0">
          <img 
            src={event.imageUrl} 
            alt={event.name}
            className="w-full h-full object-cover opacity-60 scale-105 blur-sm md:blur-0"
          />
          {/* Heavy Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 to-transparent" />
        </div>

        {/* Navigation & Actions */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all">
            <Share2 size={18} />
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-6 pb-12 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                TRENDING
              </span>
              <span className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                SELLING FAST
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 tracking-tight">
              {event.name}
            </h1>

            <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary" size={20} />
                <span>{dateStr}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-primary" size={20} />
                <span>{timeStr}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-primary" size={20} />
                <span>{event.venue?.name}, {event.venue?.city}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description */}
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-500" /> 
                About the Event
              </h3>
              <div className="prose prose-invert prose-lg text-slate-400 leading-relaxed">
                 {/* Fallback description if DB is empty */}
                 <p>
                   {event.description || 
                   `Get ready for an unforgettable experience at ${event.venue?.name}! 
                   This event promises high-energy performances, immersive visuals, 
                   and a night you won't want to miss. Secure your spot now to witness ${event.name} live.`}
                 </p>
              </div>
            </section>

            {/* Venue Map Preview (Visual Only) */}
            <section>
              <h3 className="text-xl font-bold mb-4">Venue Location</h3>
              <div className="h-64 w-full bg-slate-800 rounded-2xl overflow-hidden relative group">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=800x400&maptype=roadmap&key=YOUR_API_KEY_HERE')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500" />
                
                {/* Fallback Gradient if no map image */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <MapPin size={40} className="text-primary mb-2 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  <h4 className="text-lg font-bold">{event.venue?.name}</h4>
                  <p className="text-sm text-slate-400 max-w-xs">{event.venue?.city || "City Center, Hyderabad"}</p>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Sticky Booking Card (Desktop) */}
          <div className="hidden lg:block relative">
            <div className="sticky top-24">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Starting from</p>
                    <div className="flex items-baseline gap-1">
                      {/* 🟢 DYNAMIC PRICE: Use minPrice state */}
                      {minPrice !== null ? (
                        <>
                           <span className="text-3xl font-bold text-white">₹{minPrice}</span>
                           <span className="text-slate-500 text-sm">/person</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-slate-500">Sold Out</span>
                      )}
                    </div>
                  </div>
                  {minPrice !== null && (
                    <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
                        AVAILABLE
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-slate-300 bg-black/20 p-3 rounded-xl">
                    <Calendar size={16} className="text-primary" />
                    <span>{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300 bg-black/20 p-3 rounded-xl">
                     <Clock size={16} className="text-primary" />
                     <span>{timeStr} onwards</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300 bg-black/20 p-3 rounded-xl">
                     <MapPin size={16} className="text-primary" />
                     <span className="truncate">{event.venue?.name}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBook}
                  disabled={minPrice === null}
                  className="w-full py-4 bg-primary hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Ticket size={20} />
                  {minPrice !== null ? "Book Tickets" : "Sold Out"}
                </button>
                
                <p className="text-center text-xs text-slate-500 mt-4">
                  100% Secure Payment • Instant Confirmation
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MOBILE STICKY FOOTER (Floating Action Bar) */}
      <div className="fixed bottom-0 left-0 w-full bg-[#020617]/90 backdrop-blur-xl border-t border-white/10 p-4 pb-6 z-50 lg:hidden block">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-xs text-slate-400 uppercase font-bold">Total Price</p>
            {/* 🟢 DYNAMIC PRICE: Use minPrice state */}
            {minPrice !== null ? (
                <p className="text-2xl font-bold text-white">₹{minPrice} <span className="text-sm font-normal text-slate-500">+ taxes</span></p>
            ) : (
                <p className="text-xl font-bold text-slate-500">Sold Out</p>
            )}
          </div>
          <button 
            onClick={handleBook}
            disabled={minPrice === null}
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Book Now <ChevronRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}