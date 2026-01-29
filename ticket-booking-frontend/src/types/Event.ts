export interface Event {
  id: number;
  name: string;
  eventTime: string;
  date: string;
  imageUrl?: string;

  venue: {
    id: number;
    name: string;
    city: string;
  }
}
