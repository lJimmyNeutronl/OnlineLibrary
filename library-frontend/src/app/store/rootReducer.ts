import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/slice';

/**
 * Корневой редьюсер, объединяющий все слайсы в приложении
 * По мере добавления функциональности, здесь будут подключаться новые слайсы
 */
const rootReducer = combineReducers({
  auth: authReducer,
  // Заглушка, которая будет заменена на реальные редьюсеры
  // Например: books: booksReducer, и т.д.
  // Временная заглушка, чтобы не было ошибок
  _placeholder: (state = {}) => state,
});

export default rootReducer; 