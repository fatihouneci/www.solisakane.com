/**
 * @file SearchPage.tsx
 * @description
 * EN: This page provides global search functionality across all content types.
 * FR: Cette page fournit une fonctionnalité de recherche globale dans tous les types de contenu.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserProvider';
import axios from 'axios';

// EN: Icons from Lucide React / FR: Icônes de Lucide React
import { 
  Search, 
  Filter, 
  Clock, 
  Star, 
  MessageSquare, 
  File, 
  Users, 
  Calendar,
  Image,
  Video,
  Music,
  FileText,
  Trash2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface SearchResult {
  type: 'message' | 'file' | 'contact' | 'status' | 'meeting' | 'chat';
  id: string;
  content?: string;
  title?: string;
  sender?: any;
  chat?: any;
  createdAt?: string;
  scheduledStart?: string;
  [key: string]: any;
}

interface SearchHistory {
  _id: string;
  query: string;
  type: string;
  isSaved: boolean;
  usageCount: number;
  lastUsed: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function SearchPage() {
  const { user, token } = useUser();
  
  // EN: State management / FR: Gestion d'état
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('global');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<SearchHistory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  
  // EN: Filter states / FR: États des filtres
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    fileTypes: [] as string[],
    chatTypes: [] as string[],
    statusTypes: [] as string[],
    meetingTypes: [] as string[]
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // EN: Search types configuration / FR: Configuration des types de recherche
  const searchTypes = [
    { id: 'global', label: 'Tout', icon: Search },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'files', label: 'Fichiers', icon: File },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'statuses', label: 'Statuts', icon: Star },
    { id: 'meetings', label: 'Réunions', icon: Calendar },
    { id: 'chats', label: 'Chats', icon: MessageSquare }
  ];

  // EN: File type options / FR: Options de type de fichier
  const fileTypeOptions = [
    { value: 'image/jpeg', label: 'Images JPEG', icon: Image },
    { value: 'image/png', label: 'Images PNG', icon: Image },
    { value: 'video/mp4', label: 'Vidéos MP4', icon: Video },
    { value: 'audio/mp3', label: 'Audio MP3', icon: Music },
    { value: 'application/pdf', label: 'Documents PDF', icon: FileText }
  ];

  // EN: Perform search / FR: Effectuer une recherche
  const performSearch = async (query: string, type: string = searchType, resetResults: boolean = true) => {
    if (!query.trim() || !token) return;

    setIsLoading(true);
    if (resetResults) {
      setResults([]);
      setSkip(0);
    }

    try {
      const { data } = await axios.post(`${API_URL}/search`, {
        q: query,
        type,
        filters,
        limit: 20,
        skip: resetResults ? 0 : skip
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (resetResults) {
        setResults(data.results);
      } else {
        setResults(prev => [...prev, ...data.results]);
      }
      
      setTotalCount(data.totalCount);
      setHasMore(data.hasMore);
      setSkip(data.returnedCount);
    } catch (error) {
      console.error('EN: Search error / FR: Erreur de recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // EN: Get search suggestions / FR: Récupérer les suggestions de recherche
  const getSuggestions = async (query: string) => {
    if (!query.trim() || !token) {
      setSuggestions([]);
      return;
    }

    try {
      const { data } = await axios.get(`${API_URL}/search/suggestions`, {
        params: { q: query, type: searchType },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('EN: Suggestions error / FR: Erreur de suggestions:', error);
    }
  };

  // EN: Load search history / FR: Charger l'historique de recherche
  const loadSearchHistory = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/search/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchHistory(data.searches);
    } catch (error) {
      console.error('EN: History error / FR: Erreur d\'historique:', error);
    }
  };

  // EN: Handle search input change / FR: Gérer le changement de saisie de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      getSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  // EN: Handle search submit / FR: Gérer la soumission de recherche
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery, searchType, true);
      setShowHistory(false);
    }
  };

  // EN: Handle suggestion click / FR: Gérer le clic sur suggestion
  const handleSuggestionClick = (suggestion: SearchHistory) => {
    setSearchQuery(suggestion.query);
    setSearchType(suggestion.type);
    performSearch(suggestion.query, suggestion.type, true);
    setShowHistory(false);
  };

  // EN: Handle history item click / FR: Gérer le clic sur élément d'historique
  const handleHistoryClick = (historyItem: SearchHistory) => {
    setSearchQuery(historyItem.query);
    setSearchType(historyItem.type);
    performSearch(historyItem.query, historyItem.type, true);
    setShowHistory(false);
  };

  // EN: Load more results / FR: Charger plus de résultats
  const loadMoreResults = () => {
    if (hasMore && !isLoading) {
      performSearch(searchQuery, searchType, false);
    }
  };

  // EN: Clear search history / FR: Effacer l'historique de recherche
  const clearSearchHistory = async () => {
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/search/clear-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchHistory([]);
    } catch (error) {
      console.error('EN: Clear history error / FR: Erreur d\'effacement d\'historique:', error);
    }
  };

  // EN: Save/unsave search / FR: Sauvegarder/ne plus sauvegarder une recherche
  const toggleSaveSearch = async (searchId: string, isSaved: boolean) => {
    if (!token) return;

    try {
      const endpoint = isSaved ? 'unsave' : 'save';
      await axios.put(`${API_URL}/search/${searchId}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // EN: Update local state / FR: Mettre à jour l'état local
      setSearchHistory(prev => prev.map(item => 
        item._id === searchId ? { ...item, isSaved: !isSaved } : item
      ));
    } catch (error) {
      console.error('EN: Toggle save error / FR: Erreur de basculement de sauvegarde:', error);
    }
  };

  // EN: Get result icon / FR: Récupérer l'icône de résultat
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'file': return File;
      case 'contact': return Users;
      case 'status': return Star;
      case 'meeting': return Calendar;
      case 'chat': return MessageSquare;
      default: return Search;
    }
  };

  // EN: Format result date / FR: Formater la date de résultat
  const formatResultDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${Math.floor(diffInHours)} heures`;
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  // EN: Load history on component mount / FR: Charger l'historique au montage du composant
  useEffect(() => {
    loadSearchHistory();
  }, [token]);

  // EN: Focus search input on mount / FR: Focuser l'input de recherche au montage
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EN: Header / FR: En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recherche Globale</h1>
              <p className="text-sm text-gray-500">Recherchez dans tous vos contenus</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* EN: Search Sidebar / FR: Barre latérale de recherche */}
          <div className="lg:col-span-1">
            {/* EN: Search Form / FR: Formulaire de recherche */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                {/* EN: Search Input / FR: Input de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* EN: Search Type Selector / FR: Sélecteur de type de recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de recherche</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {searchTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* EN: Search Button / FR: Bouton de recherche */}
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isLoading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Recherche...' : 'Rechercher'}
                </button>
              </form>
            </div>

            {/* EN: Filters / FR: Filtres */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>

              {showFilters && (
                <div className="space-y-4">
                  {/* EN: Date Range / FR: Plage de dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plage de dates</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* EN: File Types / FR: Types de fichiers */}
                  {searchType === 'files' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Types de fichiers</label>
                      <div className="space-y-2">
                        {fileTypeOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.fileTypes.includes(option.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilters(prev => ({
                                      ...prev,
                                      fileTypes: [...prev.fileTypes, option.value]
                                    }));
                                  } else {
                                    setFilters(prev => ({
                                      ...prev,
                                      fileTypes: prev.fileTypes.filter(type => type !== option.value)
                                    }));
                                  }
                                }}
                                className="mr-2"
                              />
                              <Icon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* EN: Search History / FR: Historique de recherche */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Historique</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <Clock className="h-5 w-5" />
                  </button>
                  <button
                    onClick={clearSearchHistory}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {showHistory && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchHistory.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleHistoryClick(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.query}</p>
                        <p className="text-xs text-gray-500">{item.type} • {item.usageCount} fois</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveSearch(item._id, item.isSaved);
                        }}
                        className="ml-2 text-gray-400 hover:text-yellow-500"
                      >
                        {item.isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EN: Search Results / FR: Résultats de recherche */}
          <div className="lg:col-span-3">
            {/* EN: Search Suggestions / FR: Suggestions de recherche */}
            {suggestions.length > 0 && searchQuery && (
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h3>
                <div className="space-y-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion._id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
                    >
                      {suggestion.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EN: Results Header / FR: En-tête des résultats */}
            {results.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Résultats</h2>
                    <p className="text-sm text-gray-500">
                      {totalCount} résultat{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  {isLoading && (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  )}
                </div>
              </div>
            )}

            {/* EN: Results List / FR: Liste des résultats */}
            <div className="space-y-4">
              {results.map((result) => {
                const Icon = getResultIcon(result.type);
                return (
                  <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {result.title || result.content || result.firstName + ' ' + result.lastName}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {result.type}
                          </span>
                        </div>
                        
                        {result.content && (
                          <p className="text-gray-600 mt-1 line-clamp-2">{result.content}</p>
                        )}
                        
                        {result.sender && (
                          <p className="text-sm text-gray-500 mt-1">
                            Par {result.sender.firstName} {result.sender.lastName}
                          </p>
                        )}
                        
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatResultDate(result.createdAt || result.scheduledStart || '')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* EN: Load More Button / FR: Bouton Charger Plus */}
            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMoreResults}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Chargement...' : 'Charger plus'}
                </button>
              </div>
            )}

            {/* EN: No Results / FR: Aucun résultat */}
            {results.length === 0 && searchQuery && !isLoading && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-500">
                  Essayez avec d'autres mots-clés ou modifiez vos filtres.
                </p>
              </div>
            )}

            {/* EN: Empty State / FR: État vide */}
            {!searchQuery && results.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Recherche Globale</h3>
                <p className="text-gray-500">
                  Recherchez dans vos messages, fichiers, contacts, statuts, réunions et chats.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
