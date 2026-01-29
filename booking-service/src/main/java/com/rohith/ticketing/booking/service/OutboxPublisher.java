package com.rohith.ticketing.booking.service;


import com.rohith.ticketing.booking.entity.Outbox;
import com.rohith.ticketing.booking.repository.OutboxRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OutboxPublisher {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public OutboxPublisher(OutboxRepository outboxRepository, KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxRepository = outboxRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Transactional
    @Scheduled(fixedDelay = 1000)
    public void publish() {

        List<Outbox> events =
                outboxRepository
                        .findTop10ByProcessedFalseOrderByCreatedAtAsc();

        for (Outbox event : events) {

            try {
                // 🔜 Kafka publish will go here (Phase 7)
                String topic;
                if("BOOKING_CREATED".equals(event.getEventType())) {
                    topic = "booking-created";
                } else if ("BOOKING_EXPIRED".equals(event.getEventType())) {
                    topic = "booking-expired";
                } else {
//                    System.err.println("Unknown event type: " + event.getEventType());
                    event.setProcessed(true);
                    continue;
                }

//                System.out.println("Sending to Kafka: "+ topic);
                kafkaTemplate.send(topic, event.getPayload());

                event.setProcessed(true);

            } catch (Exception e) {
                // DO NOT mark processed
                // Retry next cycle
//                System.err.println("❌ Kafka publish failed for ID: " + event.getId());
                e.printStackTrace();
            }
        }
    }
}

