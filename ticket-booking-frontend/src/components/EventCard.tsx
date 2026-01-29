import { motion } from "framer-motion";
import type { Event } from "../types/Event";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { Calendar, Info, MapPin, Ticket } from "lucide-react"; // Add these icons

export default function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const { requireAuth } = useAuthGuard();

  const goToDetails = () => navigate(`/event/${event.id}`);

  // Format Date (e.g., "Mon, Mar 23 • 8:00 PM")
  const dateStr = new Date(event.eventTime).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <motion.div
      whileHover={{ y: -8 }} // Gentle lift effect
      className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-white/10 group h-full flex flex-col"
    >
      {/* 1. IMAGE SECTION */}
      <div 
        onClick={goToDetails}
        className="h-48 overflow-hidden relative cursor-pointer shrink-0">
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          // Robust Fallback used in Phase 3
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";
            e.currentTarget.onerror = null;
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="p-5 flex flex-col flex-grow relative z-10 -mt-12">
        {/* Date Badge */}
        <div className="self-start bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-lg flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {dateStr}
        </div>

        <h3
          onClick={goToDetails}
          className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-2 h-[3.5rem]">
          {event.name}
        </h3>

        <div className="flex items-center gap-2 text-gray-400 text-sm mb-6 line-clamp-1">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">
            {event.venue?.name ?? "Unknown Venue"}, {event.venue?.city ?? "City"}
          </span>
        </div>

        {/* 3. ACTION BUTTON (Uses your Auth Guard) */}
<div className="mt-auto flex gap-3">
          
          {/* Details Button (Secondary) */}
          <button
            onClick={goToDetails}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold 
                       hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Info className="w-4 h-4" />
            Info
          </button>

          {/* Book Button (Primary - Uses AuthGuard) */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering other clicks if necessary
              requireAuth(() => navigate(`/event/${event.id}/booking`));
            }}
            className="flex-[1.5] py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold 
                       group-hover:bg-primary group-hover:border-primary transition-all duration-300 
                       flex items-center justify-center gap-2 text-sm"
          >
            <Ticket className="w-4 h-4" />
            Book Now
          </button>
          
        </div>
      </div>
    </motion.div>
  );
}