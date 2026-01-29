package com.rohith.ticketing.booking.dto;

import lombok.Data;

import java.util.List;

@Data
public class BookingLockRequest {
    private Long eventId;
    private List<Long> seatIds;
}
