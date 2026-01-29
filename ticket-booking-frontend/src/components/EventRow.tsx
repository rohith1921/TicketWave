import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Event } from "../types/Event";
import EventCard from "./EventCard";

interface EventRowProps {
  title: string;
  events: Event[];
}

export default function EventRow({ title, events }: EventRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const slide = (shift: number) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: shift, behavior: "smooth" });
    }
  };

  if (events.length === 0) return null;

  return (
    <div className="space-y-4 my-8 group">
      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-white px-6 md:px-12">
        {title}
      </h2>

      {/* Slider Container */}
      <div className="relative group">
        
        {/* Left Arrow (Only visible on hover) */}
        <button
          onClick={() => slide(-500)}
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 text-white w-12 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeft size={40} />
        </button>

        {/* Scrollable Row */}
        <div
          ref={rowRef}
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-hide px-6 md:px-12 pb-4 scroll-smooth"
        >
          {events.map((event) => (
            // Fixed Width for Cards ensures they look uniform in a row
            <div key={event.id} className="min-w-[280px] md:min-w-[320px] h-full">
              <EventCard event={event} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => slide(500)}
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 text-white w-12 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronRight size={40} />
        </button>
      </div>
    </div>
  );
}