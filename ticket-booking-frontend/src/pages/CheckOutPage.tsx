import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle, ShieldCheck, Timer, Zap 
} from "lucide-react";
import { useBookingStore } from "../store/bookingStore";
import { api } from "../api/axios";
import toast from "react-hot-toast";

// 1. Declare Razorpay on window to avoid TypeScript errors
declare global {
  interface Window { Razorpay: any; }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearSelection } = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Data from previous page
  const { bookingId, amount, seatCount } = location.state || {};
  
  // Calculations
  const totalAmount = amount || 0;
  const tax = totalAmount * 0.18; // 18% GST Mock
  const finalTotal = totalAmount + tax;

  // Countdown Timer (10 Minutes)
  const [timeLeft, setTimeLeft] = useState(600); 

  // Redirect if invalid state
  useEffect(() => {
    if (!bookingId || !amount) {
        navigate("/");
    }
  }, [bookingId, amount, navigate]);

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 🚀 THE NEW PAYMENT HANDLER
  const handlePayment = async () => {
    setLoading(true);

    try {
      // Step 1: Ask Backend to create a Razorpay Order
      const { data } = await api.post("/payments/initiate", { 
        bookingId: bookingId 
      });

      // Step 2: Configure Razorpay Options
      const options = {
        key: "import.meta.env.VITE_RAZORPAY_KEY_ID", // 🔴 REPLACE WITH YOUR TEST KEY ID (rzp_test_...)
        amount: data.orderId ? finalTotal * 100 : 0, // Amount in paise
        currency: "INR",
        name: "TicketWave",
        description: `Booking #${bookingId}`,
        image: `data:image/svg+xml;utf8,%3Csvg%20width%3D%22256%22%20height%3D%22256%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22grad%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%236366f1%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%234f46e5%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%2224%22%20height%3D%2224%22%20rx%3D%226%22%20fill%3D%22url(%23grad)%22%2F%3E%3Cpath%20d%3D%22M2%209a3%203%200%200%201%200%206v2a2%202%200%200%200%202%202h16a2%202%200%200%200%202-2v-2a3%203%200%200%201%200-6V7a2%202%200%200%200-2-2H4a2%202%200%200%200-2%202Z%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E`,
        order_id: data.orderId, // This allows Razorpay to link payment to your backend order
        
        // Step 3: Handle Success
        handler: async function (response: any) {
           try {
             // Verify Signature with Backend
             await api.post("/payments/verify", {
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature
             });
             
             // UI Success State
             setSuccess(true);
             clearSelection();
             setTimeout(() => navigate("/dashboard"), 3000);

           } catch (err) {
             toast.error("Payment Verification Failed! Contact Support.");
           }
        },
        prefill: {
            name: "Test User",
            email: "test@example.com",
            contact: "9999999999"
        },
        theme: {
          color: "#6366f1" // Matches your Primary Color
        }
      };

      // Step 4: Open the Popup
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast.error("Payment Failed: " + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error("Payment initiation failed", error);
      toast.error("Could not start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-[#020617] to-[#020617]" />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center relative z-10"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-slate-400">Your tickets have been booked.</p>
          <p className="text-sm text-slate-500 mt-8">Redirecting to Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-primary/30 pb-12">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-12 relative z-10">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Complete Payment
            </h1>
            <p className="text-slate-400 flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-500" />
              Trusted Payment Gateway by Razorpay
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg flex items-center gap-2 text-red-400 font-mono text-sm">
             <Timer size={16} />
             Time Remaining: {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* LEFT: Order Summary */}
          <div className="space-y-6">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                
                {/* Event Details */}
                <div className="flex gap-4 mb-6">
                   <div className="w-20 h-24 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" alt="Event" />
                   </div>
                   <div>
                      <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Booking ID: #{bookingId}</div>
                      <h2 className="text-xl font-bold text-white leading-tight">Concert Event Name</h2>
                      <p className="text-slate-400 text-sm mt-1">{seatCount} Seats Selected</p>
                   </div>
                </div>

                {/* Price Table */}
                <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tax (18% GST)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
                     <span className="font-bold text-white text-lg">Total Payable</span>
                     <span className="font-bold text-primary text-3xl">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
             </div>
          </div>

          {/* RIGHT: Payment Action */}
          <div className="flex flex-col justify-center">
             <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-primary/20 rounded-2xl p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Pay Securely</h3>
                    <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                        Click below to open the secure payment gateway. Supports UPI, Cards, and Netbanking.
                    </p>

                    <button 
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {loading ? "Initializing Gateway..." : `Pay ₹${finalTotal.toLocaleString()}`}
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        {/* You can add simple images of Visa/UPI logos here if you want */}
                        <span className="text-xs text-slate-500">Secured by Razorpay</span>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}