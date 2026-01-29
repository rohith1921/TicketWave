package com.rohith.ticketing.booking.dto;

import com.rohith.ticketing.booking.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class BookingSummaryDto {
    private Long id;
    private String eventTitle;
    private String venueName;
    private LocalDateTime eventDate;
    private List<String> seatNumbers;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private String qrCodeData;
}
