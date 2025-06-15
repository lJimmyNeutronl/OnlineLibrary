import { DataProvider } from 'react-admin';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const dataProvider: DataProvider = {
  // Получение списка записей
  getList: async (resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = 'id', order = 'ASC' } = params.sort || {};
    const { filter = {} } = params;
    
    let url = '';
    let queryParams = new URLSearchParams();

    // Добавляем пагинацию и сортировку
    queryParams.append('page', String(page - 1));
    queryParams.append('size', String(perPage));
    queryParams.append('sortBy', field);
    queryParams.append('direction', order.toLowerCase());

    switch (resource) {
      case 'users':
        url = `${API_URL}/users/admin/all`;
        break;
      case 'books':
        // Если есть поисковый запрос, используем эндпоинт search
        if (filter.q) {
          url = `${API_URL}/books/search`;
          queryParams.append('query', filter.q);
        } else {
          url = `${API_URL}/books`;
        }
        // Добавляем остальные фильтры для книг
        if (filter.language) {
          queryParams.append('language', filter.language);
        }
        if (filter.yearFrom) {
          queryParams.append('yearFrom', String(filter.yearFrom));
        }
        if (filter.yearTo) {
          queryParams.append('yearTo', String(filter.yearTo));
        }
        if (filter.minRating) {
          queryParams.append('minRating', String(filter.minRating));
        }
        break;
      case 'categories':
        // Используем эндпоинт с количеством книг для админ панели
        url = `${API_URL}/categories/book-count`;
        // Категории могут не поддерживать пагинацию, но добавим поиск
        if (filter.q) {
          queryParams.append('q', filter.q);
        }
        if (filter.isRoot) {
          queryParams.append('isRoot', filter.isRoot);
        }
        // Убираем пагинацию для категорий
        queryParams.delete('page');
        queryParams.delete('size');
        queryParams.delete('sortBy');
        queryParams.delete('direction');
        break;
      default:
        throw new Error(`Неизвестный ресурс: ${resource}`);
    }

    try {
      const fullUrl = `${url}?${queryParams.toString()}`;
      const response = await axios.get(fullUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = response.data;
      
      // Для пагинированных ответов
      if (data.content) {
        return {
          data: data.content,
          total: data.totalElements,
        };
      }
      
      // Для непагинированных ответов
      return {
        data: Array.isArray(data) ? data : [data],
        total: Array.isArray(data) ? data.length : 1,
      };
    } catch (error: any) {
      console.error('Ошибка getList:', error);
      throw new Error(error.response?.data?.message || 'Ошибка получения данных');
    }
  },

  // Получение одной записи
  getOne: async (resource, params) => {
    let url = '';
    
    switch (resource) {
      case 'users':
        url = `${API_URL}/users/${params.id}`;
        break;
      case 'books':
        url = `${API_URL}/books/${params.id}`;
        break;
      case 'categories':
        url = `${API_URL}/categories/${params.id}`;
        break;
      default:
        throw new Error(`Неизвестный ресурс: ${resource}`);
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return { data: response.data };
    } catch (error: any) {
      console.error('Ошибка getOne:', error);
      throw new Error(error.response?.data?.message || 'Ошибка получения записи');
    }
  },

  // Получение нескольких записей по ID
  getMany: async (resource, params) => {
    // Для упрощения получаем все записи и фильтруем по ID
    const promises = params.ids.map((id) =>
      dataProvider.getOne(resource, { id })
    );
    
    try {
      const results = await Promise.all(promises);
      return { data: results.map(result => result.data) };
    } catch (error: any) {
      console.error('Ошибка getMany:', error);
      throw new Error('Ошибка получения записей');
    }
  },

  // Получение связанных записей
  getManyReference: async (resource: string, params: any) => {
    // Обработка категорий для книг
    if (resource === 'categories') {
      try {
        const response = await axios.get(`${API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        return {
          data: response.data,
          total: response.data.length,
        };
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        return {
          data: [],
          total: 0,
        };
      }
    }
    
    // По умолчанию возвращаем пустой массив для других ресурсов
    return {
      data: [],
      total: 0,
    };
  },

  // Создание записи
  create: async (resource, params) => {
    let url = '';
    let requestData = params.data;
    let queryParams = '';
    
    switch (resource) {
      case 'books':
        url = `${API_URL}/books`;
        
        // Убираем readonly поля из данных
        const { rating, ratingsCount, categoryIds, ...cleanBookData } = params.data;
        requestData = cleanBookData;
        
        // Если есть categoryIds, добавляем их как query параметры
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
          const categoryIdsParam = categoryIds.map((id: any) => `categoryIds=${id}`).join('&');
          queryParams = `?${categoryIdsParam}`;
        }
        break;
      case 'categories':
        url = `${API_URL}/categories`;
        break;
      default:
        throw new Error(`Создание ${resource} не поддерживается`);
    }

    try {
      const response = await axios.post(url + queryParams, requestData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      return { data: response.data };
    } catch (error: any) {
      console.error('Ошибка create:', error);
      throw new Error(error.response?.data?.message || 'Ошибка создания записи');
    }
  },

  // Обновление записи
  update: async (resource, params) => {
    let url = '';
    let requestData = params.data;
    let queryParams = '';
    
    switch (resource) {
      case 'users':
        // Специальные методы для управления пользователями
        if (params.data.action === 'assignAdmin') {
          url = `${API_URL}/users/admin/assign-admin/${params.id}`;
          try {
            await axios.post(url, {}, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            return { data: { ...params.previousData, id: params.id } };
          } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Ошибка назначения администратора');
          }
        }
        if (params.data.action === 'removeAdmin') {
          url = `${API_URL}/users/admin/remove-admin/${params.id}`;
          try {
            await axios.delete(url, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            return { data: { ...params.previousData, id: params.id } };
          } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Ошибка удаления администратора');
          }
        }
        if (params.data.action === 'toggleBlock') {
          url = `${API_URL}/users/admin/toggle-block/${params.id}`;
          try {
            await axios.put(url, {}, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            return { data: { ...params.previousData, id: params.id } };
          } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Ошибка блокировки пользователя');
          }
        }
        break;
      case 'books':
        url = `${API_URL}/books/${params.id}`;
        
        // Убираем readonly поля из данных
        const { rating, ratingsCount, categoryIds, ...cleanBookData } = params.data;
        requestData = cleanBookData;
        
        // Если есть categoryIds, добавляем их как query параметры
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
          const categoryIdsParam = categoryIds.map((id: any) => `categoryIds=${id}`).join('&');
          queryParams = `?${categoryIdsParam}`;
        }
        break;
      case 'categories':
        url = `${API_URL}/categories/${params.id}`;
        break;
      default:
        throw new Error(`Обновление ${resource} не поддерживается`);
    }

    try {
      const response = await axios.put(url + queryParams, requestData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      return { data: response.data };
    } catch (error: any) {
      console.error('Ошибка update:', error);
      throw new Error(error.response?.data?.message || 'Ошибка обновления записи');
    }
  },

  // Массовое обновление
  updateMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      dataProvider.update(resource, { 
        id, 
        data: params.data, 
        previousData: { id } as any 
      })
    );
    
    try {
      const results = await Promise.all(promises);
      return { data: results.map(result => result.data.id) };
    } catch (error: any) {
      console.error('Ошибка updateMany:', error);
      throw new Error('Ошибка массового обновления');
    }
  },

  // Удаление записи
  delete: async (resource, params) => {
    let url = '';
    
    switch (resource) {
      case 'books':
        url = `${API_URL}/books/${params.id}`;
        break;
      case 'categories':
        url = `${API_URL}/categories/${params.id}`;
        break;
      default:
        throw new Error(`Удаление ${resource} не поддерживается`);
    }

    try {
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return { data: params.previousData || { id: params.id } as any };
    } catch (error: any) {
      console.error('Ошибка delete:', error);
      throw new Error(error.response?.data?.message || 'Ошибка удаления записи');
    }
  },

  // Массовое удаление
  deleteMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      dataProvider.delete(resource, { 
        id, 
        previousData: { id } as any 
      })
    );
    
    try {
      const results = await Promise.all(promises);
      return { data: results.map(result => result.data.id) };
    } catch (error: any) {
      console.error('Ошибка deleteMany:', error);
      throw new Error('Ошибка массового удаления');
    }
  },
};

export default dataProvider;