import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, Search, MapPin, Calendar, 
  SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight 
} from "lucide-react";
import { api } from "../api/axios";
import { useAuthGuard } from "../hooks/useAuthGuard";
import type { Event } from "../types/Event";

// --- Types for Local State ---
type SortOption = "recommended" | "date" | "price_low" | "price_high";

export default function EventsPage() {
  const navigate = useNavigate();
  const { requireAuth } = useAuthGuard();

  // --- State ---
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [showFilters, setShowFilters] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get("/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Failed to fetch events", err))
      .finally(() => setLoading(false));
  }, []);

  // --- Derived Data ---
  
  // 1. Get Top 3 Events for Hero Carousel
  const heroEvents = useMemo(() => events.slice(0, 3), [events]);

  // 2. Unique Cities
  const cities = useMemo(() => {
    const unique = new Set(events.map(e => e.venue?.city).filter(Boolean));
    return ["All Cities", ...Array.from(unique)];
  }, [events]);

  // 3. Unique Categories
  const categories = useMemo(() => {
    const unique = new Set(events.map((e: any) => e.category || "General"));
    return ["All", ...Array.from(unique)];
  }, [events]);

  // --- Carousel Logic (Auto-Play) ---
  useEffect(() => {
    if (heroEvents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroEvents.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [heroEvents.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroEvents.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroEvents.length) % heroEvents.length);

  // --- Filtering Logic ---
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        const matchesCategory = selectedCategory === "All" || (event as any).category === selectedCategory;
        const matchesCity = selectedCity === "All Cities" || event.venue?.city === selectedCity;
        const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              event.venue?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesCity && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date": return new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime();
          case "price_low": return (a.id) - (b.id); 
          case "price_high": return (b.id) - (a.id);
          default: return 0;
        }
      });
  }, [events, selectedCategory, selectedCity, searchQuery, sortBy]);

  // --- Handlers ---
  const handleBook = (id: number) => {
    requireAuth(() => navigate(`/event/${id}/booking`));
  };

  const goToDetails = (id: number) => navigate(`/event/${id}`);

  if (loading) return <EventsLoader />;

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20">
      
      {/* 1. HERO CAROUSEL SECTION */}
      {heroEvents.length > 0 && (
        <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden mb-8 group bg-slate-900">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
               {/* Background Image */}
               <div className="absolute inset-0">
                  <img 
                    src={heroEvents[currentSlide].imageUrl} 
                    alt={heroEvents[currentSlide].name}
                    className="w-full h-full object-cover"
                  />
                  {/* Premium Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 via-transparent to-transparent" />
               </div>

               {/* Content */}
               <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-10 flex flex-col md:flex-row items-end justify-between gap-6">
                 <div className="max-w-3xl space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.3 }}
                      className="flex gap-2"
                    >
                      <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        Trending
                      </span>
                      <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                         {new Date(heroEvents[currentSlide].eventTime).toLocaleDateString()}
                      </span>
                    </motion.div>

                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.4 }}
                      className="text-4xl md:text-7xl font-black leading-tight text-white drop-shadow-2xl"
                    >
                      {heroEvents[currentSlide].name}
                    </motion.h1>

                    <motion.p 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.5 }}
                      className="text-slate-300 line-clamp-2 max-w-xl text-lg md:text-xl font-medium"
                    >
                      {`Experience the biggest event of the year at ${heroEvents[currentSlide].venue?.name}. Don't miss out!`}
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.6 }}
                      className="flex gap-4 pt-4"
                    >
                      <button 
                        onClick={() => handleBook(heroEvents[currentSlide].id)}
                        className="px-8 py-4 bg-primary hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/40 transform hover:-translate-y-1"
                      >
                        Book Now
                      </button>
                      <button 
                        onClick={() => goToDetails(heroEvents[currentSlide].id)}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold rounded-xl transition-all"
                      >
                        View Details
                      </button>
                    </motion.div>
                 </div>
               </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows (Visible on Hover) */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-20 border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-20 border border-white/10"
          >
            <ChevronRight size={24} />
          </button>

          {/* Slide Indicators (Dots) */}
          <div className="absolute bottom-6 right-6 md:right-12 z-20 flex gap-3">
            {heroEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}


      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- Controls Bar --- */}
        <div className="sticky top-20 z-40 bg-[#020617]/95 backdrop-blur-xl py-4 border-b border-white/5 mb-8 -mx-6 px-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Left: Categories */}
            <div className="w-full md:w-auto overflow-x-auto scrollbar-hide">
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                      selectedCategory === cat 
                        ? 'bg-white text-[#020617] border-white' 
                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Search & Filters */}
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                />
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all ${
                  showFilters ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                    <div className="relative">
                      <select 
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                      >
                        {cities.map(city => <option key={city} value={city} className="bg-slate-900">{city}</option>)}
                      </select>
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Sort By</label>
                    <div className="relative">
                       <select 
                         value={sortBy}
                         onChange={(e) => setSortBy(e.target.value as SortOption)}
                         className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                       >
                         <option value="recommended" className="bg-slate-900">Recommended</option>
                         <option value="date" className="bg-slate-900">Date (Soonest)</option>
                         <option value="price_low" className="bg-slate-900">Price (Low to High)</option>
                         <option value="price_high" className="bg-slate-900">Price (High to Low)</option>
                       </select>
                       <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <button 
                      onClick={() => { setSelectedCategory("All"); setSelectedCity("All Cities"); setSearchQuery(""); }}
                      className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-bold transition-all"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* 3. EVENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <CatalogCard 
                key={event.id} 
                event={event} 
                onClick={() => goToDetails(event.id)} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Filter className="text-slate-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">No events found</h3>
              <p className="text-slate-400">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENT: Dynamic Catalog Card ---
function CatalogCard({ event, onClick }: { event: Event; onClick: () => void }) {
  // Local state for dynamic pricing
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  // Simulated Badges (You can replace this with real logic later)
  const isFastFilling = useMemo(() => Math.random() > 0.7, []);
  const isTrending = useMemo(() => Math.random() > 0.8, []);

  // ⚡️ FETCH DYNAMIC PRICE
  useEffect(() => {
    let isMounted = true;
    
    const fetchPrice = async () => {
      try {
        // If your 'event' object ALREADY has seats, use them to save network calls
        // @ts-ignore - ignoring TS check if seats might not exist on type yet
        if (event.seats && event.seats.length > 0) {
           // @ts-ignore
           const prices = event.seats.map(s => s.price);
           if (isMounted) {
             setMinPrice(Math.min(...prices));
             setLoadingPrice(false);
           }
           return;
        }

        // Otherwise, fetch from API
        const res = await api.get(`/events/${event.id}/seats`);
        const seats = res.data;
        
        // Filter only available seats if you want "Starting from available"
        // Or just take all seats for "Base Price"
        const validSeats = seats.length > 0 ? seats : [];
        
        if (validSeats.length > 0) {
          // @ts-ignore
          const lowest = Math.min(...validSeats.map(s => s.price));
          if (isMounted) setMinPrice(lowest);
        }
      } catch (err) {
        console.error("Price fetch failed", err);
      } finally {
        if (isMounted) setLoadingPrice(false);
      }
    };

    fetchPrice();

    return () => { isMounted = false; };
  }, [event.id, event]);

  const dateObj = new Date(event.eventTime);
  const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden shrink-0">
        <img 
          src={event.imageUrl} 
          alt={event.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-60" />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
           {minPrice === null && !loadingPrice ? (
             <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wide">Sold Out</span>
           ) : (
             <>
               {isTrending && <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wide">Trending</span>}
               {isFastFilling && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wide">Fast Filling</span>}
             </>
           )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors line-clamp-1" title={event.name}>
            {event.name}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
            <MapPin size={12} />
            <span className="truncate">{event.venue?.name}, {event.venue?.city}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-white/5 pt-3 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Date</span>
            <span className="text-sm font-medium text-slate-200 flex items-center gap-1">
               <Calendar size={12} className="text-primary" /> {dateStr}
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price</span>
            
            {/* 🟢 DYNAMIC PRICE DISPLAY */}
            {loadingPrice ? (
              // Loading Skeleton for Price
              <div className="h-5 w-16 bg-white/10 rounded animate-pulse mt-1" />
            ) : minPrice !== null ? (
              <span className="text-sm font-bold text-white">
                ₹{minPrice} <span className="text-[10px] font-normal text-slate-500">onwards</span>
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-500">
                Unavailable
              </span>
            )}
            
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Loading Skeleton ---
function EventsLoader() {
  return (
    <div className="min-h-screen bg-[#020617] p-6">
      <div className="h-[50vh] bg-white/5 rounded-3xl animate-pulse mb-8" />
      <div className="flex gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-10 w-24 bg-white/5 rounded-full animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}