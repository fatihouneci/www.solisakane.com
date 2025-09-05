/**
 * @file MediaGalleryPage.tsx
 * @description
 * EN: This page displays the user's media gallery with upload, search, and management capabilities.
 * FR: Cette page affiche la galerie de médias de l'utilisateur avec des capacités de téléversement, de recherche et de gestion.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserProvider';
import axios from 'axios';

// EN: Icons from Lucide React / FR: Icônes de Lucide React
import { 
  Upload, 
  Search, 
  Grid, 
  List, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  Eye,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  MoreVertical,
  Plus,
  X
} from 'lucide-react';

interface MediaFile {
  _id: string;
  name: string;
  originalName: string;
  type: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  url: string;
  thumbnail?: string;
  metadata: {
    description?: string;
    tags?: string[];
    width?: number;
    height?: number;
    duration?: number;
  };
  createdAt: string;
  downloadCount: number;
}

interface FileStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Array<{
    _id: string;
    count: number;
    totalSize: number;
  }>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function MediaGalleryPage() {
  const { user, token } = useUser();
  
  // EN: State management / FR: Gestion d'état
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // EN: Refs / FR: Références
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // EN: Load media files / FR: Charger les fichiers médias
  const loadMediaFiles = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sort: sortBy
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const { data } = await axios.get(`${API_URL}/media/gallery?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFiles(data.files);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('EN: Error loading media files / FR: Erreur de chargement des fichiers médias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // EN: Load file statistics / FR: Charger les statistiques de fichiers
  const loadFileStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/media/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data.stats);
    } catch (error) {
      console.error('EN: Error loading file stats / FR: Erreur de chargement des statistiques:', error);
    }
  };

  // EN: Search files / FR: Rechercher des fichiers
  const searchFiles = async () => {
    if (!searchTerm.trim()) {
      loadMediaFiles();
      return;
    }

    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        q: searchTerm,
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const { data } = await axios.get(`${API_URL}/media/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFiles(data.files);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('EN: Error searching files / FR: Erreur de recherche de fichiers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // EN: Handle file upload / FR: Gérer le téléversement de fichier
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file);
      });

      const { data } = await axios.post(`${API_URL}/media/upload-multiple`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(progress);
        }
      });

      // EN: Reload files after upload / FR: Recharger les fichiers après téléversement
      await loadMediaFiles();
      await loadFileStats();
      
      setShowUploadModal(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('EN: Error uploading files / FR: Erreur de téléversement:', error);
    } finally {
      setUploading(false);
    }
  };

  // EN: Handle file download / FR: Gérer le téléchargement de fichier
  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const response = await axios.get(`${API_URL}/media/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('EN: Error downloading file / FR: Erreur de téléchargement:', error);
    }
  };

  // EN: Handle file deletion / FR: Gérer la suppression de fichier
  const handleDelete = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;

    try {
      await axios.delete(`${API_URL}/media/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await loadMediaFiles();
      await loadFileStats();
    } catch (error) {
      console.error('EN: Error deleting file / FR: Erreur de suppression:', error);
    }
  };

  // EN: Get file icon based on category / FR: Obtenir l'icône de fichier basée sur la catégorie
  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image': return <ImageIcon className="h-6 w-6" />;
      case 'video': return <Video className="h-6 w-6" />;
      case 'audio': return <Music className="h-6 w-6" />;
      case 'document': return <FileText className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  // EN: Format file size / FR: Formater la taille de fichier
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // EN: Load data on component mount / FR: Charger les données au montage du composant
  useEffect(() => {
    if (token) {
      loadMediaFiles();
      loadFileStats();
    }
  }, [token, currentPage, selectedCategory, sortBy]);

  // EN: Search when search term changes / FR: Rechercher quand le terme de recherche change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchFiles();
      } else {
        loadMediaFiles();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EN: Header / FR: En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Galerie de Médias</h1>
              <p className="text-sm text-gray-500">
                {stats ? `${stats.totalFiles} fichiers • ${formatFileSize(stats.totalSize)}` : 'Chargement...'}
              </p>
            </div>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Téléverser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* EN: Filters and Search / FR: Filtres et Recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* EN: Search / FR: Recherche */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher des fichiers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* EN: Filters / FR: Filtres */}
            <div className="flex items-center space-x-4">
              {/* EN: Category Filter / FR: Filtre de Catégorie */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Toutes les catégories</option>
                <option value="image">Images</option>
                <option value="video">Vidéos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
                <option value="other">Autres</option>
              </select>

              {/* EN: Sort By / FR: Trier Par */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="name">Nom</option>
                <option value="size">Taille</option>
              </select>

              {/* EN: View Mode / FR: Mode d'Affichage */}
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EN: Files Display / FR: Affichage des Fichiers */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <ImageIcon className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fichier trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Aucun fichier ne correspond à votre recherche.' : 'Commencez par téléverser vos premiers fichiers.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Téléverser des fichiers
              </button>
            )}
          </div>
        ) : (
          <>
            {/* EN: Grid View / FR: Vue Grille */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file) => (
                  <div key={file._id} className="group relative bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {file.category === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">
                          {getFileIcon(file.category)}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>

                    {/* EN: Hover Actions / FR: Actions au Survol */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(file._id, file.originalName)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file._id)}
                          className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* EN: List View / FR: Vue Liste */
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fichier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Taille
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Téléchargements
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file) => (
                        <tr key={file._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {file.category === 'image' ? (
                                  <img
                                    src={file.url}
                                    alt={file.originalName}
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                    {getFileIcon(file.category)}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {file.originalName}
                                </div>
                                <div className="text-sm text-gray-500 capitalize">
                                  {file.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {file.downloadCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(file.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => window.open(file.url, '_blank')}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Voir"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(file._id, file.originalName)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Télécharger"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(file._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* EN: Pagination / FR: Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* EN: Upload Modal / FR: Modal de Téléversement */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Téléverser des fichiers</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Cliquez pour sélectionner des fichiers ou glissez-déposez ici
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Images, vidéos, audio, documents (max 100MB par fichier)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Téléversement en cours...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
