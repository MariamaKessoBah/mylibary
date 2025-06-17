import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('🔄 INIT AUTH - Token trouvé:', token ? 'Oui' : 'Non');
      
      if (token) {
        try {
          console.log('📞 INIT AUTH - Récupération du profil...');
          const userData = await authService.getProfile();
          console.log('✅ INIT AUTH - Profil récupéré:', userData);
          setUser(userData.user);
        } catch (error) {
          console.log('❌ INIT AUTH - Erreur profil:', error.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    console.log('🔐 LOGIN CONTEXT - Début avec:', email);
    
    try {
      console.log('📞 LOGIN CONTEXT - Appel authService.login...');
      const response = await authService.login(email, password);
      console.log('📨 LOGIN CONTEXT - Réponse authService:', response);
      
      if (!response.token) {
        console.error('❌ LOGIN CONTEXT - Pas de token dans la réponse!');
        throw new Error('Aucun token reçu du serveur');
      }
      
      console.log('💾 LOGIN CONTEXT - Stockage du token...');
      localStorage.setItem('token', response.token);
      
      console.log('👤 LOGIN CONTEXT - Définition utilisateur:', response.user);
      setUser(response.user);
      
      console.log('✅ LOGIN CONTEXT - Connexion terminée avec succès');
      return response;
      
    } catch (error) {
      console.error('❌ LOGIN CONTEXT - Erreur:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    const response = await authService.register(username, email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    console.log('🚪 LOGOUT - Déconnexion');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};