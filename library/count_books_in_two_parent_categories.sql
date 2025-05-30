-- Скрипт для подсчёта общего количества уникальных книг в двух родительских категориях
-- с учётом всех их подкатегорий без дубликатов

-- Параметры: ID двух родительских категорий
DO $$
DECLARE
    parent_category_1_id INT := 1; 
    parent_category_2_id INT := 9; 
    total_unique_books INT;
    category_1_name VARCHAR;
    category_2_name VARCHAR;
BEGIN
    -- Получаем названия категорий для отображения
    SELECT name INTO category_1_name FROM categories WHERE id = parent_category_1_id;
    SELECT name INTO category_2_name FROM categories WHERE id = parent_category_2_id;
    
    -- Подсчитываем общее количество уникальных книг в двух родительских категориях
    WITH RECURSIVE 
    -- Первое дерево категорий
    category_tree_1 AS (
        -- Базовая часть: корневая категория
        SELECT id, name, parent_category_id FROM categories 
        WHERE id = parent_category_1_id
        UNION ALL
        -- Рекурсивная часть: подкатегории
        SELECT c.id, c.name, c.parent_category_id
        FROM categories c
        INNER JOIN category_tree_1 ct ON c.parent_category_id = ct.id
    ),
    -- Второе дерево категорий
    category_tree_2 AS (
        -- Базовая часть: корневая категория
        SELECT id, name, parent_category_id FROM categories 
        WHERE id = parent_category_2_id
        UNION ALL
        -- Рекурсивная часть: подкатегории
        SELECT c.id, c.name, c.parent_category_id
        FROM categories c
        INNER JOIN category_tree_2 ct ON c.parent_category_id = ct.id
    ),
    -- Объединяем все категории из обоих деревьев
    all_categories AS (
        SELECT id FROM category_tree_1
        UNION
        SELECT id FROM category_tree_2
    ),
    all_books_in_categories AS (
        -- Получаем все книги из всех категорий (включая подкатегории) обеих родительских категорий
        SELECT DISTINCT bc.book_id
        FROM book_categories bc
        INNER JOIN all_categories ac ON bc.category_id = ac.id
    )
    SELECT COUNT(*) INTO total_unique_books
    FROM all_books_in_categories;
    
    -- Выводим результат
    RAISE NOTICE 'Родительская категория 1: % (ID: %)', category_1_name, parent_category_1_id;
    RAISE NOTICE 'Родительская категория 2: % (ID: %)', category_2_name, parent_category_2_id;
    RAISE NOTICE 'Общее количество уникальных книг в обеих категориях (включая подкатегории): %', total_unique_books;
    
    -- Дополнительная информация: количество книг в каждой категории отдельно
    DECLARE
        books_in_category_1 INT;
        books_in_category_2 INT;
    BEGIN
        -- Книги в первой категории и её подкатегориях
        WITH RECURSIVE category_tree_1 AS (
            SELECT id FROM categories WHERE id = parent_category_1_id
            UNION ALL
            SELECT c.id FROM categories c
            INNER JOIN category_tree_1 ct ON c.parent_category_id = ct.id
        )
        SELECT COUNT(DISTINCT bc.book_id) INTO books_in_category_1
        FROM book_categories bc
        INNER JOIN category_tree_1 ct ON bc.category_id = ct.id;
        
        -- Книги во второй категории и её подкатегориях
        WITH RECURSIVE category_tree_2 AS (
            SELECT id FROM categories WHERE id = parent_category_2_id
            UNION ALL
            SELECT c.id FROM categories c
            INNER JOIN category_tree_2 ct ON c.parent_category_id = ct.id
        )
        SELECT COUNT(DISTINCT bc.book_id) INTO books_in_category_2
        FROM book_categories bc
        INNER JOIN category_tree_2 ct ON bc.category_id = ct.id;
        
        RAISE NOTICE '---';
        RAISE NOTICE 'Книг в категории "%" (включая подкатегории): %', category_1_name, books_in_category_1;
        RAISE NOTICE 'Книг в категории "%" (включая подкатегории): %', category_2_name, books_in_category_2;
        RAISE NOTICE 'Пересекающихся книг: %', (books_in_category_1 + books_in_category_2 - total_unique_books);
    END;
END $$; 