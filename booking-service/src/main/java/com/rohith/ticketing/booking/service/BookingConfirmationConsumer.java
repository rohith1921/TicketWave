package com.rohith.ticketing.booking.service;

import com.rohith.ticketing.booking.entity.Booking;
import com.rohith.ticketing.booking.entity.BookingStatus;
import com.rohith.ticketing.booking.repository.BookingRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Service
public class BookingConfirmationConsumer {
    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper;
    private final EventCacheService eventCacheService;

    public BookingConfirmationConsumer(BookingRepository bookingRepository, ObjectMapper objectMapper, EventCacheService eventCacheService) {
        this.bookingRepository = bookingRepository;
        this.objectMapper = objectMapper;
        this.eventCacheService = eventCacheService;
    }

    @KafkaListener(topics = "payment-success", groupId = "booking-group")
    @Transactional
    public void confirmBooking(String payload) {
        try {
            // 1. Convert JSON string back to Booking object to get the ID
            Booking bookingEvent = objectMapper.readValue(payload, Booking.class);
            Long bookingId = bookingEvent.getId();

//            System.out.println("🎫 Finalizing Booking ID: " + bookingId);

            // 2. Find the actual booking in the DB
            Booking existingBooking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // 3. Update status to CONFIRMED (Idempotency check)
            if (existingBooking.getStatus() == BookingStatus.PENDING) {
                existingBooking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(existingBooking);
                eventCacheService.evictCache();
//                System.out.println("🎉 BOOKING CONFIRMED for ID: " + bookingId);
            } else {
//                System.out.println("⚠️ Booking already processed: " + bookingId);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
