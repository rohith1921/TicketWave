package com.rohith.ticketing.booking.controller;

import com.rohith.ticketing.booking.service.SeatLockService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/test/lock")
public class TestLockController {
    private final SeatLockService seatLockService;

    public TestLockController(SeatLockService seatLockService) {
        this.seatLockService = seatLockService;
    }

    @PostMapping
    public String testLock(@RequestParam Long eventId,
                           @RequestParam Long userId,
                           @RequestBody List<Long> seatIds) {
        boolean success = seatLockService.lockSeats(eventId, seatIds, userId);

        if(success) {
            return "LOCKED successfully by User "+ userId;
        } else {
            return "FAILED to lock. Seats are busy.";
        }
    }
}
