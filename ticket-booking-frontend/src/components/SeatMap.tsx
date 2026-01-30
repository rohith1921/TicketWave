import Seat from "./Seat";
import { useBookingStore } from "../store/bookingStore";
import type { Seat as SeatType } from "../types/Seat";

export default function SeatMap({ seats }: { seats: SeatType[] }) {
  const { selectedSeatIds, toggleSeat } = useBookingStore();

  return (
    <div className="grid grid-cols-10 gap-3">
      {seats.map((seat) => {
        const selected = selectedSeatIds.includes(seat.id);

        return (
          <Seat
            key={seat.id}
            id={seat.id}
            seatNumber={seat.number}
            status={seat.status}
            selected={selected}
            onClick={() =>
              toggleSeat(seat.id)
            }
          />
        );
      })}
    </div>
  );
}
