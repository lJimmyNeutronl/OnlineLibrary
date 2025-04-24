import { useState, useCallback } from 'react';
import * as BooksAPI from '../api';
import { Book, BookSearchParams, Category, Author } from '../types';

/**
 * Хук для работы с книгами
 */
export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * Загрузка списка книг
   */
  const loadBooks = useCallback(async (params: BookSearchParams = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await BooksAPI.getBooks(params);
      setBooks(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.number);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке книг');
      console.error('Ошибка при загрузке книг:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Загрузка книги по ID
   */
  const loadBookById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const book = await BooksAPI.getBookById(id);
      setCurrentBook(book);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке книги');
      console.error('Ошибка при загрузке книги:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Загрузка списка категорий
   */
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const categoriesList = await BooksAPI.getCategories();
      setCategories(categoriesList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке категорий');
      console.error('Ошибка при загрузке категорий:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Загрузка книг по категории
   */
  const loadBooksByCategory = useCallback(async (categoryId: number, params: BookSearchParams = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await BooksAPI.getBooksByCategory(categoryId, params);
      setBooks(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.number);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке книг категории');
      console.error('Ошибка при загрузке книг категории:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Загрузка списка авторов
   */
  const loadAuthors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authorsList = await BooksAPI.getAuthors();
      setAuthors(authorsList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке авторов');
      console.error('Ошибка при загрузке авторов:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Загрузка книг по автору
   */
  const loadBooksByAuthor = useCallback(async (authorId: number, params: BookSearchParams = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await BooksAPI.getBooksByAuthor(authorId, params);
      setBooks(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.number);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке книг автора');
      console.error('Ошибка при загрузке книг автора:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    books,
    categories,
    authors,
    currentBook,
    isLoading,
    error,
    totalElements,
    totalPages,
    currentPage,
    loadBooks,
    loadBookById,
    loadCategories,
    loadBooksByCategory,
    loadAuthors,
    loadBooksByAuthor
  };
}; 