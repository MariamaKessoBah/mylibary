const User = require('./User');
const Book = require('./Book');

// Définir les associations
User.hasMany(Book, { foreignKey: 'user_id', as: 'books' });
Book.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { User, Book };