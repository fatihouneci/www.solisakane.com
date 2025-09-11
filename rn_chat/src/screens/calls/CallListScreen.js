/**
 * Écran de liste des appels
 * Call list screen
 *
 * Historique des appels audio et vidéo
 * Audio and video call history
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

// Import des constantes / Import constants
import {COLORS} from '../../constants/colors';

/**
 * Données de test pour les appels
 * Test data for calls
 */
const mockCalls = [
  {
    id: '1',
    name: 'Marie Dupont',
    type: 'audio',
    status: 'missed',
    timestamp: "Aujourd'hui 10:30",
    duration: 0,
    avatar: null,
  },
  {
    id: '2',
    name: 'Famille',
    type: 'video',
    status: 'received',
    timestamp: "Aujourd'hui 09:15",
    duration: 125,
    avatar: null,
    isGroup: true,
  },
  {
    id: '3',
    name: 'Pierre Martin',
    type: 'audio',
    status: 'sent',
    timestamp: 'Hier 14:20',
    duration: 45,
    avatar: null,
  },
  {
    id: '4',
    name: 'Sophie Laurent',
    type: 'video',
    status: 'received',
    timestamp: 'Hier 11:45',
    duration: 180,
    avatar: null,
  },
];

/**
 * Écran de liste des appels
 * Call list screen
 */
const CallListScreen = () => {
  const navigation = useNavigation();
  const [calls, setCalls] = useState(mockCalls);

  /**
   * Rappeler un contact
   * Call back a contact
   */
  const callBack = call => {
    navigation.navigate('Call', {call});
  };

  /**
   * Rendre l'icône de type d'appel
   * Render call type icon
   */
  const renderCallTypeIcon = (type, status) => {
    const iconName = type === 'video' ? 'videocam' : 'call';
    const iconColor = status === 'missed' ? COLORS.ERROR : COLORS.PRIMARY_GREEN;

    return (
      <Icon
        name={iconName}
        size={20}
        color={iconColor}
        style={styles.callTypeIcon}
      />
    );
  };

  /**
   * Rendre l'icône de statut
   * Render status icon
   */
  const renderStatusIcon = status => {
    switch (status) {
      case 'sent':
        return <Icon name="call-made" size={16} color={COLORS.SUCCESS} />;
      case 'received':
        return <Icon name="call-received" size={16} color={COLORS.SUCCESS} />;
      case 'missed':
        return <Icon name="call-missed" size={16} color={COLORS.ERROR} />;
      default:
        return null;
    }
  };

  /**
   * Formater la durée
   * Format duration
   */
  const formatDuration = seconds => {
    if (seconds === 0) {
      return '';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Rendre un élément d'appel
   * Render call item
   */
  const renderCallItem = ({item: call}) => (
    <TouchableOpacity style={styles.callItem} onPress={() => callBack(call)}>
      {/* Avatar / Avatar */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, call.isGroup && styles.groupAvatar]}>
          <Icon
            name={call.isGroup ? 'group' : 'person'}
            size={24}
            color={COLORS.WHITE}
          />
        </View>
      </View>

      {/* Contenu de l'appel / Call content */}
      <View style={styles.callContent}>
        <View style={styles.callHeader}>
          <Text style={styles.callName} numberOfLines={1}>
            {call.name}
          </Text>
          <Text style={styles.timestamp}>{call.timestamp}</Text>
        </View>

        <View style={styles.callFooter}>
          <View style={styles.callInfo}>
            {renderCallTypeIcon(call.type, call.status)}
            {renderStatusIcon(call.status)}
            <Text style={styles.duration}>{formatDuration(call.duration)}</Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Icon name="call" size={24} color={COLORS.PRIMARY_GREEN} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header avec boutons d'action / Header with action buttons */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="search" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="more-vert" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Boutons d'appel rapide / Quick call buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickCallButton}>
          <Icon name="call" size={24} color={COLORS.WHITE} />
          <Text style={styles.quickCallText}>Appel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCallButton}>
          <Icon name="videocam" size={24} color={COLORS.WHITE} />
          <Text style={styles.quickCallText}>Vidéo</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des appels / Call list */}
      <FlatList
        data={calls}
        keyExtractor={item => item.id}
        renderItem={renderCallItem}
        style={styles.callList}
        showsVerticalScrollIndicator={false}
      />

      {/* Bouton nouveau contact / New contact button */}
      <TouchableOpacity style={styles.newContactButton}>
        <Icon name="person-add" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  actionButton: {
    padding: 8,
  },

  quickActions: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  quickCallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
  },

  quickCallText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    marginLeft: 8,
  },

  callList: {
    flex: 1,
  },

  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  avatarContainer: {
    marginRight: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  groupAvatar: {
    backgroundColor: COLORS.SECONDARY_BLUE,
  },

  callContent: {
    flex: 1,
    justifyContent: 'center',
  },

  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  callName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    flex: 1,
  },

  timestamp: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },

  callFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  callTypeIcon: {
    marginRight: 8,
  },

  duration: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    marginLeft: 8,
  },

  callButton: {
    padding: 8,
  },

  newContactButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default CallListScreen;
