// =============================================
// 🔧 BACKEND/MODELS/DATABASE.JS - CONNEXION MYSQL
// =============================================

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration de la connexion MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'mylibrary',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log, // Ou false pour désactiver les logs SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      charset: 'utf8mb4'
      // Retiré collate d'ici car il cause l'erreur
    },
    // Définir le charset au niveau principal si nécessaire
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// Fonction d'initialisation de la base de données
const initDatabase = async () => {
  try {
    // Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à MySQL réussie');
    console.log(`🗄️  Base de données: ${process.env.DB_NAME || 'mylibrary'}`);
    console.log(`🖥️  Serveur MySQL: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);

    // Synchroniser les modèles avec la base de données
    await sequelize.sync({ alter: true });
    console.log('✅ Tables MySQL synchronisées');

    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL:', error.message);
    console.error('🔧 Vérifiez votre configuration dans le fichier .env');
    return false;
  }
};

module.exports = { 
  sequelize, 
  initDatabase 
};