package com.rohith.ticketing.booking.service;

import com.rohith.ticketing.booking.dto.SeatDto;
import com.rohith.ticketing.booking.entity.Booking;
import com.rohith.ticketing.booking.entity.Event;
import com.rohith.ticketing.booking.entity.Seat;
import com.rohith.ticketing.booking.repository.BookingRepository;
import com.rohith.ticketing.booking.repository.EventRepository;
import com.rohith.ticketing.booking.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<SeatDto> getSeatsForEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException("Event not found"));

        List<Seat> allSeats = seatRepository.findByVenueId(event.getVenue().getId());

        List<Booking> eventBookings = bookingRepository.findByEventId(eventId);

        Set<Long> bookedSeatIds = eventBookings.stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .flatMap(b ->b.getSeats().stream())
                .map(Seat::getId)
                .collect(Collectors.toSet());
        return allSeats.stream()
                .map(seat -> new SeatDto(
                        seat.getId(),
                        seat.getSeatNumber(),
                        bookedSeatIds.contains(seat.getId()) ? "BOOKED" : "AVAILABLE",
                        seat.getPrice()
                ))
                .collect(Collectors.toList());
    }
}
