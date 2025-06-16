import api from './api';

export const bookService = {
  getBooks: async (params = {}) => {
    try {
      const response = await api.get('/books', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur getBooks:', error.response?.data || error.message);
      throw error;
    }
  },

  getBook: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getBook:', error.response?.data || error.message);
      throw error;
    }
  },

  createBook: async (bookData) => {
    try {
      // Nettoyer les données avant envoi
      const cleanedData = {
        ...bookData,
        // Convertir les chaînes vides en null
        genre: bookData.genre || null,
        publication_year: bookData.publication_year || null,
        pages: bookData.pages || null,
        rating: bookData.rating || null,
        notes: bookData.notes || null
      };

      console.log('Données envoyées:', cleanedData);
      const response = await api.post('/books', cleanedData);
      return response.data;
    } catch (error) {
      console.error('Erreur createBook:', error.response?.data || error.message);
      throw error;
    }
  },

  updateBook: async (id, bookData) => {
    try {
      // Nettoyer les données avant envoi
      const cleanedData = {
        ...bookData,
        // Convertir les chaînes vides en null
        genre: bookData.genre || null,
        publication_year: bookData.publication_year || null,
        pages: bookData.pages || null,
        rating: bookData.rating || null,
        notes: bookData.notes || null
      };

      console.log('Données mises à jour:', cleanedData);
      const response = await api.put(`/books/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      console.error('Erreur updateBook:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteBook:', error.response?.data || error.message);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/books/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur getStats:', error.response?.data || error.message);
      // Retourner des données par défaut si l'endpoint n'existe pas
      return {
        data: {
          totalBooks: 0,
          readBooks: 0,
          readingBooks: 0,
          toReadBooks: 0,
          topGenres: []
        }
      };
    }
  },
};