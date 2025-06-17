const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // ✅ Import depuis index.js
const { Op } = require('sequelize');

class AuthController {
  // Inscription
  static async register(req, res) {
    try {
      console.log('📝 REGISTER - Données reçues:', req.body);
      
      const { username, email, password, firstName, lastName } = req.body;

      // Validation des données
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email et password sont requis'
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: email },
            { username: username }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Un utilisateur avec cet email ou username existe déjà'
        });
      }

      // Hasher le mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Créer l'utilisateur
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null
      });

      console.log('✅ REGISTER - Utilisateur créé:', newUser.id);

      // Générer le token JWT
      const token = jwt.sign(
        { 
          id: newUser.id, 
          username: newUser.username,
          email: newUser.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
          },
          token
        }
      });

    } catch (error) {
      console.error('❌ REGISTER - Erreur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du compte',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Connexion
  static async login(req, res) {
    try {
      console.log('🔐 LOGIN - Tentative de connexion:', req.body.email || req.body.username);
      
      const { email, username, password } = req.body;

      // Validation
      if ((!email && !username) || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/username et mot de passe requis'
        });
      }

      // Chercher l'utilisateur
      const user = await User.findOne({
        where: email ? { email } : { username }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Identifiants incorrects'
        });
      }

      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Identifiants incorrects'
        });
      }

      console.log('✅ LOGIN - Connexion réussie pour:', user.username);

      // Générer le token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          token
        }
      });

    } catch (error) {
      console.error('❌ LOGIN - Erreur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController;