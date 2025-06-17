const { Book, User } = require('../models'); // ✅ Import depuis index.js

class BookController {
  // Créer un livre
  static async createBook(req, res) {
    try {
      console.log('📚 CREATE_BOOK - Données reçues:', req.body);
      console.log('📚 CREATE_BOOK - User ID:', req.user.id);

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

      // Validation des champs requis
      if (!title || !author) {
        return res.status(400).json({
          success: false,
          message: 'Le titre et l\'auteur sont requis',
          errors: [
            { field: 'title', message: 'Le titre est requis' },
            { field: 'author', message: 'L\'auteur est requis' }
          ]
        });
      }

      // Créer le livre
      const newBook = await Book.create({
        title,
        author,
        genre: genre || null,
        publication_year: publication_year || null,
        pages: pages || null,
        status,
        rating: status === 'read' ? rating : null, // Seulement si lu
        notes: notes || null,
        user_id: req.user.id
      });

      console.log('✅ CREATE_BOOK - Livre créé:', newBook.id);

      res.status(201).json({
        success: true,
        message: 'Livre ajouté avec succès',
        data: newBook
      });

    } catch (error) {
      console.error('❌ CREATE_BOOK - Erreur:', error);
      
      // Gestion des erreurs de validation Sequelize
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => ({
          field: err.path,
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: validationErrors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du livre',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Récupérer les livres de l'utilisateur
  static async getUserBooks(req, res) {
    try {
      const books = await Book.findAll({
        where: { user_id: req.user.id },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: books
      });

    } catch (error) {
      console.error('❌ GET_USER_BOOKS - Erreur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des livres'
      });
    }
  }
}

module.exports = BookController;