const User = require('./User');
const Book = require('./Book');
const { sequelize, initDatabase } = require('./Database');

// ✅ Définir les associations APRÈS l'import des modèles
User.hasMany(Book, { 
  foreignKey: 'user_id', 
  as: 'books',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Book.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// ✅ Export avec la fonction d'initialisation
module.exports = { 
  User, 
  Book, 
  sequelize, 
  initDatabase 
};