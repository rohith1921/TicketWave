import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookingStore } from "../store/bookingStore";
import { api } from "../api/axios";
import Seat from "../components/Seat";
import { Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

type SeatStatus = "AVAILABLE" | "SELECTED" |"BOOKED";

interface SeatData {
  id: number;
  seatNumber: number;
  status: SeatStatus;
  price: number;
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedSeatIds, toggleSeat, clearSelection } = useBookingStore();
  
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSeats = () => {
      api.get(`/events/${id}/seats`)
        .then((res) => {
           // We only update if data changed to avoid flickering (React handles diffing)
           setSeats(res.data);
           // We turn off the big loading spinner after the first load
           setLoading(false); 
        })
        .catch((err) => console.error("Polling error", err));
    };

    // 1. Initial Load
    fetchSeats();

    // 2. Set Interval (Every 2 seconds)
    const interval = setInterval(fetchSeats, 2000);

    // 3. Cleanup on unmount
    return () => clearInterval(interval);

  }, [id]);

  useEffect(() => {
    clearSelection();
  }, [id, clearSelection]);

  // Simulate API Fetch
  useEffect(() => {
    if(!id) return;

    setLoading(true);

    api.get(`/events/${id}/seats`)
      .then((res) => {
        setSeats(res.data);
      })
      .catch((err) => {
        console.error("Failed to load seats", err);
        toast.error("Could not load seat map.");
      })
      .finally(()=> {
        setLoading(false);
      })
  }, [id]);

  const selectedSeatsData = useMemo(() => {
    return seats.filter(seat => selectedSeatIds.includes(seat.id));
  }, [seats, selectedSeatIds]);

  const totalAmount = useMemo(() => {
    return selectedSeatsData.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeatsData]);

  const handleBooking = async () => {
    if (selectedSeatIds.length === 0) {
      return;
    }

    setIsProcessing(true);

    try {
      const res = await api.post("/booking/lock", {
        eventId: Number(id),
        seatIds: selectedSeatIds
      });

      // 🚀 The POST Request
     navigate("/checkout", {
      state: {
        bookingId: res.data,
        amount: totalAmount,
        seatCount: selectedSeatIds.length
      }
     });
      
    } catch (error: any) {
      console.error("Booking Error: ", error);
      if(error.response?.status === 409 || error.response?.status === 500) {
        toast.error("Someone just took these seats! Please choose others.");
        window.location.reload();
      } else {
        toast.error("Could not lock seats. Try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-dark text-white">
      

      <main className="container mx-auto px-4 pt-24 pb-12 flex flex-col md:flex-row gap-8">
        
        {/* LEFT: SEAT MAP */}
        <div className="flex-1 bg-slate-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Select Seats</h1>
              <p className="text-gray-400 text-sm">Coldplay: Music of the Spheres</p>
            </div>
          </div>

          {/* Stage Visual */}
          <div className="w-full h-12 bg-gradient-to-b from-primary/20 to-transparent rounded-t-full mb-12 flex items-center justify-center border-t border-primary/30">
            <span className="text-primary text-xs font-bold uppercase tracking-[0.5em]">Stage</span>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 justify-items-center max-w-2xl mx-auto">
              
              {seats.map((seat) => (
                <Seat 
                  key={seat.id}
                  id={seat.id}
                  seatNumber={seat.seatNumber}
                  selected={selectedSeatIds.includes(seat.id)} 
                  status={selectedSeatIds.includes(seat.id) ? 'SELECTED' : seat.status}
                  onClick={() => toggleSeat(seat.id)}
                />
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 rounded bg-slate-700 border-b-2 border-slate-800"></div> Available
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 rounded bg-primary border-b-2 border-indigo-900"></div> Selected
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 rounded bg-slate-800 opacity-50 border-b-2 border-slate-900"></div> Sold
            </div>
          </div>
        </div>

        {/* RIGHT: SUMMARY CARD */}
        <div className="w-full md:w-96">
          <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Booking Summary</h2>
            
            {selectedSeatIds.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Select seats to proceed
              </div>
            ) : (
              <div className="space-y-4">
                {selectedSeatsData.map((seat) => (
                  <div key={seat.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                    <span className="text-sm font-medium">Seat {seat.seatNumber}</span>
                    <span className="text-sm text-gray-400">₹{seat.price.toLocaleString()}</span>
                  </div>
                ))}
                
                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBooking}
                  disabled={selectedSeatIds.length === 0 || isProcessing}
                  className="w-full bg-primary hover:bg-indigo-500 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 mt-4"
                >
                  {isProcessing ? "Locking Seats..." : "Proceed to Checkout"}
                  {/* <CheckCircle className="w-4 h-4" /> */}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}