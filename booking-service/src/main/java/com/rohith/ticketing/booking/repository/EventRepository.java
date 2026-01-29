package com.rohith.ticketing.booking.repository;

import com.rohith.ticketing.booking.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {

}
