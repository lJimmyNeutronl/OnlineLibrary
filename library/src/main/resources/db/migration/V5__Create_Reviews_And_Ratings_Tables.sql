-- Создание таблицы отзывов
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    book_id INTEGER NOT NULL REFERENCES books(id),
    content TEXT NOT NULL,
    creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    edited_date TIMESTAMP,
    CONSTRAINT unique_user_book_review UNIQUE (user_id, book_id)
);

-- Создание таблицы рейтингов
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    book_id INTEGER NOT NULL REFERENCES books(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_book_rating UNIQUE (user_id, book_id)
);

-- Добавление индексов для оптимизации запросов
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_creation_date ON reviews(creation_date);

CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_book_id ON ratings(book_id);
CREATE INDEX idx_ratings_rating ON ratings(rating); 