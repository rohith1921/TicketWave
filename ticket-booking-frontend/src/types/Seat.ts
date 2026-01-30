export type SeatStatus = "AVAILABLE" | "SOLD" | "SELECTED" | "BOOKED";

export interface Seat {
  id: number;
  row: string;
  number: number;
  price: number;
  status: SeatStatus;
}
