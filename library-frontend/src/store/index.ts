import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import favoritesReducer from './slices/favoritesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 