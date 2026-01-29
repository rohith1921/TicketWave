package com.rohith.ticketing.booking.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "outbox")
public class Outbox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ADDED: nullable = false
    @Column(name = "aggregate_type", nullable = false)
    private String aggregateType;

    // ADDED: nullable = false (This was the specific error)
    @Column(name = "aggregate_id", nullable = false)
    private Long aggregateId;

    // ADDED: nullable = false
    @Column(name = "event_type", nullable = false)
    private String eventType;

    // ADDED: nullable = false
    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private String payload;

    // ADDED: nullable = false
    @Column(nullable = false)
    private Boolean processed;

    // ADDED: nullable = false
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Getters and Setters
    public void setAggregateType(String type) { this.aggregateType = type; }
    public void setAggregateId(Long id) { this.aggregateId = id; }
    public void setEventType(String type) { this.eventType = type; }
    public void setPayload(String payload) { this.payload = payload; }
    public void setProcessed(Boolean processed) { this.processed = processed; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // You likely need getters too, though not strictly for this error
    public Long getId() { return id; }
    public String getAggregateType() { return aggregateType; }
    public Long getAggregateId() { return aggregateId; }
    public String getEventType() { return eventType; }
    public String getPayload() { return payload; }
    public Boolean getProcessed() { return processed; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}