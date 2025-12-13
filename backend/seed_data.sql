INSERT INTO users (name, email, password_hash, role) VALUES
('Alice Buyer', 'alice@example.com', 'pbkdf2:sha256:150000$K4Gn3XoQ$...', 'buyer'),
('Bob Florist', 'bob@example.com', 'pbkdf2:sha256:150000$yZpK0jWf$...', 'florist');

INSERT INTO flowers (name, description, price, image_url, florist_id) VALUES
('Red Roses', 'Fresh red roses', 20.00, 'https://example.com/roses.jpg', 2),
('Tulip Bouquet', 'Beautiful tulips', 25.00, 'https://example.com/tulips.jpg', 2);

INSERT INTO orders (buyer_id, florist_id, flower_id, quantity, total_price, status, delivery_lat, delivery_lng) VALUES
(1, 2, 1, 2, 40.00, 'pending', -1.2921, 36.8219);

INSERT INTO messages (sender_id, receiver_id, order_id, content) VALUES
(1, 2, 1, 'Hi Bob, I would like my flowers delivered tomorrow.'),
(2, 1, 1, 'Sure Alice, we will schedule it.');
