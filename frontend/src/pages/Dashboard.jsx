import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../services/bookService';
import { BookOpen, Plus, TrendingUp, Clock, CheckCircle, Users } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Récupérer les statistiques
        const statsResponse = await bookService.getStats();
        setStats(statsResponse.data);

        // Récupérer les livres récents
        const booksResponse = await bookService.getBooks({ limit: 5 });
        setRecentBooks(booksResponse.data.books);
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Livres',
      value: stats?.totalBooks || 0,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Livres Lus',
      value: stats?.readBooks || 0,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'En Cours',
      value: stats?.readingBooks || 0,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'À Lire',
      value: stats?.toReadBooks || 0,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.username} ! 👋
          </h1>
          <p className="text-gray-600">Voici un aperçu de votre bibliothèque</p>
        </div>
        <Link
          to="/books"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un livre</span>
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Livres récents */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Livres Récents</h2>
          <Link
            to="/books"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Voir tous
          </Link>
        </div>

        {recentBooks.length > 0 ? (
          <div className="space-y-4">
            {recentBooks.map((book) => (
              <div key={book.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.status === 'read' ? 'bg-green-100 text-green-800' :
                    book.status === 'reading' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {book.status === 'read' ? 'Lu' : 
                     book.status === 'reading' ? 'En cours' : 'À lire'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Aucun livre dans votre bibliothèque</p>
            <Link to="/books" className="btn btn-primary">
              Ajouter votre premier livre
            </Link>
          </div>
        )}
      </div>

      {/* Genres populaires */}
      {stats?.topGenres && stats.topGenres.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Genres Favoris</h2>
          <div className="space-y-3">
            {stats.topGenres.map((genre, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{genre.genre}</span>
                <span className="text-sm text-gray-500">{genre.count} livre(s)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;