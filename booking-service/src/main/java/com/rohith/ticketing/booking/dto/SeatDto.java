package com.rohith.ticketing.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SeatDto {
    private Long id;
    private Integer seatNumber;
    private String status;
    private BigDecimal price;

}
