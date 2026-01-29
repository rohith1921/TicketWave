package com.rohith.ticketing.booking.controller;

import com.rohith.ticketing.booking.dto.PaymentRequest;
import com.rohith.ticketing.booking.entity.Booking;
import com.rohith.ticketing.booking.entity.Payment;
import com.rohith.ticketing.booking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // 1. Start Payment
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, Long> request) {
        String orderId = paymentService.createOrder(request.get("bookingId"));
        return ResponseEntity.ok(Map.of("orderId", orderId));
    }

    // 2. Complete Payment
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
        Booking booking = paymentService.verifyPayment(
                request.get("razorpay_order_id"),
                request.get("razorpay_payment_id"),
                request.get("razorpay_signature")
        );
        return ResponseEntity.ok(booking);
    }
}
