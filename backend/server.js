const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ MIDDLEWARE CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // React/Vite
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ MIDDLEWARE POUR PARSER JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ MIDDLEWARE DE LOGGING
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ ROUTE DE SANTÉ POUR TESTER
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Backend MyLibrary fonctionne correctement', 
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT,
    database: 'MySQL',
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// ✅ ROUTE RACINE
app.get('/', (req, res) => {
  res.json({
    message: 'API MyLibrary - Gestionnaire de bibliothèque personnelle',
    status: 'OK',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      books: '/api/books'
    }
  });
});

// ✅ IMPORT DES ROUTES (adapté à vos noms de fichiers)
let authRoutes, bookRoutes;

try {
  // Vos fichiers s'appellent auth.js et book.js
  authRoutes = require('./routes/auth');
  bookRoutes = require('./routes/books');
  console.log('✅ Routes importées avec succès');
} catch (error) {
  console.error('❌ Erreur import routes:', error.message);
  console.log('🔧 Vérifiez que les fichiers routes/auth.js et routes/book.js existent');
  process.exit(1);
}

// ✅ UTILISATION DES ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// ✅ MIDDLEWARE DE GESTION D'ERREURS
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  
  // Erreur de validation Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Erreur de contrainte unique Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Cette valeur existe déjà',
      field: err.errors[0]?.path
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  // Erreur générique
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// ✅ ROUTE 404 POUR LES ENDPOINTS NON TROUVÉS
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} non trouvé`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/books',
      'POST /api/books'
    ]
  });
});

// ✅ ROUTE 404 GÉNÉRALE
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Page non trouvée',
    suggestion: 'Essayez /api/health pour tester l\'API'
  });
});

// ✅ FONCTION D'INITIALISATION DE LA BASE DE DONNÉES
const initDatabase = async () => {
  try {
    // Import des modèles
    const { initDatabase: dbInit } = require('./models');
    
    if (dbInit) {
      console.log('🔄 Initialisation de la base de données...');
      const dbInitialized = await dbInit();
      
      if (!dbInitialized) {
        console.error('❌ Impossible d\'initialiser la base de données MySQL');
        console.error('🔧 Vérifiez que MySQL est démarré et que vos identifiants dans .env sont corrects');
        return false;
      }
      
      return true;
    } else {
      console.log('⚠️  Fonction initDatabase non trouvée - démarrage sans init DB');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation DB:', error.message);
    console.log('⚠️  Démarrage du serveur sans initialisation de la base de données');
    return true; // Continue quand même
  }
};

// ✅ FONCTION DE DÉMARRAGE DU SERVEUR
const startServer = async () => {
  try {
    console.log('🚀 Démarrage du serveur MyLibrary...');
    console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialiser la base de données (optionnel)
    await initDatabase();

    // Démarrer le serveur Express
    const server = app.listen(PORT, () => {
      console.log('\n🎉 ===== SERVEUR MYLIBRARY DÉMARRÉ =====');
      console.log(`🚀 Serveur: http://localhost:${PORT}`);
      console.log(`📋 Santé: http://localhost:${PORT}/api/health`);
      console.log(`📚 Livres: http://localhost:${PORT}/api/books`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`🗄️  Base: MySQL (${process.env.DB_NAME || 'mylibrary'})`);
      console.log(`🌐 CORS: Activé pour localhost:3000 et localhost:5173`);
      console.log('=========================================\n');
      console.log('✅ Serveur prêt à recevoir des requêtes!');
      console.log('📝 Testez avec: curl http://localhost:' + PORT + '/api/health');
    });

    // Gestion des erreurs de serveur
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Le port ${PORT} est déjà utilisé`);
        console.log('🔧 Solutions:');
        console.log('   - Changez le port dans .env: PORT=5001');
        console.log('   - Ou tuez le processus: kill -9 $(lsof -ti:' + PORT + ')');
      } else {
        console.error('❌ Erreur serveur:', error);
      }
      process.exit(1);
    });

    return server;

  } catch (error) {
    console.error('❌ Erreur fatale au démarrage:', error);
    process.exit(1);
  }
};

// ✅ GESTION PROPRE DE L'ARRÊT DU SERVEUR
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur (CTRL+C)...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Arrêt du serveur (SIGTERM)...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  console.log('🔧 Arrêt du serveur...');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  console.log('🔧 Arrêt du serveur...');
  process.exit(1);
});

// ✅ DÉMARRER LE SERVEUR
if (require.main === module) {
  startServer();
}

// ✅ EXPORT POUR LES TESTS
module.exports = app;