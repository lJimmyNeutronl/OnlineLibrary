import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from '../../features/auth/slice';
import booksReducer from '../../features/books/slice';
import profileReducer from '../../features/profile/slice';

/**
 * Конфигурация Redux store
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Отключаем проверку на сериализуемость для возможности хранения не-сериализуемых данных
    }),
  devTools: import.meta.env.MODE !== 'production',
});

// Типы для диспетчера и состояния
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// Типизированные хуки
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 