import { useEffect, useState } from "react";
import { api } from "../api/axios";
import Hero from "../components/Hero";
import type { Event } from "../types/Event";
import EventRow from "../components/EventRow";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events")
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  // 🧠 Simulating Categories (In a real app, you'd filter by date/genre)
  const trendingEvents = events.slice(0, 8);
  const weekendPicks = events.slice(8, 16).length > 0 ? events.slice(8, 16) : events.slice(0, 5); // Fallback to filling data
  const upcomingHits = events.slice(2, 10); // Overlapping data to make it look full


  return (
    <div className="bg-[#020617] min-h-screen pb-20 overflow-x-hidden">
      <Hero />

      {/* Main Content - Pulled up to overlap Hero */}
      <div className="relative z-10 -mt-20 space-y-2">
        
        {loading ? (
           // Premium Skeleton Loader
           <div className="px-6 md:px-12 space-y-12">
             {[1, 2, 3].map((section) => (
               <div key={section} className="space-y-4">
                 <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
                 <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="min-w-[280px] md:min-w-[320px] h-64 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <>
            {/* 1. The Big Hitters */}
            <EventRow title="Trending Now" events={trendingEvents} />

            {/* 2. For the Weekend Warriors */}
            <EventRow title="This Weekend's Picks" events={weekendPicks} />

            {/* 3. Future Hype */}
            <EventRow title="Highly Anticipated" events={upcomingHits} />
          </>
        )}

        {/* Bottom Spacer/Footer Area */}
        {!loading && (
          <div className="text-center pt-12 pb-8 opacity-40 text-sm text-slate-500">
            <p>You've reached the end of the list.</p>
          </div>
        )}
      </div>
    </div>
  );
}