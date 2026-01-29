import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Frown, ArrowLeft, Loader } from "lucide-react";
import { api } from "../api/axios";
import EventCard from "../components/EventCard";
import type { Event } from "../types/Event";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // ❌ DELETED: The manual token check useEffect is gone.
  // <ProtectedRoute> handles security now.

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    api.get("/events")
      .then((res) => {
        const allEvents: Event[] = res.data;
        const filtered = allEvents.filter((e) => 
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.venue?.name.toLowerCase().includes(query.toLowerCase()) ||
          e.venue?.city.toLowerCase().includes(query.toLowerCase())
        );
        setEvents(filtered);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-12 border-b border-white/10 pb-8">
          <div>
             <button 
               onClick={() => navigate("/")}
               className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-bold uppercase tracking-wider"
             >
               <ArrowLeft size={16} /> Back to Home
             </button>
             <h1 className="text-3xl md:text-4xl font-black">
               Search Results
             </h1>
             <p className="text-slate-400 mt-2 text-lg">
               Showing results for <span className="text-white font-bold">"{query}"</span>
             </p>
          </div>
          
          {!loading && (
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
              <Search className="text-primary" size={20} />
              <span className="font-bold">{events.length}</span>
              <span className="text-slate-400">Events found</span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500">
             <Loader className="animate-spin mb-4 text-primary" size={40} />
             <p>Searching for events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {events.map((event) => (
              <div key={event.id} className="h-full">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Frown size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No events found</h2>
            <p className="text-slate-400 max-w-md">
              We couldn't find anything matching "{query}".
            </p>
            <button 
              onClick={() => navigate("/")}
              className="mt-8 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-indigo-500 transition-all"
            >
              Explore All Events
            </button>
          </div>
        )}

      </div>
    </div>
  );
}