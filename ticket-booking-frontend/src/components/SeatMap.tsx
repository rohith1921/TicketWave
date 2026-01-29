import Seat from "./Seat";
import { useBookingStore } from "../store/bookingStore";
import type { Seat as SeatType } from "../types/Seat";

export default function SeatMap({ seats }: { seats: SeatType[] }) {
  const { selectedSeatIds, selectSeat, unselectSeat } = useBookingStore();

  return (
    <div className="grid grid-cols-10 gap-3">
      {seats.map((seat) => {
        const selected = selectedSeatIds.includes(seat.id);

        return (
          <Seat
            key={seat.id}
            id={seat.id}
            status={seat.status}
            selected={selected}
            onClick={() =>
              selected ? unselectSeat(seat.id) : selectSeat(seat.id)
            }
          />
        );
      })}
    </div>
  );
}
