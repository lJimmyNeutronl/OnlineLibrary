import { RootState } from '../../app/store';

/**
 * Селектор для получения текущего пользователя
 * @param state Состояние Redux
 * @returns Объект с данными пользователя
 */
export const selectUser = (state: RootState) => state.auth.user;

/**
 * Селектор для получения статуса аутентификации
 * @param state Состояние Redux
 * @returns true, если пользователь аутентифицирован
 */
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;

/**
 * Селектор для получения статуса загрузки аутентификации
 * @param state Состояние Redux
 * @returns true, если происходит загрузка
 */
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

/**
 * Селектор для получения ошибки аутентификации
 * @param state Состояние Redux
 * @returns Сообщение об ошибке или null
 */
export const selectAuthError = (state: RootState) => state.auth.error; 