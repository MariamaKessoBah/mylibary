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

    // 🔧 LOGIQUE MÉTIER IMPORTANTE : 
    // Automatiquement supprimer la note si le livre n'est pas "lu"
    if (cleanedData.status === 'to_read' || cleanedData.status === 'reading') {
      cleanedData.rating = null;
      console.log(`📚 Statut "${cleanedData.status}" - note supprimée automatiquement`);
    }

    console.log('📋 Données nettoyées envoyées:', cleanedData);
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
            placeholder="Roman épistolaire, Science-Fiction..."
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
            placeholder="1979"
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
            placeholder="131"
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
            <option value="to_read">📚 À lire</option>
            <option value="reading">📖 En cours de lecture</option>
            <option value="read">✅ Terminé (Lu)</option>
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
          className={`input mt-1 ${statusValue !== 'read' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          disabled={statusValue !== 'read'}
        >
          <option value="">
            {statusValue !== 'read' ? 'Pas de note (livre non terminé)' : 'Pas de note'}
          </option>
          <option value="1">⭐ (1 étoile) - Décevant</option>
          <option value="2">⭐⭐ (2 étoiles) - Moyen</option>
          <option value="3">⭐⭐⭐ (3 étoiles) - Bien</option>
          <option value="4">⭐⭐⭐⭐ (4 étoiles) - Très bien</option>
          <option value="5">⭐⭐⭐⭐⭐ (5 étoiles) - Excellent</option>
        </select>
        
        {statusValue === 'to_read' && (
          <p className="mt-1 text-xs text-blue-600">
            📚 Changez le statut en "Terminé" pour pouvoir noter ce livre
          </p>
        )}
        
        {statusValue === 'reading' && (
          <p className="mt-1 text-xs text-amber-600">
            📖 Terminez la lecture pour pouvoir noter ce livre
          </p>
        )}
        
        {statusValue === 'read' && (
          <p className="mt-1 text-xs text-green-600">
            ⭐ Vous pouvez maintenant noter ce livre !
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
          placeholder={
            statusValue === 'to_read' ? 
            "Pourquoi voulez-vous lire ce livre ? Qui vous l'a recommandé ?" :
            statusValue === 'reading' ?
            "Vos impressions actuelles, citations marquantes..." :
            "Votre avis final, ce que vous avez aimé/pas aimé..."
          }
        />
        <p className="mt-1 text-xs text-gray-500">
          Optionnel - Partagez vos réflexions sur ce livre
        </p>
      </div>

      {/* Résumé dynamique des informations */}
      <div className={`rounded-lg p-4 border ${
        statusValue === 'to_read' ? 'bg-blue-50 border-blue-200' :
        statusValue === 'reading' ? 'bg-amber-50 border-amber-200' :
        'bg-green-50 border-green-200'
      }`}>
        <h4 className="text-sm font-medium text-gray-700 mb-2">📋 Résumé :</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Statut :</strong> {
            statusValue === 'to_read' ? '📚 À lire - Ce livre est dans votre liste d\'attente' :
            statusValue === 'reading' ? '📖 En cours de lecture - Bonne lecture !' :
            '✅ Terminé - Félicitations pour avoir terminé ce livre !'
          }</p>
          
          {statusValue === 'read' && (
            <p className="text-green-600">
              🎉 Vous pouvez maintenant ajouter une note et vos impressions finales !
            </p>
          )}
          
          {statusValue === 'reading' && (
            <p className="text-amber-600">
              💪 Continuez votre lecture ! Vous pourrez noter le livre une fois terminé.
            </p>
          )}
          
          {statusValue === 'to_read' && (
            <p className="text-blue-600">
              🎯 Ce livre vous attend ! Changez le statut quand vous commencerez.
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