const { Book } = require('../models');
const { validationResult } = require('express-validator');
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');

// Obtenir tous les livres de l'utilisateur
const getBooks = async (req, res) => {
  try {
    const { search, genre, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Construire les conditions de recherche
    const whereConditions = { user_id: req.user.id };

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }

    if (genre) {
      whereConditions.genre = genre;
    }

    if (status) {
      whereConditions.status = status;
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where: whereConditions,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          perPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des livres'
    });
  }
};

// Obtenir un livre par ID
const getBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findOne({
      where: { id, user_id: req.user.id }
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
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du livre'
    });
  }
};

// Créer un nouveau livre
const createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const bookData = {
      ...req.body,
      user_id: req.user.id
    };

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: 'Livre ajouté avec succès',
      data: book
    });
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du livre'
    });
  }
};

// Mettre à jour un livre
const updateBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    
    const book = await Book.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    await book.update(req.body);

    res.json({
      success: true,
      message: 'Livre mis à jour avec succès',
      data: book
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du livre'
    });
  }
};

// Supprimer un livre
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await Book.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    await book.destroy();

    res.json({
      success: true,
      message: 'Livre supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du livre'
    });
  }
};

// Obtenir les statistiques des livres
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalBooks = await Book.count({ where: { user_id: userId } });
    const readBooks = await Book.count({ where: { user_id: userId, status: 'read' } });
    const readingBooks = await Book.count({ where: { user_id: userId, status: 'reading' } });
    const toReadBooks = await Book.count({ where: { user_id: userId, status: 'to_read' } });

    // Genres les plus populaires
    const genreStats = await Book.findAll({
      attributes: [
        'genre',
        [fn('COUNT', col('genre')), 'count']
      ],
      where: { user_id: userId, genre: { [Op.not]: null } },
      group: ['genre'],
      order: [[literal('count'), 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        totalBooks,
        readBooks,
        readingBooks,
        toReadBooks,
        topGenres: genreStats
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getStats
};