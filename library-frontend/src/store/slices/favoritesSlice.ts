import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService, { FavoriteBook } from '../../services/userService';

interface FavoritesState {
  books: FavoriteBook[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  books: [],
  isLoading: false,
  error: null,
};

// Асинхронные действия
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const data = await userService.getFavorites();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке избранных книг');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (bookId: number, { rejectWithValue }) => {
    try {
      await userService.addToFavorites(bookId);
      // После добавления книги в избранное, обновляем список
      const updatedFavorites = await userService.getFavorites();
      return updatedFavorites;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при добавлении книги в избранное');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (bookId: number, { rejectWithValue }) => {
    try {
      await userService.removeFromFavorites(bookId);
      // После удаления книги из избранного, обновляем список
      const updatedFavorites = await userService.getFavorites();
      return updatedFavorites;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении книги из избранного');
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavoritesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработчики для fetchFavorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Обработчики для addToFavorites
      .addCase(addToFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Обработчики для removeFromFavorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFavoritesError } = favoritesSlice.actions;
export default favoritesSlice.reducer; 