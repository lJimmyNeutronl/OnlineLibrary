import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileApi } from './api';
import { 
  UserProfile, 
  UpdateProfileData, 
  AddFavoriteBookData, 
  AddBookmarkData 
} from './types';
import { RootState } from '../../app/store';

// Состояние профиля
interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await profileApi.getProfile();
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при загрузке профиля');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: UpdateProfileData, { rejectWithValue }) => {
    try {
      return await profileApi.updateProfile(data);
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при обновлении профиля');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const addFavoriteBook = createAsyncThunk(
  'profile/addFavoriteBook',
  async (data: AddFavoriteBookData, { rejectWithValue }) => {
    try {
      return await profileApi.addFavoriteBook(data);
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при добавлении книги в избранное');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const removeFavoriteBook = createAsyncThunk(
  'profile/removeFavoriteBook',
  async (id: number, { rejectWithValue }) => {
    try {
      await profileApi.deleteFavoriteBook(id);
      return id;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при удалении книги из избранного');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const addBookmark = createAsyncThunk(
  'profile/addBookmark',
  async (data: AddBookmarkData, { rejectWithValue }) => {
    try {
      return await profileApi.addBookmark(data);
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при добавлении закладки');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const removeBookmark = createAsyncThunk(
  'profile/removeBookmark',
  async (id: number, { rejectWithValue }) => {
    try {
      await profileApi.deleteBookmark(id);
      return id;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при удалении закладки');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const updateReadingProgress = createAsyncThunk(
  'profile/updateReadingProgress',
  async (
    { bookId, page, percentage }: { bookId: number; page: number; percentage: number }, 
    { rejectWithValue }
  ) => {
    try {
      return await profileApi.updateReadingProgress(bookId, page, percentage);
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при обновлении прогресса чтения');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка addFavoriteBook
      .addCase(addFavoriteBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFavoriteBook.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.favoriteBooks.push(action.payload);
        }
      })
      .addCase(addFavoriteBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка removeFavoriteBook
      .addCase(removeFavoriteBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFavoriteBook.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.favoriteBooks = state.profile.favoriteBooks.filter(
            (book) => book.id !== action.payload
          );
        }
      })
      .addCase(removeFavoriteBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка addBookmark
      .addCase(addBookmark.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.bookmarks.push(action.payload);
        }
      })
      .addCase(addBookmark.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка removeBookmark
      .addCase(removeBookmark.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeBookmark.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.bookmarks = state.profile.bookmarks.filter(
            (bookmark) => bookmark.id !== action.payload
          );
        }
      })
      .addCase(removeBookmark.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка updateReadingProgress
      .addCase(updateReadingProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReadingProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          const index = state.profile.readingHistory.findIndex(
            (item) => item.id === action.payload.id
          );
          if (index !== -1) {
            state.profile.readingHistory[index] = action.payload;
          } else {
            state.profile.readingHistory.push(action.payload);
          }
        }
      })
      .addCase(updateReadingProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileError, clearProfile } = profileSlice.actions;

// Селекторы
export const selectProfile = (state: RootState) => state.profile.profile;
export const selectProfileLoading = (state: RootState) => state.profile.isLoading;
export const selectProfileError = (state: RootState) => state.profile.error;

export default profileSlice.reducer; 