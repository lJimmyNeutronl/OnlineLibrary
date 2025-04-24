# Общие хуки приложения

В этой директории находятся переиспользуемые хуки общего назначения:

## Содержимое

- `useClickOutside.ts` - Хук для отслеживания кликов вне элемента
- `useDebounce.ts` - Хук для отложенного выполнения функций
- `useLocalStorage.ts` - Хук для работы с локальным хранилищем
- `useForm.ts` - Хук для управления формами с валидацией
- `useMediaQuery.ts` - Хук для отслеживания медиа-запросов (адаптивный дизайн)

## Использование

```tsx
import { useDebounce, useClickOutside } from 'shared/hooks';

const Component = () => {
  const ref = useRef(null);
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 500);
  
  useClickOutside(ref, () => {
    console.log('Clicked outside!');
  });
  
  // ...
}
```

## Руководство по созданию хуков

При создании новых хуков следуйте этим принципам:

1. Хук должен иметь четкую, единственную ответственность
2. Имя хука должно начинаться с "use"
3. Хук должен быть типизирован с использованием TypeScript
4. Хук должен быть задокументирован (в теле файла) 