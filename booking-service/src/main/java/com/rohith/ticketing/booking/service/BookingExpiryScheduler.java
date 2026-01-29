package com.rohith.ticketing.booking.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class BookingExpiryScheduler {
    private final BookingExpiryService expiryService;

    public BookingExpiryScheduler(BookingExpiryService expiryService) {
        this.expiryService = expiryService;
    }

    @Scheduled(fixedDelay = 60000)
    public void run() {
        long start = System.currentTimeMillis();

        int expired = expiryService.expireBookings();

        long duration = System.currentTimeMillis() - start;

        System.out.println(
                "Expired bookingsL " + expired +
                        ", duration(ms): " + duration
        );
    }
}
