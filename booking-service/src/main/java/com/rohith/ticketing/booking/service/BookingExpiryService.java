package com.rohith.ticketing.booking.service;

import com.rohith.ticketing.booking.entity.Booking;
import com.rohith.ticketing.booking.entity.BookingSeat;
import com.rohith.ticketing.booking.entity.BookingStatus;
import com.rohith.ticketing.booking.repository.BookingRepository;
import com.rohith.ticketing.booking.repository.BookingSeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingExpiryService {
    private final BookingRepository bookingRepository;
    private final SeatLockService seatLockService;
    private final OutboxService outboxService;
    private final BookingSeatRepository bookingSeatRepository;
    private final EventCacheService eventCacheService;

    public BookingExpiryService(BookingRepository bookingRepository,
                                SeatLockService seatLockService,
                                OutboxService outboxService,
                                BookingSeatRepository bookingSeatRepository,
                                EventCacheService eventCacheService) {
        this.bookingRepository = bookingRepository;
        this.seatLockService = seatLockService;
        this.outboxService = outboxService;
        this.bookingSeatRepository = bookingSeatRepository;
        this.eventCacheService = eventCacheService;
    }

    @Transactional
    public int expireBookings() {
        LocalDateTime now = LocalDateTime.now();

        List<Booking> expired =
                bookingRepository.findByStatusAndExpiresAtBefore(
                        BookingStatus.PENDING,
                        now
                );
        for(Booking booking : expired) {
            booking.setStatus(BookingStatus.CANCELLED);

            seatLockService.unlockSeats(
                    booking.getEventId(),
                    fetchSeatIds(booking.getId())
            );
            outboxService.publishBookingExpired(booking);
        }
        if(!expired.isEmpty()) {
            eventCacheService.evictCache();
        }
        return expired.size();
    }

    private List<Long> fetchSeatIds(Long bookingId) {
        return bookingSeatRepository.findByBookingId(bookingId)
                .stream()
                .map(BookingSeat::getSeatId)
                .toList();
    }
}
