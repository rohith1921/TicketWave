package com.rohith.ticketing.booking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "booking_seats")
@IdClass(BookingSeatId.class)
public class BookingSeat {
    @Id
    @Column(name = "booking_id")
    private Long bookingId;

    @Id
    @Column(name = "seat_id")
    private Long seatId;

    public BookingSeat() {}

    public BookingSeat(Long bookingId, Long seatId) {
        this.bookingId = bookingId;
        this.seatId = seatId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
    }
}
