import apiClient from './apiClient';
import { mockAuthors } from '../mocks/catalog-data';

interface Author {
  id: number;
  name: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
  photoUrl?: string | null;
}

const getAllAuthors = async (): Promise<Author[]> => {
  try {
    const response = await apiClient.get('/api/authors');
    return response.data;
  } catch (error) {
    console.error('Error fetching authors:', error);
    // Используем мок-данные при ошибке
    return mockAuthors;
  }
};

const getAuthorById = async (id: number): Promise<Author | null> => {
  try {
    const response = await apiClient.get(`/api/authors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching author with id ${id}:`, error);
    // Используем мок-данные при ошибке
    const author = mockAuthors.find(a => a.id === id);
    return author || null;
  }
};

const authorService = {
  getAllAuthors,
  getAuthorById,
};

export default authorService; 