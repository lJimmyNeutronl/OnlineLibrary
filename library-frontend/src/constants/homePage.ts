import {
  FaBook,
  FaBookOpen,
  FaBookReader,
  FaPencilAlt,
  FaGraduationCap,
  FaFeatherAlt
} from 'react-icons/fa';

// Анимации для компонентов
export const ANIMATIONS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  },
  
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  },
  
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

// Иконки для категорий
export const CATEGORY_ICONS = [
  FaBookReader,
  FaGraduationCap,
  FaFeatherAlt,
  FaBook,
  FaBookOpen,
  FaPencilAlt
];

// Лимиты для загрузки данных
export const DATA_LIMITS = {
  POPULAR_BOOKS: 8,
  LATEST_BOOKS: 4,
  TOP_CATEGORIES: 6,
  SEARCH_HISTORY: 10,
  SEARCH_SUGGESTIONS_MIN_LENGTH: 2,
  SEARCH_DEBOUNCE_DELAY: 300
};

// Тексты
export const TEXTS = {
  HERO_TITLE: "Добро пожаловать в LitCloud",
  HERO_DESCRIPTION: "Исследуйте тысячи книг, доступных для чтения онлайн. Находите новые истории, учитесь и развлекайтесь с нашей коллекцией электронных книг.",
  SEARCH_PLACEHOLDER: "Поиск по системе. Например: Органическая химия",
  SECTION_LATEST_BOOKS: "Новые поступления",
  SECTION_POPULAR_CATEGORIES: "Популярные категории"
}; 