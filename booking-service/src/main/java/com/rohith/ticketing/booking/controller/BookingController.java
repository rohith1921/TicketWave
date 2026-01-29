package com.rohith.ticketing.booking.controller;

import com.rohith.ticketing.booking.dto.BookingSummaryDto;
import com.rohith.ticketing.booking.entity.Booking;
import com.rohith.ticketing.booking.dto.BookingLockRequest;
import com.rohith.ticketing.booking.security.CustomerDetails;
import com.rohith.ticketing.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @PostMapping("/lock")
    public ResponseEntity<?> lock(@RequestBody BookingLockRequest request,
                     Authentication authentication) {
        try {
            CustomerDetails user =
                    (CustomerDetails) authentication.getPrincipal();

            Long bookingId = bookingService.lockSeats(
                    user.getUserId(),
                    request.getEventId(),
                    request.getSeatIds()
            );
            return ResponseEntity.ok(bookingId);

        } catch(IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage()); // 409 Conflict
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lock failed: " + e.getMessage());
        }

    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingLockRequest request, Principal principal) {
        try {
            // 'principal.getName()' gives us the email from the JWT Token
            Booking booking = bookingService.createBooking(principal.getName(), request);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingSummaryDto>> getMyBookings(Principal principal) {

        return ResponseEntity.ok(bookingService.getUserBookings(principal.getName()));
    }
}
