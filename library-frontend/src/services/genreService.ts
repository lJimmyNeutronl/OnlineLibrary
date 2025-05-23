import apiClient from './apiClient';
import { mockGenres } from '../mocks/catalog-data';

interface Genre {
  id: number;
  name: string;
  description?: string;
}

const getAllGenres = async (): Promise<Genre[]> => {
  try {
    const response = await apiClient.get('/api/genres');
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    // Используем мок-данные при ошибке
    return mockGenres;
  }
};

const getGenreById = async (id: number): Promise<Genre | null> => {
  try {
    const response = await apiClient.get(`/api/genres/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching genre with id ${id}:`, error);
    // Используем мок-данные при ошибке
    const genre = mockGenres.find(g => g.id === id);
    return genre || null;
  }
};

const genreService = {
  getAllGenres,
  getGenreById,
};

export default genreService; 