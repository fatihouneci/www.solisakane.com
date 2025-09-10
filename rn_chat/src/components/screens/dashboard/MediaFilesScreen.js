import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const MediaFilesScreen = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState('photos');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Données simulées pour les médias
  const mockPhotos = [
    { id: '1', uri: 'https://picsum.photos/300/300?random=1', name: 'Photo_001.jpg', size: '2.3 MB', date: '2024-01-15' },
    { id: '2', uri: 'https://picsum.photos/300/300?random=2', name: 'Photo_002.jpg', size: '1.8 MB', date: '2024-01-14' },
    { id: '3', uri: 'https://picsum.photos/300/300?random=3', name: 'Photo_003.jpg', size: '3.1 MB', date: '2024-01-13' },
    { id: '4', uri: 'https://picsum.photos/300/300?random=4', name: 'Photo_004.jpg', size: '2.7 MB', date: '2024-01-12' },
  ];

  const mockVideos = [
    { id: '1', uri: 'https://picsum.photos/300/300?random=5', name: 'Video_001.mp4', size: '15.2 MB', date: '2024-01-15', duration: '00:45' },
    { id: '2', uri: 'https://picsum.photos/300/300?random=6', name: 'Video_002.mp4', size: '22.1 MB', date: '2024-01-14', duration: '01:23' },
    { id: '3', uri: 'https://picsum.photos/300/300?random=7', name: 'Video_003.mp4', size: '18.7 MB', date: '2024-01-13', duration: '00:58' },
  ];

  const mockAudios = [
    { id: '1', name: 'Audio_001.mp3', size: '4.2 MB', date: '2024-01-15', duration: '02:15' },
    { id: '2', name: 'Audio_002.mp3', size: '3.8 MB', date: '2024-01-14', duration: '01:45' },
    { id: '3', name: 'Audio_003.mp3', size: '5.1 MB', date: '2024-01-13', duration: '03:22' },
  ];

  const mockDocuments = [
    { id: '1', name: 'Document_001.pdf', size: '1.2 MB', date: '2024-01-15', type: 'PDF' },
    { id: '2', name: 'Document_002.docx', size: '0.8 MB', date: '2024-01-14', type: 'DOCX' },
    { id: '3', name: 'Document_003.xlsx', size: '2.1 MB', date: '2024-01-13', type: 'XLSX' },
  ];

  const tabs = [
    { key: 'photos', label: 'Photos', icon: '📷', count: mockPhotos.length },
    { key: 'videos', label: 'Vidéos', icon: '🎥', count: mockVideos.length },
    { key: 'audios', label: 'Audios', icon: '🎵', count: mockAudios.length },
    { key: 'documents', label: 'Documents', icon: '📄', count: mockDocuments.length },
  ];

  const getCurrentData = () => {
    switch (selectedTab) {
      case 'photos': return mockPhotos;
      case 'videos': return mockVideos;
      case 'audios': return mockAudios;
      case 'documents': return mockDocuments;
      default: return [];
    }
  };

  const handleFilePress = (file) => {
    Alert.alert(
      file.name,
      `Taille: ${file.size}\nDate: ${file.date}${file.duration ? `\nDurée: ${file.duration}` : ''}`,
      [
        { text: 'Partager', onPress: () => console.log('Partager:', file.name) },
        { text: 'Télécharger', onPress: () => console.log('Télécharger:', file.name) },
        { text: 'Supprimer', onPress: () => console.log('Supprimer:', file.name), style: 'destructive' },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const renderMediaItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.mediaItem} 
      onPress={() => handleFilePress(item)}
    >
      <View style={styles.mediaPreview}>
        {selectedTab === 'photos' || selectedTab === 'videos' ? (
          <Image source={{ uri: item.uri }} style={styles.mediaImage} />
        ) : (
          <View style={styles.fileIcon}>
            <Text style={styles.fileIconText}>
              {selectedTab === 'audios' ? '🎵' : '📄'}
            </Text>
          </View>
        )}
        {selectedTab === 'videos' && (
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>▶️</Text>
          </View>
        )}
      </View>
      <View style={styles.mediaInfo}>
        <Text style={styles.mediaName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.mediaSize}>{item.size}</Text>
        <Text style={styles.mediaDate}>{item.date}</Text>
        {item.duration && (
          <Text style={styles.mediaDuration}>{item.duration}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fichiers Médias</Text>
        
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.tabActive
              ]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={[styles.tabIcon, selectedTab === tab.key && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                selectedTab === tab.key && styles.tabLabelActive
              ]}>
                {tab.label}
              </Text>
              <Text style={[
                styles.tabCount,
                selectedTab === tab.key && styles.tabCountActive
              ]}>
                {tab.count}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Media Grid */}
        <View style={styles.mediaContainer}>
          <FlatList
            data={getCurrentData()}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mediaGrid}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockPhotos.length + mockVideos.length + mockAudios.length + mockDocuments.length}</Text>
            <Text style={styles.statLabel}>Total fichiers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>156.2 MB</Text>
            <Text style={styles.statLabel}>Espace utilisé</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2.1 GB</Text>
            <Text style={styles.statLabel}>Espace disponible</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)'
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  backButtonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  uploadButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  tabsContainer: {
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)'
  },
  tabsContent: {
    paddingHorizontal: 6,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    marginHorizontal: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#246B5D',
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#444444',
  },
  tabIconActive: {
    color: '#246B5D',
  },
  tabLabel: {
    fontSize: 12,
    color: '#444444',
    fontWeight: '600',
    marginRight: 6,
  },
  tabLabelActive: {
    color: '#246B5D',
    fontWeight: '700',
  },
  tabCount: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
  },
  tabCountActive: {
    color: '#246B5D',
  },
  mediaContainer: {
    flex: 0,
  },
  mediaGrid: {
    paddingBottom: 170,
  },
  mediaItem: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  mediaPreview: {
    position: 'relative',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#F7F7F7',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  fileIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  fileIconText: {
    fontSize: 32,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  mediaInfo: {
    flex: 1,
  },
  mediaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  mediaSize: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 2,
  },
  mediaDate: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 2,
  },
  mediaDuration: {
    fontSize: 12,
    color: '#246B5D',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)'
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#246B5D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
  },
});

export default MediaFilesScreen;
