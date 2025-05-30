-- Функция для подсчёта общего количества уникальных книг в двух родительских категориях
-- с учётом всех их подкатегорий

CREATE OR REPLACE FUNCTION count_unique_books_in_two_parent_categories(
    parent_category_1_id INT,
    parent_category_2_id INT
) 
RETURNS TABLE (
    category_1_name VARCHAR,
    category_2_name VARCHAR,
    books_in_category_1 BIGINT,
    books_in_category_2 BIGINT,
    total_unique_books BIGINT,
    overlapping_books BIGINT
) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE 
    -- Получаем все категории первого дерева
    category_tree_1 AS (
        -- Базовая часть: корневая категория
        SELECT id, name FROM categories WHERE id = parent_category_1_id
        UNION ALL
        -- Рекурсивная часть: подкатегории
        SELECT c.id, c.name FROM categories c
        INNER JOIN category_tree_1 ct ON c.parent_category_id = ct.id
    ),
    -- Получаем все категории второго дерева
    category_tree_2 AS (
        -- Базовая часть: корневая категория
        SELECT id, name FROM categories WHERE id = parent_category_2_id
        UNION ALL
        -- Рекурсивная часть: подкатегории
        SELECT c.id, c.name FROM categories c
        INNER JOIN category_tree_2 ct ON c.parent_category_id = ct.id
    ),
    -- Книги в первой категории и подкатегориях
    books_cat_1 AS (
        SELECT DISTINCT bc.book_id
        FROM book_categories bc
        INNER JOIN category_tree_1 ct ON bc.category_id = ct.id
    ),
    -- Книги во второй категории и подкатегориях  
    books_cat_2 AS (
        SELECT DISTINCT bc.book_id
        FROM book_categories bc
        INNER JOIN category_tree_2 ct ON bc.category_id = ct.id
    ),
    -- Все уникальные книги из обеих категорий
    all_unique_books AS (
        SELECT book_id FROM books_cat_1
        UNION
        SELECT book_id FROM books_cat_2
    ),
    -- Подсчёты
    counts AS (
        SELECT 
            (SELECT name FROM categories WHERE id = parent_category_1_id) as cat1_name,
            (SELECT name FROM categories WHERE id = parent_category_2_id) as cat2_name,
            (SELECT COUNT(*) FROM books_cat_1) as count_cat_1,
            (SELECT COUNT(*) FROM books_cat_2) as count_cat_2,
            (SELECT COUNT(*) FROM all_unique_books) as total_unique,
            (SELECT COUNT(*) FROM books_cat_1) + (SELECT COUNT(*) FROM books_cat_2) - (SELECT COUNT(*) FROM all_unique_books) as overlapping
    )
    SELECT 
        counts.cat1_name::VARCHAR,
        counts.cat2_name::VARCHAR,
        counts.count_cat_1,
        counts.count_cat_2,
        counts.total_unique,
        counts.overlapping
    FROM counts;
END $$;

-- Пример использования:
-- SELECT * FROM count_unique_books_in_two_parent_categories(1, 2);

-- Или для вывода в удобном формате:
-- SELECT 
--     'Категория 1: ' || category_1_name || ' (' || books_in_category_1 || ' книг)' as info_1,
--     'Категория 2: ' || category_2_name || ' (' || books_in_category_2 || ' книг)' as info_2,
--     'Общее количество уникальных книг: ' || total_unique_books as total,
--     'Пересекающихся книг: ' || overlapping_books as overlap
-- FROM count_unique_books_in_two_parent_categories(1, 2); 