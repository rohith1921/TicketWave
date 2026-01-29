CREATE TABLE users (
                       id              BIGSERIAL PRIMARY KEY,
                       email           VARCHAR(255) NOT NULL UNIQUE,
                       password_hash   VARCHAR(255) NOT NULL,
                       role            VARCHAR(20)  NOT NULL,
                       created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venues (
                        id          BIGSERIAL PRIMARY KEY,
                        name        VARCHAR(255) NOT NULL,
                        city        VARCHAR(100) NOT NULL
);

CREATE TABLE events (
                        id              BIGSERIAL PRIMARY KEY,
                        venue_id        BIGINT NOT NULL,
                        name            VARCHAR(255) NOT NULL,
                        event_time      TIMESTAMP NOT NULL,
                        created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                        CONSTRAINT fk_event_venue
                            FOREIGN KEY (venue_id) REFERENCES venues(id)
);

CREATE TABLE seats (
                       id          BIGSERIAL PRIMARY KEY,
                       venue_id    BIGINT NOT NULL,
                       seat_number VARCHAR(10) NOT NULL,

                       CONSTRAINT fk_seat_venue
                           FOREIGN KEY (venue_id) REFERENCES venues(id),

                       CONSTRAINT uq_seat UNIQUE (venue_id, seat_number)
);

CREATE TABLE bookings (
                          id              BIGSERIAL PRIMARY KEY,
                          user_id         BIGINT NOT NULL,
                          event_id        BIGINT NOT NULL,
                          status          VARCHAR(20) NOT NULL,
                          expires_at      TIMESTAMP NOT NULL,
                          version         INTEGER NOT NULL,
                          created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_booking_user
                              FOREIGN KEY (user_id) REFERENCES users(id),

                          CONSTRAINT fk_booking_event
                              FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE booking_seats (
                               booking_id BIGINT NOT NULL,
                               seat_id    BIGINT NOT NULL,

                               PRIMARY KEY (booking_id, seat_id),

                               CONSTRAINT fk_bs_booking
                                   FOREIGN KEY (booking_id) REFERENCES bookings(id),

                               CONSTRAINT fk_bs_seat
                                   FOREIGN KEY (seat_id) REFERENCES seats(id)
);

CREATE TABLE payments (
                          id                  BIGSERIAL PRIMARY KEY,
                          booking_id          BIGINT NOT NULL,
                          amount              NUMERIC(10,2) NOT NULL,
                          status              VARCHAR(20) NOT NULL,
                          idempotency_key     VARCHAR(100) NOT NULL,
                          created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_payment_booking
                              FOREIGN KEY (booking_id) REFERENCES bookings(id),

                          CONSTRAINT uq_idempotency UNIQUE (idempotency_key)
);

CREATE TABLE outbox (
                        id              BIGSERIAL PRIMARY KEY,
                        aggregate_type  VARCHAR(50) NOT NULL,
                        aggregate_id    BIGINT NOT NULL,
                        event_type      VARCHAR(50) NOT NULL,
                        payload         JSONB NOT NULL,
                        processed       BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_booking_expiry ON bookings(expires_at);
CREATE INDEX idx_outbox_unprocessed ON outbox(processed);
