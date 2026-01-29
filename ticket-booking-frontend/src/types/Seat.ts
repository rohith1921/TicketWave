export type SeatStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "LOCKED";

export interface Seat {
  id: number;
  row: string;
  number: number;
  price: number;
  status: SeatStatus;
}
