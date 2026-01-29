import toast from 'react-hot-toast';
import { create } from 'zustand';

interface BookingState {
  selectedSeatIds: number[];
  toggleSeat: (id: number) => void;
  clearSelection: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedSeatIds: [],

  toggleSeat: (id) => set((state) => {
    const isSelected = state.selectedSeatIds.includes(id);
    if (isSelected) {
      // Remove if already selected
      return { selectedSeatIds: state.selectedSeatIds.filter((sid) => sid !== id) };
    } else {
      // Add if not selected (Limit to max 6 seats if you want)
      if (state.selectedSeatIds.length >= 6) {
        toast.error("You can only select up to 6 seats.");
        return state;
      }
      return { selectedSeatIds: [...state.selectedSeatIds, id] };
    }
  }),

  clearSelection: () => set({ selectedSeatIds: [] }),
}));