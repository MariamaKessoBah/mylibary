import api from './api';

export const authService = {
  login: async (email, password) => {
    console.log('📞 AUTH SERVICE - Appel API login...');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('📨 AUTH SERVICE - Réponse complète:', response.data);
      
      // ✅ ADAPTATION : Le backend renvoie data.token et data.user
      if (response.data?.success && response.data?.data) {
        const { user, token } = response.data.data;
        console.log('🎯 AUTH SERVICE - Token reçu:', token?.substring(0, 20) + '...');
        console.log('👤 AUTH SERVICE - User reçu:', user?.username);
        
        // Retourner dans le format attendu par le frontend
        return {
          user,
          token,
          success: true
        };
      } else {
        console.log('❌ AUTH SERVICE - Structure de réponse inattendue:', response.data);
        throw new Error('Format de réponse inattendu du serveur');
      }
      
    } catch (error) {
      console.error('❌ AUTH SERVICE - Erreur:', error);
      console.error('❌ AUTH SERVICE - Response error:', error.response?.data);
      throw error;
    }
  },

  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    // Adapter la structure de réponse
    if (response.data?.success && response.data?.data) {
      const { user, token } = response.data.data;
      return { user, token, success: true };
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    // Adapter la structure de réponse  
    if (response.data?.success && response.data?.data) {
      return response.data.data; // Retourne { user: ... }
    }
    return response.data;
  },
};