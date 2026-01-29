import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Ticket, LayoutDashboard, LogOut, 
  LogIn, User, Sparkles 
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/axios";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export default function Navbar() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (token) {
      api.get("/users/me")
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Failed to fetch user profile", err));
    } else {
      setUser(null);
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* LOGO */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group z-50 relative"
            onClick={closeMenu}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-primary/50 transition-all duration-300">
               <Ticket size={20} className="transform group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Ticket<span className="text-primary">Wave</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/events" 
              className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wide"
            >
              <Sparkles size={16} className="text-primary" />
              Events
            </Link>

            {token ? (
              <div className="flex items-center gap-6 pl-6 border-l border-white/10">
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/20 transition-all text-sm font-bold"
                >
                  <LogOut size={16} />
                  Logout
                </button>
                
                {/* 🚀 FIXED: Desktop User Profile (No Tooltip, Name Visible) */}
                <div className="flex items-center gap-3">
                   {/* Name Text (Visible on larger screens) */}
                   <div className="hidden lg:block text-right">
                       <p className="text-sm font-bold text-white leading-none">
                         {user?.name || "User"}
                       </p>
                       {/* <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
                         Member
                       </p> */}
                   </div>

                   {/* Icon Only */}
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                      <User size={20} />
                   </div>
                </div>

              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5"
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
          </div>

          {/* MOBILE TOGGLE BUTTON */}
          <button 
            className="md:hidden text-white p-2 z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[#020617] border-l border-white/10 shadow-2xl z-[70] md:hidden overflow-y-auto"
            >
              <div className="p-6 flex flex-col h-full">
                
                {/* DYNAMIC MOBILE PROFILE */}
                <div className="mb-8 mt-12">
                   {token && user ? (
                     <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                           <User size={24} />
                        </div>
                        <div className="overflow-hidden">
                           <p className="text-white font-bold truncate">Hello, {user.name}</p>
                           <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                     </div>
                   ) : (
                     <div className="text-slate-400 text-sm">
                       Welcome to TicketWave. <br />
                       <span className="text-white font-bold">Please login to continue.</span>
                     </div>
                   )}
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-2 space-y-1">
                  <Link 
                    to="/events" 
                    onClick={closeMenu}
                    className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 text-lg font-medium text-slate-300 active:text-white transition-colors"
                  >
                    <Sparkles size={22} className="text-primary" />
                    Browse Events
                  </Link>

                  {token ? (
                    <>
                      <Link 
                        to="/dashboard" 
                        onClick={closeMenu}
                        className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 text-lg font-medium text-slate-300 active:text-white transition-colors"
                      >
                        <LayoutDashboard size={22} className="text-blue-400" />
                        My Dashboard
                      </Link>
                    </>
                  ) : null}
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-6 border-t border-white/10">
                  {token ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-all"
                    >
                      <LogOut size={20} />
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25"
                    >
                      <LogIn size={20} />
                      Login
                    </Link>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}