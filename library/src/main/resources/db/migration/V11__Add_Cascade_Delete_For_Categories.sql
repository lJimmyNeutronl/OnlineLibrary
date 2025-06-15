-- Добавление каскадного удаления для категорий и связанных таблиц

-- Удаляем существующие внешние ключи для категорий
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_category_id_fkey;
ALTER TABLE book_categories DROP CONSTRAINT IF EXISTS book_categories_category_id_fkey;

-- Добавляем внешние ключи с каскадным удалением
-- Для самоссылающейся связи категорий (родитель-ребенок)
ALTER TABLE categories 
ADD CONSTRAINT categories_parent_category_id_fkey 
FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- Для связи книг и категорий
ALTER TABLE book_categories 
ADD CONSTRAINT book_categories_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE; 