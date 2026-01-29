package com.rohith.ticketing.booking.controller;

import com.rohith.ticketing.booking.dto.SeatDto;
import com.rohith.ticketing.booking.entity.Booking;
import com.rohith.ticketing.booking.entity.Event;
import com.rohith.ticketing.booking.entity.Seat;
import com.rohith.ticketing.booking.repository.BookingRepository;
import com.rohith.ticketing.booking.repository.EventRepository;
import com.rohith.ticketing.booking.repository.SeatRepository;
import com.rohith.ticketing.booking.service.EventCacheService;
import com.rohith.ticketing.booking.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {
    private final EventCacheService eventCacheService;
    private final EventService eventService;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventCacheService.getEvents();
    }

//    @GetMapping("{id}/seats")
//    public ResponseEntity<List<SeatDto>> getSeats(@PathVariable Long id) {
//        return ResponseEntity.ok(eventService.getSeatsForEvent(id));
//    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Event not found with id: "+ id));
        return ResponseEntity.ok(event);
    }

    @GetMapping("/{eventId}/seats")
    public ResponseEntity<List<SeatDto>> getSeatsForEvent(@PathVariable Long eventId) {

        // 1. Find the Event (to get the Venue ID)
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // 2. Get ALL physical seats for this Venue
        List<Seat> allSeats = seatRepository.findByVenueId(event.getVenue().getId());

        // 3. Get ALL Booked Seat IDs for this specific Event
        // (We assume you have a method to find bookings by event)
        List<Booking> eventBookings = bookingRepository.findByEventId(eventId);

        // Flatten the bookings to get a Set of ALL booked seat IDs (for fast lookup)
        Set<Long> bookedSeatIds = eventBookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus().name())) // Ignore cancelled
                .flatMap(b -> b.getSeats().stream())
                .map(Seat::getId)
                .collect(Collectors.toSet());

        // 4. Map Physical Seats to "SeatResponse" DTOs
        List<SeatDto> response = allSeats.stream().map(seat -> {
            String status = "AVAILABLE";

            // If the seat ID is in our booked list, mark it SOLD
            if (bookedSeatIds.contains(seat.getId())) {
                status = "SOLD";
            }

            return new SeatDto(
                    seat.getId(),
                    seat.getSeatNumber(),
                    status,       // Calculated dynamically!
                    seat.getPrice() // Comes from DB now
            );
        }).toList();

        return ResponseEntity.ok(response);
    }


}
