import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

interface AuthState {
  user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string;
    roles: string[];
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', response.token);
      
      return response;
    } catch (error: any) {
      // Логируем ошибку для отладки
      console.error('Login error in thunk:', error);
      
      // Возвращаем сообщение об ошибке для обработки в slice
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка авторизации');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }, { rejectWithValue }) => {
    try {
      await authService.register(userData);
      // После успешной регистрации выполняем вход
      return await authService.login({
        email: userData.email,
        password: userData.password
      });
    } catch (error: any) {
      // Логируем ошибку для отладки
      console.error('Registration error in thunk:', error);
      
      // Возвращаем сообщение об ошибке для обработки в slice
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка регистрации');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      // Удаляем токен из localStorage
      localStorage.removeItem('token');
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка входа';
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка регистрации';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 