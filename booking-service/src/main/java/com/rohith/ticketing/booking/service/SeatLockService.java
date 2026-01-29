package com.rohith.ticketing.booking.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class SeatLockService {

    private static final long LOCK_TTL_SECONDS = 300; // 5 minutes
    private final RedisTemplate<String, String> redisTemplate;

    public SeatLockService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean lockSeats(Long eventId, List<Long> seatIds, Long userId) {
        List<String> lockedKeys = new ArrayList<>();

        for (Long seatId : seatIds) {
            String key = buildKey(eventId, seatId);

            // setIfAbsent is the Atomic command "SETNX" (Set if Not Exists)
            Boolean success = redisTemplate.opsForValue()
                    .setIfAbsent(key, userId.toString(), LOCK_TTL_SECONDS, TimeUnit.SECONDS);

            if (Boolean.TRUE.equals(success)) {
                // Lock acquired successfully
                lockedKeys.add(key);
            } else {
                // Lock FAILED. Someone else holds this seat.
                // CRITICAL: Release any locks we managed to get in this loop so far.
                unlockKeys(lockedKeys);
                return false;
            }
        }
        return true; // All seats locked successfully
    }

    public void unlockSeats(Long eventId, List<Long> seatIds) {
        List<String> keys = seatIds.stream()
                .map(seatId -> buildKey(eventId, seatId))
                .toList();
        unlockKeys(keys);
    }

    private void unlockKeys(List<String> keys) {
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    private String buildKey(Long eventId, Long seatId) {
        // Key Pattern: lock:event:101:seat:5
        return "lock:event:" + eventId + ":seat:" + seatId;
    }
}