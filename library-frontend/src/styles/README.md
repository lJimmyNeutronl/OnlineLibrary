# Система стилей для LitCloud

В этой директории содержатся общие стили, которые можно использовать в компонентах по всему приложению. Такой подход позволяет:

1. **Избежать дублирования кода** — стили определяются в одном месте и переиспользуются.
2. **Обеспечить единообразие** — компоненты используют одни и те же стили.
3. **Упростить внесение изменений** — изменение стиля в одном файле меняет его во всех компонентах.

## Структура

- `animations.ts` — объекты для анимаций с Framer Motion
- `buttons.ts` — стили для кнопок
- `decorative.ts` — стили для декоративных элементов
- `forms.ts` — стили для форм и полей ввода
- `index.ts` — экспортирует все стили для удобного импорта

## Использование

### Импорт стилей

```tsx
// Импорт отдельного стиля
import { primaryButtonStyle } from '../styles/buttons';

// Или импорт через индексный файл
import { primaryButtonStyle, formContainerStyle } from '../styles';
```

### Применение стилей

```tsx
<div style={formContainerStyle}>
  <h2 style={formTitleStyle}>Заголовок формы</h2>
  <Button style={primaryButtonStyle}>Кнопка</Button>
</div>
```

### Комбинирование стилей

```tsx
// Комбинирование и переопределение стилей
<div style={{
  ...formContainerStyle,
  padding: '40px', // Переопределение свойства
}}>
  Содержимое
</div>
```

## Пример внедрения нового стиля

1. Добавьте стиль в соответствующий файл:

```tsx
// styles/buttons.ts
export const specialButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#ff5722',
  borderRadius: '20px',
};
```

2. Используйте стиль в компоненте:

```tsx
import { specialButtonStyle } from '../styles';

const MyComponent = () => (
  <Button style={specialButtonStyle}>
    Специальная кнопка
  </Button>
);
``` 