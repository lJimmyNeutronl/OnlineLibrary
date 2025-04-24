import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as BooksAPI from './api';
import { Book, BookSearchParams, Category, Author } from './types';

interface BooksState {
  books: Book[];
  currentBook: Book | null;
  categories: Category[];
  authors: Author[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: BooksState = {
  books: [],
  currentBook: null,
  categories: [],
  authors: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  isLoading: false,
  error: null,
};

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params: BookSearchParams = {}, { rejectWithValue }) => {
    try {
      return await BooksAPI.getBooks(params);
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при загрузке книг');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await BooksAPI.getBookById(id);
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при загрузке книги');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'books/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await BooksAPI.getCategories();
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при загрузке категорий');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const fetchBooksByCategory = createAsyncThunk(
  'books/fetchBooksByCategory',
  async ({ categoryId, params }: { categoryId: number, params?: BookSearchParams }, { rejectWithValue }) => {
    try {
      return await BooksAPI.getBooksByCategory(categoryId, params);
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при загрузке книг категории');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const fetchAuthors = createAsyncThunk(
  'books/fetchAuthors',
  async (_, { rejectWithValue }) => {
    try {
      return await BooksAPI.getAuthors();
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при загрузке авторов');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

export const fetchBooksByAuthor = createAsyncThunk(
  'books/fetchBooksByAuthor',
  async ({ authorId, params }: { authorId: number, params?: BookSearchParams }, { rejectWithValue }) => {
    try {
      return await BooksAPI.getBooksByAuthor(authorId, params);
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || 'Ошибка при загрузке книг автора');
      }
      return rejectWithValue('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  }
);

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка fetchBookById
      .addCase(fetchBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка fetchBooksByCategory
      .addCase(fetchBooksByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooksByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchBooksByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка fetchAuthors
      .addCase(fetchAuthors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authors = action.payload;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Обработка fetchBooksByAuthor
      .addCase(fetchBooksByAuthor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooksByAuthor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchBooksByAuthor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentBook, clearError } = booksSlice.actions;
export default booksSlice.reducer; 