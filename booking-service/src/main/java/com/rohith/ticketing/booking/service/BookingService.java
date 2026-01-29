package com.rohith.ticketing.booking.service;

import com.rohith.ticketing.booking.dto.BookingLockRequest;
import com.rohith.ticketing.booking.dto.BookingSummaryDto;
import com.rohith.ticketing.booking.entity.*;
import com.rohith.ticketing.booking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Duration BOOKING_TTL =
            Duration.ofMinutes(5);

    private final BookingRepository bookingRepository;
    private final OutboxService outboxService;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;

    @Transactional
    public Long lockSeats(Long userId,
                          Long eventId,
                          List<Long> seatIds) {



        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        seatRepository.lockSeats(seatIds);

        List<Seat> selectedSeats = seatRepository.findAllById(seatIds);
        if(selectedSeats.size() != seatIds.size()) {
            throw new RuntimeException("Invalid seat IDs provided");
        }

        boolean seatsAreTaken = bookingRepository.existsByEventIdAndSeatIdsAndStatusNotCancelled(
                eventId,
                seatIds
        );

        if (seatsAreTaken) {
            throw new IllegalStateException("Seats already booked or locked by another user");
        }


        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setEventId(eventId);
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setExpiresAt(
                LocalDateTime.now().plus(BOOKING_TTL)
        );

        booking.setSeats(selectedSeats);

        bookingRepository.save(booking);


//        if(outboxService != null) {
//            outboxService.publishBookingCreated(booking);
//        }

        return booking.getId();
    }

    @Transactional // 👈 Critical: If anything fails, roll back everything
    public Booking createBooking(String userEmail, BookingLockRequest request) {

        // 1. Find User
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find Event
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // 3. Find Seats
        List<Seat> selectedSeats = seatRepository.findAllById(request.getSeatIds());
        if (selectedSeats.size() != request.getSeatIds().size()) {
            throw new RuntimeException("Some seats seem to be invalid!");
        }

        // 4. CHECK AVAILABILITY (Prevent Double Booking)
        // We check if any of these seats are already booked for this event
        boolean seatsAreTaken = bookingRepository.findByEventId(request.getEventId()).stream()
                .filter(b -> b.getStatus()  !=BookingStatus.CANCELLED) // Ignore cancelled
                .flatMap(b -> b.getSeats().stream())             // Get all booked seats
                .anyMatch(bookedSeat -> request.getSeatIds().contains(bookedSeat.getId()));

        if (seatsAreTaken) {
            throw new RuntimeException("Oh no! One of these seats was just booked by someone else.");
        }

        // 5. Create the Booking
        Booking booking = new Booking();
        booking.setUserId(user.getId());
        booking.setEventId(event.getId());
        booking.setSeats(selectedSeats);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setCreatedAt(LocalDateTime.now());

        booking.setExpiresAt(LocalDateTime.now().plusMinutes(15));

        return bookingRepository.save(booking);
    }

    public List<BookingSummaryDto> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return bookings.stream().map(b -> {
            // Fetch Event to get Title/Venue (Assuming Lazy Loading or Fetch Join)
            Event event = eventRepository.findById(b.getEventId()).orElse(null);

            // Convert Seat Objects to String List e.g. "A1"
            List<String> seatNums = b.getSeats().stream()
                    .map(s -> String.valueOf(s.getSeatNumber())) // Or s.getSeatNumber() if it's int
                    .toList();

            String qrCodeString = null;
            if (b.getStatus() == BookingStatus.CONFIRMED) {
                // In real app, encrypt this string!
                qrCodeString = "TICKET-" + b.getId() + "-" + user.getId();
            }

            return new BookingSummaryDto(
                    b.getId(),
                    event != null ? event.getName() : "Unknown Event",
                    event != null ? event.getVenue().getName() : "Unknown Venue",
                    event != null ? event.getEventTime() : null,
                    seatNums,
                    b.getTotalPrice(),
                    b.getStatus(),
                    qrCodeString
            );
        }).toList();
    }
}

