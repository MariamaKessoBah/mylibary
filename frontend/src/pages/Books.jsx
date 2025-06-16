import React, { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';
import { Plus, Search, Filter, Edit, Trash2, Star, BookOpen } from 'lucide-react';
import Modal from '../components/UI/Modal';
import BookForm from '../components/Books/BookForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les livres
  const fetchBooks = async () => {
    try {
      const response = await bookService.getBooks({
        search: searchTerm,
        status: statusFilter,
        genre: genreFilter
      });
      setBooks(response.data.books);
    } catch (error) {
      toast.error('Erreur lors du chargement des livres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, statusFilter, genreFilter]);

  // Ajouter/Modifier un livre
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingBook) {
        await bookService.updateBook(editingBook.id, formData);
        toast.success('Livre modifié avec succès !');
      } else {
        await bookService.createBook(formData);
        toast.success('Livre ajouté avec succès !');
      }
      
      setIsModalOpen(false);
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un livre
  const handleDelete = async (book) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${book.title}" ?`)) {
      try {
        await bookService.deleteBook(book.id);
        toast.success('Livre supprimé avec succès !');
        fetchBooks();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // Ouvrir le modal d'édition
  const handleEdit = (book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  // Ouvrir le modal d'ajout
  const handleAdd = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  // Afficher les étoiles
  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const statusLabels = {
    'to_read': 'À lire',
    'reading': 'En cours',
    'read': 'Lu'
  };

  const statusColors = {
    'to_read': 'bg-yellow-100 text-yellow-800',
    'reading': 'bg-blue-100 text-blue-800',
    'read': 'bg-green-100 text-green-800'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ma Bibliothèque</h1>
        <button
          onClick={handleAdd}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un livre</span>
        </button>
      </div>

      {/* Filtres - SECTION MANQUANTE CORRIGÉE */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Tous les statuts</option>
            <option value="to_read">À lire</option>
            <option value="reading">En cours</option>
            <option value="read">Lu</option>
          </select>

          <input
            type="text"
            placeholder="Filtrer par genre..."
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Liste des livres - STRUCTURE CORRIGÉE */}
      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(book)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(book)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {book.genre && (
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{book.genre}</span>
                  </div>
                )}
                {book.publication_year && (
                  <div className="text-sm text-gray-600">
                    Publié en {book.publication_year}
                  </div>
                )}
                {book.pages && (
                  <div className="text-sm text-gray-600">
                    {book.pages} pages
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[book.status]}`}>
                  {statusLabels[book.status]}
                </span>
                {book.rating && renderStars(book.rating)}
              </div>

              {book.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 line-clamp-3">{book.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun livre trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter || genreFilter
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Commencez par ajouter votre premier livre à votre bibliothèque'}
          </p>
          <button
            onClick={handleAdd}
            className="btn btn-primary"
          >
            Ajouter un livre
          </button>
        </div>
      )}

      {/* Modal pour ajouter/modifier un livre */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBook(null);
        }}
        title={editingBook ? 'Modifier le livre' : 'Ajouter un livre'}
      >
        <BookForm
          book={editingBook}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingBook(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Books;