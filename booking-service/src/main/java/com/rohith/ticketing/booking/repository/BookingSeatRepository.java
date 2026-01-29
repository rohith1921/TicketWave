package com.rohith.ticketing.booking.repository;

import com.rohith.ticketing.booking.entity.BookingSeat;
import com.rohith.ticketing.booking.entity.BookingSeatId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, BookingSeatId> {
    List<BookingSeat> findByBookingId(Long bookingId);
}
