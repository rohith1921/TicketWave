package com.rohith.ticketing.booking.service;

import com.rohith.ticketing.booking.entity.Event;
import com.rohith.ticketing.booking.repository.EventRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

@Service
public class EventCacheService {
    private static final Duration TTL = Duration.ofMinutes(10);
    private static final String KEY = "cache:events";

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final EventRepository eventRepository;

    public EventCacheService(RedisTemplate<String, String> redisTemplate, ObjectMapper objectMapper, EventRepository eventRepository) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.eventRepository = eventRepository;
    }

    public List<Event> getEvents() {
        String cached = redisTemplate.opsForValue().get(KEY);

        if(cached != null) {
            try {
                System.out.println("Serving Events from REDIS CACHE");
                return Arrays.asList(objectMapper.readValue(cached, Event[].class));
            } catch (Exception e) {
                System.err.println("Cache deserialization failed. Falling back to DB.");
            }
        }

        List<Event> events = eventRepository.findAll();

        try {
            redisTemplate.opsForValue().set(
                    KEY,
                    objectMapper.writeValueAsString(events),
                    TTL
            );
        } catch (Exception e) {
            System.err.println("Failed to update cache.");
        }

        return events;
    }

    public void evictCache() {
        redisTemplate.delete(KEY);
        System.out.println("Event Cache Cleared");
    }
}
