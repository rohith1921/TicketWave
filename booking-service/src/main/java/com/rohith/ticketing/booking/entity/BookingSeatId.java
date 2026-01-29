package com.rohith.ticketing.booking.entity;

import java.io.Serializable;
import java.util.Objects;

public class BookingSeatId implements Serializable {
    private Long bookingId;
    private Long seatId;

    public BookingSeatId() {}

    public BookingSeatId(Long bookingId, Long seatId) {
        this.bookingId = bookingId;
        this.seatId = seatId;
    }

    @Override
    public boolean equals(Object o) {
        if(this == o) return true;
        if(o == null || getClass() != o.getClass()) return  false;
        BookingSeatId that = (BookingSeatId) o;
        return Objects.equals(bookingId, that.bookingId) &&
                Objects.equals(seatId, that.seatId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingId, seatId);
    }


}
