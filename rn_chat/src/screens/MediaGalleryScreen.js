/**
 * @file MediaGalleryScreen.js
 * @description
 * EN: This screen displays the user's media gallery with upload, search, and management capabilities.
 * FR: Cet écran affiche la galerie de médias de l'utilisateur avec des capacités de téléversement, de recherche et de gestion.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { useUser } from '../contexts/UserProvider';
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';

// EN: Icons from react-native-vector-icons / FR: Icônes de react-native-vector-icons
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://localhost:3000/api';

export default function MediaGalleryScreen({ navigation }) {
  const { user, token } = useUser();

  // EN: State management / FR: Gestion d'état
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // EN: 'grid' or 'list' / FR: 'grid' ou 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      Alert.alert('Erreur', 'Impossible de charger les fichiers');
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
      Alert.alert('Erreur', 'Impossible de rechercher les fichiers');
    } finally {
      setIsLoading(false);
    }
  };

  // EN: Handle file upload from gallery / FR: Gérer le téléversement de fichier depuis la galerie
  const handleImageUpload = async () => {
    try {
      const image = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'any',
        includeBase64: false,
        maxFiles: 10
      });

      if (image && image.length > 0) {
        await uploadFiles(image);
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('EN: Error picking image / FR: Erreur de sélection d\'image:', error);
        Alert.alert('Erreur', 'Impossible de sélectionner les fichiers');
      }
    }
  };

  // EN: Handle file upload from camera / FR: Gérer le téléversement de fichier depuis l'appareil photo
  const handleCameraUpload = async () => {
    try {
      const image = await ImagePicker.openCamera({
        mediaType: 'any',
        includeBase64: false
      });

      if (image) {
        await uploadFiles([image]);
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('EN: Error taking photo / FR: Erreur de prise de photo:', error);
        Alert.alert('Erreur', 'Impossible de prendre une photo');
      }
    }
  };

  // EN: Handle document upload / FR: Gérer le téléversement de document
  const handleDocumentUpload = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true
      });

      if (results && results.length > 0) {
        await uploadFiles(results);
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('EN: Error picking document / FR: Erreur de sélection de document:', error);
        Alert.alert('Erreur', 'Impossible de sélectionner les documents');
      }
    }
  };

  // EN: Upload files to server / FR: Téléverser les fichiers vers le serveur
  const uploadFiles = async (selectedFiles) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileUri = file.uri || file.path;
        const fileName = file.fileName || file.name || `file_${Date.now()}_${i}`;
        const fileType = file.type || 'application/octet-stream';

        formData.append('files', {
          uri: fileUri,
          type: fileType,
          name: fileName
        });
      }

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
      Alert.alert('Succès', `${data.files.length} fichier(s) téléversé(s) avec succès`);
    } catch (error) {
      console.error('EN: Error uploading files / FR: Erreur de téléversement:', error);
      Alert.alert('Erreur', 'Impossible de téléverser les fichiers');
    } finally {
      setUploading(false);
    }
  };

  // EN: Handle file download / FR: Gérer le téléchargement de fichier
  const handleDownload = async (file) => {
    try {
      const response = await axios.get(`${API_URL}/media/${file._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // EN: Save file to device / FR: Sauvegarder le fichier sur l'appareil
      const fileName = file.originalName;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      
      await RNFS.writeFile(filePath, response.data, 'base64');
      Alert.alert('Succès', `Fichier téléchargé: ${fileName}`);
    } catch (error) {
      console.error('EN: Error downloading file / FR: Erreur de téléchargement:', error);
      Alert.alert('Erreur', 'Impossible de télécharger le fichier');
    }
  };

  // EN: Handle file deletion / FR: Gérer la suppression de fichier
  const handleDelete = async (fileId) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce fichier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/media/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              await loadMediaFiles();
              await loadFileStats();
              Alert.alert('Succès', 'Fichier supprimé avec succès');
            } catch (error) {
              console.error('EN: Error deleting file / FR: Erreur de suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le fichier');
            }
          }
        }
      ]
    );
  };

  // EN: Get file icon based on category / FR: Obtenir l'icône de fichier basée sur la catégorie
  const getFileIcon = (category) => {
    switch (category) {
      case 'image': return 'image';
      case 'video': return 'videocam';
      case 'audio': return 'audiotrack';
      case 'document': return 'description';
      default: return 'insert-drive-file';
    }
  };

  // EN: Format file size / FR: Formater la taille de fichier
  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // EN: Render file item for grid view / FR: Rendre l'élément de fichier pour la vue grille
  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => handleDownload(item)}>
      <View style={styles.gridItemContent}>
        {item.category === 'image' ? (
          <Image source={{ uri: item.url }} style={styles.gridImage} />
        ) : (
          <View style={styles.gridIconContainer}>
            <Icon name={getFileIcon(item.category)} size={32} color="#6b7280" />
          </View>
        )}
        
        <View style={styles.gridItemInfo}>
          <Text style={styles.gridItemName} numberOfLines={1}>
            {item.originalName}
          </Text>
          <Text style={styles.gridItemSize}>
            {formatFileSize(item.size)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item._id)}
      >
        <Icon name="delete" size={16} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // EN: Render file item for list view / FR: Rendre l'élément de fichier pour la vue liste
  const renderListItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleDownload(item)}>
      <View style={styles.listItemContent}>
        {item.category === 'image' ? (
          <Image source={{ uri: item.url }} style={styles.listImage} />
        ) : (
          <View style={styles.listIconContainer}>
            <Icon name={getFileIcon(item.category)} size={24} color="#6b7280" />
          </View>
        )}
        
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemName} numberOfLines={1}>
            {item.originalName}
          </Text>
          <Text style={styles.listItemDetails}>
            {formatFileSize(item.size)} • {item.downloadCount} téléchargements
          </Text>
          <Text style={styles.listItemDate}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.listDeleteButton}
        onPress={() => handleDelete(item._id)}
      >
        <Icon name="delete" size={20} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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

  // EN: Handle refresh / FR: Gérer le rafraîchissement
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMediaFiles(), loadFileStats()]);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* EN: Header / FR: En-tête */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Galerie de Médias</Text>
          <Text style={styles.headerSubtitle}>
            {stats ? `${stats.totalFiles} fichiers • ${formatFileSize(stats.totalSize)}` : 'Chargement...'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => setShowUploadModal(true)}
        >
          <Icon name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* EN: Search and Filters / FR: Recherche et Filtres */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des fichiers..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.filterButtonText, selectedCategory === 'all' && styles.filterButtonTextActive]}>
                Tous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory === 'image' && styles.filterButtonActive]}
              onPress={() => setSelectedCategory('image')}
            >
              <Text style={[styles.filterButtonText, selectedCategory === 'image' && styles.filterButtonTextActive]}>
                Images
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory === 'video' && styles.filterButtonActive]}
              onPress={() => setSelectedCategory('video')}
            >
              <Text style={[styles.filterButtonText, selectedCategory === 'video' && styles.filterButtonTextActive]}>
                Vidéos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory === 'audio' && styles.filterButtonActive]}
              onPress={() => setSelectedCategory('audio')}
            >
              <Text style={[styles.filterButtonText, selectedCategory === 'audio' && styles.filterButtonTextActive]}>
                Audio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedCategory === 'document' && styles.filterButtonActive]}
              onPress={() => setSelectedCategory('document')}
            >
              <Text style={[styles.filterButtonText, selectedCategory === 'document' && styles.filterButtonTextActive]}>
                Documents
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Icon name="grid-view" size={20} color={viewMode === 'grid' ? '#ffffff' : '#6b7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Icon name="list" size={20} color={viewMode === 'list' ? '#ffffff' : '#6b7280'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* EN: Files Display / FR: Affichage des Fichiers */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement des fichiers...</Text>
        </View>
      ) : files.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="folder-open" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Aucun fichier trouvé</Text>
          <Text style={styles.emptyMessage}>
            {searchTerm ? 'Aucun fichier ne correspond à votre recherche.' : 'Commencez par téléverser vos premiers fichiers.'}
          </Text>
          {!searchTerm && (
            <TouchableOpacity
              style={styles.emptyUploadButton}
              onPress={() => setShowUploadModal(true)}
            >
              <Text style={styles.emptyUploadButtonText}>Téléverser des fichiers</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={files}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item._id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // EN: Force re-render when view mode changes / FR: Forcer le re-render quand le mode d'affichage change
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.filesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* EN: Upload Modal / FR: Modal de Téléversement */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Téléverser des fichiers</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowUploadModal(false)}
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={handleImageUpload}
                disabled={uploading}
              >
                <Icon name="photo-library" size={32} color="#6366f1" />
                <Text style={styles.uploadOptionText}>Galerie</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOption}
                onPress={handleCameraUpload}
                disabled={uploading}
              >
                <Icon name="camera-alt" size={32} color="#6366f1" />
                <Text style={styles.uploadOptionText}>Appareil photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOption}
                onPress={handleDocumentUpload}
                disabled={uploading}
              >
                <Icon name="folder-open" size={32} color="#6366f1" />
                <Text style={styles.uploadOptionText}>Documents</Text>
              </TouchableOpacity>
            </View>

            {uploading && (
              <View style={styles.uploadProgressContainer}>
                <Text style={styles.uploadProgressText}>
                  Téléversement en cours... {uploadProgress}%
                </Text>
                <View style={styles.uploadProgressBar}>
                  <View
                    style={[styles.uploadProgressFill, { width: `${uploadProgress}%` }]}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  uploadButton: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    padding: 8,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827',
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  viewModeContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  viewModeButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#6366f1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyUploadButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyUploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  filesList: {
    padding: 16,
  },
  gridItem: {
    flex: 1,
    margin: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridItemContent: {
    padding: 8,
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  gridIconContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemInfo: {
    marginTop: 8,
  },
  gridItemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  gridItemSize: {
    fontSize: 10,
    color: '#6b7280',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  listItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  listImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  listIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  listItemDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  listItemDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  listDeleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  uploadOption: {
    alignItems: 'center',
    padding: 16,
  },
  uploadOptionText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
  },
  uploadProgressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  uploadProgressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadProgressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  uploadProgressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
});
