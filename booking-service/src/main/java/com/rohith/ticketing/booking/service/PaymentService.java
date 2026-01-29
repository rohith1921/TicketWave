package com.rohith.ticketing.booking.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.rohith.ticketing.booking.entity.Booking;
import com.rohith.ticketing.booking.entity.BookingStatus;
import com.rohith.ticketing.booking.entity.Payment;
import com.rohith.ticketing.booking.repository.BookingRepository;
import com.rohith.ticketing.booking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    // 🚀 STEP 1: CREATE ORDER (Do not confirm booking yet)
    @Transactional
    public String createOrder(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Booking is already confirmed!");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            BigDecimal subtotal = booking.getTotalPrice();
            BigDecimal taxRate = new BigDecimal("0.18");
            BigDecimal taxAmount = subtotal.multiply(taxRate);
            BigDecimal finalAmount = subtotal.add(taxAmount);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", finalAmount.multiply(new BigDecimal(100))); // Amount in Paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "booking_" + bookingId);

            Order order = razorpay.orders.create(orderRequest);
            String orderId = order.get("id");

            // Save the "Pending" Payment record
            Payment payment = new Payment();
            payment.setBookingId(bookingId);
            payment.setAmount(finalAmount);
            payment.setStatus("PENDING");
            payment.setReferenceId(orderId);
            payment.setIdempotencyKey(UUID.randomUUID().toString());
            payment.setCreatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            return orderId;

        } catch (Exception e) {
            throw new RuntimeException("Razorpay Failed: " + e.getMessage());
        }
    }

    // 🚀 STEP 2: VERIFY PAYMENT (Confirm booking only if signature matches)
    @Transactional
    public Booking verifyPayment(String orderId, String paymentId, String signature) {

        Payment payment = paymentRepository.findByReferenceId(orderId)
                .orElseThrow(() -> new RuntimeException("Invalid Order ID"));

        try {
            // Verify Signature using Razorpay Utils
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

            if (isValid) {
                // ✅ Success! Now we confirm the booking
                payment.setStatus("SUCCESS");
                payment.setReferenceId(paymentId); // Update with actual payment ID
                paymentRepository.save(payment);

                Booking booking = bookingRepository.findById(payment.getBookingId()).get();
                booking.setStatus(BookingStatus.CONFIRMED);
                booking.setUpdatedAt(LocalDateTime.now());
                return bookingRepository.save(booking);
            } else {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
                throw new IllegalStateException("Payment Signature Verification Failed");
            }

        } catch (Exception e) {
            throw new RuntimeException("Verification Error: " + e.getMessage());
        }
    }
}