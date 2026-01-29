package com.rohith.ticketing.booking.service;

import com.rohith.ticketing.booking.entity.Booking;
import com.rohith.ticketing.booking.entity.Outbox;
import com.rohith.ticketing.booking.repository.OutboxRepository;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

@Service
public class OutboxService {
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public OutboxService(OutboxRepository outboxRepository,
                         ObjectMapper objectMapper) {
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
    }

    public void publishBookingCreated(Booking booking) {
        Outbox event = new Outbox();
        event.setAggregateType("BOOKING");
        event.setAggregateId(booking.getId());
        event.setEventType("BOOKING_CREATED");
        event.setProcessed(false);
        event.setCreatedAt(LocalDateTime.now());

        try {
            event.setPayload(
                    objectMapper.writeValueAsString(booking)
            );
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        outboxRepository.save(event);
    }

    public void publishBookingExpired(Booking booking) {
        Outbox event = new Outbox();
        event.setAggregateType("BOOKING");
        event.setAggregateId(booking.getId());
        event.setEventType("BOOKING_EXPIRED");
        event.setProcessed(false);
        event.setCreatedAt(LocalDateTime.now());

        // Simple JSON payload
        event.setPayload("{\"bookingId\":" + booking.getId() + "}");

        outboxRepository.save(event);
    }
}
