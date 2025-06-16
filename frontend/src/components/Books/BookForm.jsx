import React from 'react';
import { useForm } from 'react-hook-form';

const BookForm = ({ book, onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: book || {
      title: '',
      author: '',
      genre: '',
      publication_year: '',
      pages: '',
      status: 'to_read',
      rating: '',
      notes: ''
    }
  });

  const currentYear = new Date().getFullYear();
  const statusValue = watch('status');

  // Fonction pour nettoyer et valider les données avant envoi
  const handleFormSubmit = (data) => {
    // Nettoyer et convertir les données
    const cleanedData = {
      title: data.title.trim(),
      author: data.author.trim(),
      genre: data.genre?.trim() || null,
      publication_year: data.publication_year ? parseInt(data.publication_year) : null,
      pages: data.pages ? parseInt(data.pages) : null,
      status: data.status,
      rating: data.rating ? parseInt(data.rating) : null,
      notes: data.notes?.trim() || null
    };

    // Validation logique : pas de note si le livre n'est pas lu
    if (cleanedData.status !== 'read' && cleanedData.rating) {
      cleanedData.rating = null;
    }

    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Titre *
        </label>
        <input
          {...register('title', { 
            required: 'Le titre est requis',
            minLength: { value: 1, message: 'Le titre ne peut pas être vide' }
          })}
          type="text"
          className="input mt-1"
          placeholder="Titre du livre"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Auteur *
        </label>
        <input
          {...register('author', { 
            required: 'L\'auteur est requis',
            minLength: { value: 1, message: 'L\'auteur ne peut pas être vide' }
          })}
          type="text"
          className="input mt-1"
          placeholder="Nom de l'auteur"
        />
        {errors.author && (
          <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Genre
          </label>
          <input
            {...register('genre')}
            type="text"
            className="input mt-1"
            placeholder="Fiction, Science, etc."
          />
          <p className="mt-1 text-xs text-gray-500">Optionnel</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Année de publication
          </label>
          <input
            {...register('publication_year', {
              validate: {
                validYear: value => {
                  if (!value) return true; // Optionnel
                  const year = parseInt(value);
                  return (year >= 1000 && year <= currentYear + 1) || 'Année invalide';
                }
              }
            })}
            type="number"
            className="input mt-1"
            placeholder="2023"
            min="1000"
            max={currentYear + 1}
          />
          {errors.publication_year && (
            <p className="mt-1 text-sm text-red-600">{errors.publication_year.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Optionnel</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre de pages
          </label>
          <input
            {...register('pages', {
              validate: {
                validPages: value => {
                  if (!value) return true; // Optionnel
                  const pages = parseInt(value);
                  return (pages > 0 && pages <= 10000) || 'Nombre de pages invalide';
                }
              }
            })}
            type="number"
            className="input mt-1"
            placeholder="250"
            min="1"
            max="10000"
          />
          {errors.pages && (
            <p className="mt-1 text-sm text-red-600">{errors.pages.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Optionnel</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Statut *
          </label>
          <select
            {...register('status', { required: 'Le statut est requis' })}
            className="input mt-1"
          >
            <option value="to_read">À lire</option>
            <option value="reading">En cours de lecture</option>
            <option value="read">Terminé (Lu)</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Note (1-5 étoiles)
        </label>
        <select
          {...register('rating')}
          className="input mt-1"
          disabled={statusValue !== 'read'}
        >
          <option value="">Pas de note</option>
          <option value="1">⭐ (1 étoile) - Décevant</option>
          <option value="2">⭐⭐ (2 étoiles) - Moyen</option>
          <option value="3">⭐⭐⭐ (3 étoiles) - Bien</option>
          <option value="4">⭐⭐⭐⭐ (4 étoiles) - Très bien</option>
          <option value="5">⭐⭐⭐⭐⭐ (5 étoiles) - Excellent</option>
        </select>
        {statusValue !== 'read' && (
          <p className="mt-1 text-xs text-amber-600">
            💡 La note n'est disponible que pour les livres terminés
          </p>
        )}
        {statusValue === 'read' && (
          <p className="mt-1 text-xs text-gray-500">
            Optionnel - Vous pouvez noter ce livre
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notes personnelles
        </label>
        <textarea
          {...register('notes')}
          rows="3"
          className="input mt-1 resize-none"
          placeholder="Vos impressions, ce que vous avez aimé/pas aimé, citations marquantes..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Optionnel - Partagez vos réflexions sur ce livre
        </p>
      </div>

      {/* Résumé des informations */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h4 className="text-sm font-medium text-gray-700 mb-2">📋 Résumé :</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Statut :</strong> {
            statusValue === 'to_read' ? '📚 À lire' :
            statusValue === 'reading' ? '📖 En cours de lecture' :
            '✅ Terminé'
          }</p>
          {statusValue === 'read' && (
            <p className="text-green-600">
              💡 Vous pouvez maintenant ajouter une note et vos impressions !
            </p>
          )}
          {statusValue !== 'read' && (
            <p className="text-blue-600">
              📝 Changez le statut en "Terminé" pour pouvoir noter le livre
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Enregistrement...</span>
            </div>
          ) : (
            book ? '✏️ Modifier le livre' : '➕ Ajouter le livre'
          )}
        </button>
      </div>
    </form>
  );
};

export default BookForm;