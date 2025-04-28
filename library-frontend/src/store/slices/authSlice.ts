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
      // Удаляем токен перед попыткой нового входа
      localStorage.removeItem('token');
      
      console.log('[Auth] Попытка входа для:', credentials.email);
      
      // Запрос на вход
      const data = await authService.login(credentials);
      
      // Проверка полноты ответа
      if (!data || !data.token || !data.user) {
        console.error('[Auth] Неполный ответ от сервера:', data);
        return rejectWithValue('Неполный ответ от сервера при аутентификации');
      }
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', data.token);
      
      console.log('[Auth] Успешный вход:', data.user.email);
      
      return data;
    } catch (error: any) {
      console.error('[Auth] Ошибка при входе:', error);
      
      // Подробная обработка ошибок
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error(`[Auth] Ошибка ${status}:`, errorData);
        
        if (status === 401) {
          return rejectWithValue('Неверное имя пользователя или пароль');
        } else if (status === 404) {
          return rejectWithValue('Пользователь с таким email не найден');
        } else if (status === 400) {
          return rejectWithValue(errorData?.message || 'Неверный формат данных');
        } else if (status === 500) {
          return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже');
        } else {
          return rejectWithValue(`Ошибка входа: ${errorData?.message || 'Неизвестная ошибка'}`);
        }
      }
      
      // Обработка сетевых ошибок
      if (error.message && error.message.includes('Network Error')) {
        return rejectWithValue('Ошибка соединения с сервером. Проверьте подключение к интернету');
      }
      
      return rejectWithValue(error.message || 'Неизвестная ошибка при входе');
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
  }, { rejectWithValue, dispatch }) => {
    try {
      // Очищаем существующий токен перед регистрацией
      localStorage.removeItem('token');
      
      console.log('[Auth] Попытка регистрации пользователя:', userData.email);
      
      // Регистрируем пользователя
      await authService.register(userData);
      
      console.log('[Auth] Регистрация успешна, выполняем автоматический вход');
      
      // После успешной регистрации автоматически выполняем вход
      const loginResponse = await authService.login({
        email: userData.email,
        password: userData.password
      });
      
      // Сохраняем токен
      localStorage.setItem('token', loginResponse.token);
      
      console.log('[Auth] Автоматический вход выполнен успешно');
      
      return loginResponse;
    } catch (error: any) {
      console.error('[Auth] Ошибка при регистрации:', error);
      
      // Подробная обработка ошибок
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error(`[Auth] Ошибка регистрации ${status}:`, errorData);
        
        if (status === 400) {
          if (errorData?.message?.includes('email')) {
            return rejectWithValue('Некорректный формат email');
          } else if (errorData?.message?.includes('password')) {
            return rejectWithValue('Пароль должен содержать минимум 6 символов');
          } else {
            return rejectWithValue(errorData?.message || 'Некорректные данные для регистрации');
          }
        } else if (status === 409) {
          return rejectWithValue('Пользователь с таким email уже существует');
        } else if (status === 500) {
          return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже');
        } else {
          return rejectWithValue(`Ошибка регистрации: ${errorData?.message || 'Неизвестная ошибка'}`);
        }
      }
      
      // Обработка сетевых ошибок
      if (error.message && error.message.includes('Network Error')) {
        return rejectWithValue('Ошибка соединения с сервером. Проверьте подключение к интернету');
      }
      
      return rejectWithValue(error.message || 'Неизвестная ошибка при регистрации');
    }
  }
);

// Новый thunk для загрузки текущего пользователя при наличии токена
export const loadCurrentUser = createAsyncThunk(
  'auth/loadCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Auth] Загрузка данных пользователя');
      
      // Получаем токен напрямую из localStorage (не полагаемся на состояние Redux)
      const token = localStorage.getItem('token');
      
      // Если токена нет, отклоняем запрос
      if (!token) {
        console.log('[Auth] Токен отсутствует в localStorage');
        return rejectWithValue('Токен отсутствует');
      }
      
      // Получаем данные пользователя через сервис
      const userData = await authService.fetchCurrentUser();
      
      // Проверка полноты ответа
      if (!userData || !userData.email) {
        console.error('[Auth] Неполный ответ от сервера при загрузке пользователя:', userData);
        localStorage.removeItem('token');
        return rejectWithValue('Получены некорректные данные пользователя');
      }
      
      console.log('[Auth] Данные пользователя получены:', userData.email);
      return { user: userData, token };
    } catch (error: any) {
      console.error('[Auth] Ошибка получения данных пользователя:', error);
      
      // Подробная обработка ошибок
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error(`[Auth] Ошибка загрузки данных ${status}:`, errorData);
        
        // В случае ошибок авторизации удаляем токен
        if ([401, 403].includes(status)) {
          console.log('[Auth] Ошибка авторизации, удаляем токен');
          localStorage.removeItem('token');
          
          if (status === 401) {
            return rejectWithValue('Срок действия сессии истек. Пожалуйста, войдите снова');
          } else if (status === 403) {
            return rejectWithValue('Доступ запрещен');
          }
        } else if (status === 404) {
          localStorage.removeItem('token');
          return rejectWithValue('Пользователь не найден');
        } else if (status === 500) {
          return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже');
        } else {
          return rejectWithValue(`Ошибка: ${errorData?.message || 'Неизвестная ошибка'}`);
        }
      }
      
      // Обработка сетевых ошибок
      if (error.message && error.message.includes('Network Error')) {
        return rejectWithValue('Ошибка соединения с сервером. Проверьте подключение к интернету');
      }
      
      // Очищаем токен при любой неизвестной ошибке
      localStorage.removeItem('token');
      return rejectWithValue(error.message || 'Ошибка загрузки данных пользователя');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Очищаем состояние пользователя
      state.user = null;
      state.token = null;
      state.error = null;
      
      // Удаляем токен из localStorage
      localStorage.removeItem('token');
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
      })
      // Обработчики для загрузки текущего пользователя
      .addCase(loadCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ошибка загрузки данных пользователя';
        // Если не удалось загрузить пользователя, то очищаем состояние
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 