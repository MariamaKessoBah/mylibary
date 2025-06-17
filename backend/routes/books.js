const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Book = require('../models/Book');
const User = require('../models/User');

const router = express.Router();

// ✅ MIDDLEWARE D'AUTHENTIFICATION (copié pour éviter les imports circulaires)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Format de token invalide'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();

  } catch (error) {
    console.error('❌ AUTH_MIDDLEWARE - Erreur:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification'
    });
  }
};

// ✅ VALIDATION POUR LES LIVRES
const bookValidation = [
  body('title')
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ max: 255 })
    .withMessage('Le titre ne peut pas dépasser 255 caractères'),
  body('author')
    .notEmpty()
    .withMessage('L\'auteur est requis')
    .isLength({ max: 255 })
    .withMessage('L\'auteur ne peut pas dépasser 255 caractères'),
  body('genre')
    .optional({ nullable: true })
    .isLength({ max: 100 })
    .withMessage('Le genre ne peut pas dépasser 100 caractères'),
  body('publication_year')
    .optional({ nullable: true })
    .isInt({ min: 1000, max: 2030 })
    .withMessage('L\'année de publication doit être entre 1000 et 2030'),
  body('pages')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 10000 })
    .withMessage('Le nombre de pages doit être entre 1 et 10000'),
  body('status')
    .optional()
    .isIn(['to_read', 'reading', 'read'])
    .withMessage('Le statut doit être to_read, reading ou read'),
  body('rating')
    .optional({ nullable: true })
    .custom((value) => {
      if (value !== null && (value < 1 || value > 5)) {
        throw new Error('La note doit être entre 1 et 5');
      }
      return true;
    }),
  body('notes')
    .optional({ nullable: true })
];

// ✅ NOUVELLE FONCTION POUR LES STATISTIQUES
const getStats = async (req, res) => {
  try {
    console.log('📊 GET_STATS - User ID:', req.user.id);

    const { Op } = require('sequelize');

    // Compter les livres par statut
    const totalBooks = await Book.count({ where: { user_id: req.user.id } });
    const readBooks = await Book.count({ where: { user_id: req.user.id, status: 'read' } });
    const readingBooks = await Book.count({ where: { user_id: req.user.id, status: 'reading' } });
    const toReadBooks = await Book.count({ where: { user_id: req.user.id, status: 'to_read' } });

    // Récupérer les genres les plus populaires
    const topGenres = await Book.findAll({
      where: { 
        user_id: req.user.id,
        genre: { [Op.not]: null }
      },
      attributes: [
        'genre',
        [require('sequelize').fn('COUNT', require('sequelize').col('genre')), 'count']
      ],
      group: ['genre'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('genre')), 'DESC']],
      limit: 5,
      raw: true
    });

    const stats = {
      totalBooks,
      readBooks,
      readingBooks,
      toReadBooks,
      topGenres: topGenres.map(genre => ({
        genre: genre.genre,
        count: parseInt(genre.count)
      }))
    };

    console.log('✅ GET_STATS - Stats calculées:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ GET_STATS - Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// ✅ FONCTION POUR CRÉER UN LIVRE
const createBook = async (req, res) => {
  try {
    console.log('📚 CREATE_BOOK - Données reçues:', req.body);
    console.log('📚 CREATE_BOOK - User ID:', req.user.id);

    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ CREATE_BOOK - Erreurs de validation:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const {
      title,
      author,
      genre,
      publication_year,
      pages,
      status = 'to_read',
      rating,
      notes
    } = req.body;

    // ✅ Nettoyer les données - convertir null en null pour la DB
    const cleanData = {
      title,
      author,
      genre: genre || null,
      publication_year: publication_year || null,
      pages: pages || null,
      status,
      rating: rating || null,
      notes: notes || null,
      user_id: req.user.id
    };

    console.log('📚 CREATE_BOOK - Données nettoyées:', cleanData);

    // Créer le livre
    const newBook = await Book.create(cleanData);

    console.log('✅ CREATE_BOOK - Livre créé:', newBook.id);

    res.status(201).json({
      success: true,
      message: 'Livre ajouté avec succès',
      data: newBook
    });

  } catch (error) {
    console.error('❌ CREATE_BOOK - Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du livre',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ FONCTION POUR RÉCUPÉRER LES LIVRES (MODIFIÉE pour correspondre au frontend)
const getUserBooks = async (req, res) => {
  try {
    console.log('📚 GET_BOOKS - User ID:', req.user.id);
    console.log('📚 GET_BOOKS - Query params:', req.query);

    const { status, genre, search, limit = 50, offset = 0 } = req.query;

    // Construire les conditions de recherche
    const whereConditions = { user_id: req.user.id };

    if (status) {
      whereConditions.status = status;
    }

    if (genre) {
      whereConditions.genre = genre;
    }

    if (search) {
      const { Op } = require('sequelize');
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }

    const books = await Book.findAndCountAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // ✅ ADAPTER LA RÉPONSE pour le frontend
    res.json({
      success: true,
      data: {
        books: books.rows,
        total: books.count,
        page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ GET_USER_BOOKS - Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des livres'
    });
  }
};

// ✅ FONCTION POUR RÉCUPÉRER UN LIVRE PAR ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({
      where: { 
        id: id,
        user_id: req.user.id 
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    res.json({
      success: true,
      data: book
    });

  } catch (error) {
    console.error('❌ GET_BOOK_BY_ID - Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du livre'
    });
  }
};

// ✅ FONCTION POUR METTRE À JOUR UN LIVRE
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    // Vérifier que le livre appartient à l'utilisateur
    const book = await Book.findOne({
      where: { 
        id: id,
        user_id: req.user.id 
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    // Mettre à jour
    await book.update(updates);

    console.log('✅ UPDATE_BOOK - Livre mis à jour:', book.id);

    res.json({
      success: true,
      message: 'Livre mis à jour avec succès',
      data: book
    });

  } catch (error) {
    console.error('❌ UPDATE_BOOK - Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour'
    });
  }
};

// ✅ FONCTION POUR SUPPRIMER UN LIVRE
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({
      where: { 
        id: id,
        user_id: req.user.id 
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    await book.destroy();

    console.log('✅ DELETE_BOOK - Livre supprimé:', id);

    res.json({
      success: true,
      message: 'Livre supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ DELETE_BOOK - Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

// ✅ TOUTES LES ROUTES NÉCESSITENT UNE AUTHENTIFICATION
router.use(authenticateToken);

// ✅ ROUTES CRUD
router.get('/stats', getStats);                         // GET /api/books/stats (NOUVELLE ROUTE)
router.post('/', bookValidation, createBook);           // POST /api/books
router.get('/', getUserBooks);                          // GET /api/books
router.get('/:id', getBookById);                        // GET /api/books/:id
router.put('/:id', bookValidation, updateBook);        // PUT /api/books/:id
router.delete('/:id', deleteBook);                     // DELETE /api/books/:id

// ✅ ROUTE DE TEST
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Route books fonctionne',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;