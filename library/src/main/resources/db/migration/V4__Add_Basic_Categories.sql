-- Добавление основных категорий книг

-- Художественная литература
INSERT INTO categories (name, parent_category_id) VALUES ('Художественная литература', NULL);

-- Подкатегории для художественной литературы
INSERT INTO categories (name, parent_category_id) 
SELECT 'Фантастика', id FROM categories WHERE name = 'Художественная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Фэнтези', id FROM categories WHERE name = 'Художественная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Детективы', id FROM categories WHERE name = 'Художественная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Романы', id FROM categories WHERE name = 'Художественная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Приключения', id FROM categories WHERE name = 'Художественная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Классическая литература', id FROM categories WHERE name = 'Художественная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Современная проза', id FROM categories WHERE name = 'Художественная литература';

-- Научная и образовательная литература
INSERT INTO categories (name, parent_category_id) VALUES ('Научная и образовательная литература', NULL);

-- Подкатегории для научной литературы
INSERT INTO categories (name, parent_category_id) 
SELECT 'Физика', id FROM categories WHERE name = 'Научная и образовательная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Математика', id FROM categories WHERE name = 'Научная и образовательная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Биология', id FROM categories WHERE name = 'Научная и образовательная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Химия', id FROM categories WHERE name = 'Научная и образовательная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'История', id FROM categories WHERE name = 'Научная и образовательная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Философия', id FROM categories WHERE name = 'Научная и образовательная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Психология', id FROM categories WHERE name = 'Научная и образовательная литература';

-- Компьютерная литература
INSERT INTO categories (name, parent_category_id) VALUES ('Компьютерная литература', NULL);

-- Подкатегории для компьютерной литературы
INSERT INTO categories (name, parent_category_id) 
SELECT 'Программирование', id FROM categories WHERE name = 'Компьютерная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Web-разработка', id FROM categories WHERE name = 'Компьютерная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Базы данных', id FROM categories WHERE name = 'Компьютерная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Операционные системы', id FROM categories WHERE name = 'Компьютерная литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Сети и безопасность', id FROM categories WHERE name = 'Компьютерная литература';

-- Бизнес-литература
INSERT INTO categories (name, parent_category_id) VALUES ('Бизнес-литература', NULL);

-- Подкатегории для бизнес-литературы
INSERT INTO categories (name, parent_category_id) 
SELECT 'Маркетинг', id FROM categories WHERE name = 'Бизнес-литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Менеджмент', id FROM categories WHERE name = 'Бизнес-литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Финансы', id FROM categories WHERE name = 'Бизнес-литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Экономика', id FROM categories WHERE name = 'Бизнес-литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Личная эффективность', id FROM categories WHERE name = 'Бизнес-литература';

-- Искусство и культура
INSERT INTO categories (name, parent_category_id) VALUES ('Искусство и культура', NULL);

-- Подкатегории для искусства и культуры
INSERT INTO categories (name, parent_category_id) 
SELECT 'Живопись', id FROM categories WHERE name = 'Искусство и культура';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Музыка', id FROM categories WHERE name = 'Искусство и культура';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Кино', id FROM categories WHERE name = 'Искусство и культура';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Фотография', id FROM categories WHERE name = 'Искусство и культура';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Архитектура', id FROM categories WHERE name = 'Искусство и культура';

-- Хобби и досуг
INSERT INTO categories (name, parent_category_id) VALUES ('Хобби и досуг', NULL);

-- Подкатегории для хобби и досуга
INSERT INTO categories (name, parent_category_id) 
SELECT 'Кулинария', id FROM categories WHERE name = 'Хобби и досуг';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Рукоделие', id FROM categories WHERE name = 'Хобби и досуг';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Спорт', id FROM categories WHERE name = 'Хобби и досуг';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Путешествия', id FROM categories WHERE name = 'Хобби и досуг';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Садоводство', id FROM categories WHERE name = 'Хобби и досуг';

-- Детская литература
INSERT INTO categories (name, parent_category_id) VALUES ('Детская литература', NULL);

-- Подкатегории для детской литературы
INSERT INTO categories (name, parent_category_id) 
SELECT 'Сказки', id FROM categories WHERE name = 'Детская литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Детские повести и рассказы', id FROM categories WHERE name = 'Детская литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Развивающая литература', id FROM categories WHERE name = 'Детская литература';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Детская научно-популярная литература', id FROM categories WHERE name = 'Детская литература';

-- Подкатегории третьего уровня (для примера - для Фантастики)
INSERT INTO categories (name, parent_category_id) 
SELECT 'Научная фантастика', id FROM categories WHERE name = 'Фантастика';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Киберпанк', id FROM categories WHERE name = 'Фантастика';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Постапокалипсис', id FROM categories WHERE name = 'Фантастика';

-- Подкатегории третьего уровня (для примера - для Программирования)
INSERT INTO categories (name, parent_category_id) 
SELECT 'Java', id FROM categories WHERE name = 'Программирование';

INSERT INTO categories (name, parent_category_id) 
SELECT 'Python', id FROM categories WHERE name = 'Программирование';

INSERT INTO categories (name, parent_category_id) 
SELECT 'JavaScript', id FROM categories WHERE name = 'Программирование';

INSERT INTO categories (name, parent_category_id) 
SELECT 'C/C++', id FROM categories WHERE name = 'Программирование'; 