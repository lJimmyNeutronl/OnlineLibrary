import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState, LoginFormData, RegisterFormData } from './types';
import * as authApi from './api';
import { RootState } from '../../app/store';

// Начальное состояние
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('auth_token')
};

// Асинхронные экшены
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось войти в систему');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterFormData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось зарегистрироваться');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Не удалось выйти из системы');
    }
  }
);

// Создание слайса
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Установка пользователя
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    // Установка токена
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    // Выход (очистка данных)
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

// Экспорт экшенов
export const { setUser, setToken, logout, clearError } = authSlice.actions;

// Экспорт редьюсера
export default authSlice.reducer;

// Селекторы
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error; 