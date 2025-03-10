-- Создание таблицы книг
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    isbn VARCHAR(20),
    publication_year INTEGER,
    publisher VARCHAR(100),
    language VARCHAR(50),
    page_count INTEGER,
    file_url VARCHAR(255) NOT NULL,
    cover_image_url VARCHAR(255),
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы категорий
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_category_id INTEGER REFERENCES categories(id)
);

-- Создание таблицы связи книг и категорий
CREATE TABLE book_categories (
    book_id INTEGER NOT NULL REFERENCES books(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    PRIMARY KEY (book_id, category_id)
);

-- Создание таблицы избранного
CREATE TABLE favorites (
    user_id INTEGER NOT NULL REFERENCES users(id),
    book_id INTEGER NOT NULL REFERENCES books(id),
    PRIMARY KEY (user_id, book_id)
);

-- Создание таблицы истории чтения
CREATE TABLE reading_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    book_id INTEGER NOT NULL REFERENCES books(id),
    last_read_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (user_id, book_id)
);

-- Добавление индексов для оптимизации запросов
CREATE INDEX idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX idx_reading_history_book_id ON reading_history(book_id);
CREATE INDEX idx_reading_history_is_completed ON reading_history(is_completed);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_book_id ON favorites(book_id);
CREATE INDEX idx_book_categories_book_id ON book_categories(book_id);
CREATE INDEX idx_book_categories_category_id ON book_categories(category_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_category_id);
