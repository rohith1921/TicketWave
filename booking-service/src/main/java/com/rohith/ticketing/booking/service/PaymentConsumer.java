package com.rohith.ticketing.booking.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class PaymentConsumer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    public PaymentConsumer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @KafkaListener(topics = "booking-created", groupId = "payment-group")
    public void onBookingCreated(String payload) {
//        System.out.println("💰 Payment Service received booking: " + payload);

        // Simulate payment processing time (0.5 seconds)
        try {
            Thread.sleep(500);
        } catch (InterruptedException ignored) {}

        // Send 'Payment Success' event back to Kafka
//        System.out.println("✅ Payment Successful. Emitting event...");
        kafkaTemplate.send("payment-success", payload);
    }
}
