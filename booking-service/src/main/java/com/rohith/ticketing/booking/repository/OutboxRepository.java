package com.rohith.ticketing.booking.repository;

import com.rohith.ticketing.booking.entity.Outbox;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutboxRepository extends JpaRepository<Outbox, Long> {
    List<Outbox> findTop10ByProcessedFalseOrderByCreatedAtAsc();

}
