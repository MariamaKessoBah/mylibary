const express = require('express');
const { body } = require('express-validator');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getStats
} = require('../controllers/bookController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
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
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le genre ne peut pas dépasser 100 caractères'),
  body('publication_year')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('L\'année de publication doit être valide'),
  body('pages')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le nombre de pages doit être un nombre positif'),
  body('status')
    .optional()
    .isIn(['to_read', 'reading', 'read'])
    .withMessage('Le statut doit être: to_read, reading, ou read'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être entre 1 et 5')
];

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes
router.get('/', getBooks);
router.get('/stats', getStats);
router.get('/:id', getBook);
router.post('/', bookValidation, createBook);
router.put('/:id', bookValidation, updateBook);
router.delete('/:id', deleteBook);

module.exports = router;