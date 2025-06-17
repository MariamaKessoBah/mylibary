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
      // 🔍 DEBUG : Données reçues
      console.log('🟡 DONNÉES BRUTES REÇUES:', bookData);
      console.log('🟡 Type des données:', typeof bookData);
      console.log('🟡 Clés disponibles:', Object.keys(bookData));

      // 🔧 NETTOYAGE TRÈS PRÉCIS DES DONNÉES
      const cleanedData = {
        title: bookData.title?.trim() || '',
        author: bookData.author?.trim() || '',
        genre: bookData.genre?.trim() || null,
        publication_year: bookData.publication_year ? parseInt(bookData.publication_year, 10) : null,
        pages: bookData.pages ? parseInt(bookData.pages, 10) : null,
        status: bookData.status || 'to_read',
        rating: bookData.rating ? parseInt(bookData.rating, 10) : null,
        notes: bookData.notes?.trim() || null
      };

      // 🔍 DEBUG : Données après nettoyage
      console.log('🟢 DONNÉES NETTOYÉES:', cleanedData);

      // ✅ VALIDATION STRICTE
      if (!cleanedData.title || cleanedData.title.length === 0) {
        throw new Error('Le titre est requis et ne peut pas être vide');
      }
      if (!cleanedData.author || cleanedData.author.length === 0) {
        throw new Error('L\'auteur est requis et ne peut pas être vide');
      }

      // 🛡️ VALIDATION MÉTIER : Pas de note si pas "lu"
      if (cleanedData.status !== 'read') {
        cleanedData.rating = null;
        console.log(`🔒 Note supprimée pour statut "${cleanedData.status}"`);
      }

      // 📝 VALIDATION DES STATUTS AUTORISÉS
      const validStatuses = ['to_read', 'reading', 'read'];
      if (!validStatuses.includes(cleanedData.status)) {
        throw new Error(`Statut invalide: ${cleanedData.status}. Statuts valides: ${validStatuses.join(', ')}`);
      }

      // 🔍 DEBUG : Validation des types
      console.log('🔍 VALIDATION DES TYPES:');
      console.log('  - title:', typeof cleanedData.title, '→', cleanedData.title);
      console.log('  - author:', typeof cleanedData.author, '→', cleanedData.author);
      console.log('  - genre:', typeof cleanedData.genre, '→', cleanedData.genre);
      console.log('  - publication_year:', typeof cleanedData.publication_year, '→', cleanedData.publication_year);
      console.log('  - pages:', typeof cleanedData.pages, '→', cleanedData.pages);
      console.log('  - status:', typeof cleanedData.status, '→', cleanedData.status);
      console.log('  - rating:', typeof cleanedData.rating, '→', cleanedData.rating);
      console.log('  - notes:', typeof cleanedData.notes, '→', cleanedData.notes);

      // 🔍 DEBUG : Token d'authentification
      const token = localStorage.getItem('token');
      console.log('🔑 TOKEN PRÉSENT:', !!token);
      console.log('🔑 TOKEN (premiers chars):', token ? token.substring(0, 20) + '...' : 'AUCUN');

      // 📤 ENVOI VERS LE BACKEND
      console.log('📤 ENVOI VERS LE BACKEND:', JSON.stringify(cleanedData, null, 2));
      console.log('📤 URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/books`);
      
      const response = await api.post('/books', cleanedData);
      
      console.log('✅ RÉPONSE DU BACKEND:', response);
      console.log('✅ STATUS:', response.status);
      console.log('✅ DATA:', response.data);
      
      return response.data;
      
    } catch (error) {
      // 🚨 DEBUG D'ERREUR TRÈS DÉTAILLÉ
      console.error('❌ ===== ERREUR DÉTAILLÉE =====');
      console.error('❌ Message d\'erreur:', error.message);
      console.error('❌ Type d\'erreur:', error.name);
      console.error('❌ Stack:', error.stack);
      
      if (error.response) {
        console.error('❌ STATUS HTTP:', error.response.status);
        console.error('❌ STATUS TEXT:', error.response.statusText);
        console.error('❌ HEADERS:', error.response.headers);
        console.error('❌ DATA du backend:', error.response.data);
        
        // 🔍 AFFICHER LES ERREURS DÉTAILLÉES DU BACKEND
        if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          console.error('🚨 ERREURS SPÉCIFIQUES DU BACKEND:');
          error.response.data.errors.forEach((err, index) => {
            console.error(`   ${index + 1}. ${typeof err === 'object' ? JSON.stringify(err, null, 2) : err}`);
          });
        }
        
        console.error('❌ CONFIG de la requête:', error.config);
        console.error('❌ URL appelée:', error.config?.url);
        console.error('❌ DONNÉES ENVOYÉES:', error.config?.data);
        console.error('❌ HEADERS ENVOYÉS:', error.config?.headers);
      } else if (error.request) {
        console.error('❌ REQUÊTE (pas de réponse):', error.request);
      }
      console.error('❌ ===========================');
      
      // Améliorer le message d'erreur pour l'utilisateur
      if (error.response?.status === 400) {
        const backendError = error.response.data?.message || 
                           error.response.data?.error || 
                           error.response.data?.details ||
                           'Données invalides - vérifiez les champs requis';
        throw new Error(`Erreur de validation: ${backendError}`);
      } else if (error.response?.status === 401) {
        throw new Error('Non autorisé - veuillez vous reconnecter');
      } else if (error.response?.status === 500) {
        throw new Error('Erreur serveur - contactez l\'administrateur');
      }
      
      throw error;
    }
  },

  updateBook: async (id, bookData) => {
    try {
      console.log('🔄 MISE À JOUR - Données reçues:', bookData);
      
      // 🔧 NETTOYAGE IDENTIQUE À LA CRÉATION
      const cleanedData = {
        title: bookData.title?.trim() || '',
        author: bookData.author?.trim() || '',
        genre: bookData.genre?.trim() || null,
        publication_year: bookData.publication_year ? parseInt(bookData.publication_year, 10) : null,
        pages: bookData.pages ? parseInt(bookData.pages, 10) : null,
        status: bookData.status || 'to_read',
        rating: bookData.rating ? parseInt(bookData.rating, 10) : null,
        notes: bookData.notes?.trim() || null
      };

      // 🛡️ MÊME VALIDATION MÉTIER
      if (cleanedData.status !== 'read') {
        cleanedData.rating = null;
        console.log(`🔒 Note supprimée lors de la mise à jour pour statut "${cleanedData.status}"`);
      }

      // 📝 VALIDATION DES STATUTS
      const validStatuses = ['to_read', 'reading', 'read'];
      if (!validStatuses.includes(cleanedData.status)) {
        throw new Error(`Statut invalide: ${cleanedData.status}`);
      }

      console.log('📤 Données mises à jour envoyées:', JSON.stringify(cleanedData, null, 2));
      const response = await api.put(`/books/${id}`, cleanedData);
      console.log('✅ Réponse de mise à jour:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur updateBook:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        const backendError = error.response.data?.message || error.response.data?.error || 'Données invalides';
        throw new Error(`Erreur de validation: ${backendError}`);
      }
      throw error;
    }
  },

  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur deleteBook:', error.response?.data || error.message);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/books/stats');
      return response.data;
    } catch (error) {
      console.error('⚠️ Erreur getStats:', error.response?.data || error.message);
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

  // 🆕 NOUVELLE MÉTHODE : Changer rapidement le statut d'un livre
  updateBookStatus: async (id, newStatus) => {
    try {
      const validStatuses = ['to_read', 'reading', 'read'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Statut invalide: ${newStatus}`);
      }

      // Si on passe à "to_read" ou "reading", supprimer la note
      const updateData = { status: newStatus };
      if (newStatus !== 'read') {
        updateData.rating = null;
      }

      console.log(`📚 Changement de statut pour livre ${id}: ${newStatus}`);
      const response = await api.patch(`/books/${id}/status`, updateData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateBookStatus:', error.response?.data || error.message);
      throw error;
    }
  }
};