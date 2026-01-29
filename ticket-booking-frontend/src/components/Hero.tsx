import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuthStore } from "../store/authStore"; 

export default function Hero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  
  // 1. Get Authentication State directly
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); 

  const handleSearch = () => {
    // Validation: Stop if input is empty
    if (!query.trim()) return;
    
    // 2. Explicit Logic (No Wrapper Functions)
    if (isAuthenticated) {
        // ✅ Logged In? -> Go to Search Results
        navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
        // ❌ Logged Out? -> Redirect to Login
        navigate("/login");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-pulse-slow" 
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2)",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#020617]" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl w-full px-6">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
          Live the Moment
        </h1>
        
        <p className="text-lg text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
          Discover the world's best events.{" "}
          {!isAuthenticated && (
             <span className="text-primary font-bold">Login required to search.</span>
          )}
        </p>

        {/* Search Bar */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-2 rounded-2xl flex gap-2 shadow-2xl transition-all focus-within:bg-white/15">
          <div className="flex-1 flex items-center px-4">
             <Search className="text-white/60 mr-3" size={20} />
             <input
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Search event, artist or venue..."
               className="w-full bg-transparent outline-none text-white placeholder-white/50 text-lg font-medium"
             />
          </div>
          <button 
            type="button"
            onClick={handleSearch}
            className="px-8 py-4 rounded-xl bg-primary hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-primary/30"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}