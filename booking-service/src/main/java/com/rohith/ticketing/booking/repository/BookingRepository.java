package com.rohith.ticketing.booking.repository;

import com.rohith.ticketing.booking.entity.Booking;
import com.rohith.ticketing.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStatusAndExpiresAtBefore(BookingStatus status, LocalDateTime time);
    List<Booking> findByEventId(Long eventId);
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("""
        SELECT COUNT(b) > 0 
        FROM Booking b 
        JOIN b.seats s 
        WHERE b.eventId = :eventId 
        AND b.status <> 'CANCELLED' 
        AND s.id IN :seatIds
    """)
    boolean existsByEventIdAndSeatIdsAndStatusNotCancelled(
            @Param("eventId") Long eventId,
            @Param("seatIds") List<Long> seatIds
    );
}
