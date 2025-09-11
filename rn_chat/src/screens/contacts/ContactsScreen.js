/**
 * Écran des contacts
 * Contacts screen
 *
 * Liste des contacts avec recherche et gestion
 * Contact list with search and management
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

// Import des constantes / Import constants
import {COLORS} from '../../constants/colors';

/**
 * Données de test pour les contacts
 * Test data for contacts
 */
const mockContacts = [
  {
    id: '1',
    name: 'Marie Dupont',
    phone: '+33 6 12 34 56 78',
    email: 'marie.dupont@email.com',
    avatar: null,
    isOnline: true,
    lastSeen: 'En ligne',
  },
  {
    id: '2',
    name: 'Pierre Martin',
    phone: '+33 6 23 45 67 89',
    email: 'pierre.martin@email.com',
    avatar: null,
    isOnline: false,
    lastSeen: 'Il y a 2 heures',
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    phone: '+33 6 34 56 78 90',
    email: 'sophie.laurent@email.com',
    avatar: null,
    isOnline: true,
    lastSeen: 'En ligne',
  },
  {
    id: '4',
    name: 'Jean Dubois',
    phone: '+33 6 45 67 89 01',
    email: 'jean.dubois@email.com',
    avatar: null,
    isOnline: false,
    lastSeen: 'Il y a 1 jour',
  },
];

/**
 * Écran des contacts
 * Contacts screen
 */
const ContactsScreen = () => {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState(mockContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // all, online, groups

  /**
   * Filtrer les contacts selon la recherche
   * Filter contacts based on search
   */
  const filteredContacts = contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /**
   * Contacter un utilisateur
   * Contact a user
   */
  const contactUser = contact => {
    Alert.alert(
      'Contacter',
      `Comment souhaitez-vous contacter ${contact.name} ?`,
      [
        {
          text: 'Message',
          onPress: () => navigation.navigate('Chat', {chat: contact}),
        },
        {
          text: 'Appel',
          onPress: () => navigation.navigate('Call', {call: {...contact, type: 'audio'}}),
        },
        {
          text: 'Vidéo',
          onPress: () => navigation.navigate('Call', {call: {...contact, type: 'video'}}),
        },
        {text: 'Annuler', style: 'cancel'},
      ],
    );
  };

  /**
   * Rendre l'avatar d'un contact
   * Render contact avatar
   */
  const renderAvatar = contact => {
    if (contact.avatar) {
      return <Image source={{uri: contact.avatar}} style={styles.avatar} />;
    }

    return (
      <View style={styles.avatar}>
        <Icon name="person" size={24} color={COLORS.WHITE} />
      </View>
    );
  };

  /**
   * Rendre un élément de contact
   * Render contact item
   */
  const renderContactItem = ({item: contact}) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => contactUser(contact)}>
      {/* Avatar / Avatar */}
      <View style={styles.avatarContainer}>
        {renderAvatar(contact)}
        {contact.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      {/* Informations du contact / Contact info */}
      <View style={styles.contactContent}>
        <Text style={styles.contactName} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text style={styles.contactPhone} numberOfLines={1}>
          {contact.phone}
        </Text>
        <Text style={styles.contactEmail} numberOfLines={1}>
          {contact.email}
        </Text>
      </View>

      {/* Statut / Status */}
      <View style={styles.statusContainer}>
        <Text
          style={[styles.statusText, contact.isOnline && styles.statusOnline]}>
          {contact.lastSeen}
        </Text>
        <TouchableOpacity style={styles.contactButton}>
          <Icon
            name="more-vert"
            size={20}
            color={COLORS.TEXT_SECONDARY_LIGHT}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  /**
   * Rendre les onglets de filtrage
   * Render filter tabs
   */
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
        onPress={() => setSelectedTab('all')}>
        <Text
          style={[
            styles.tabText,
            selectedTab === 'all' && styles.activeTabText,
          ]}>
          Tous
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'online' && styles.activeTab]}
        onPress={() => setSelectedTab('online')}>
        <Text
          style={[
            styles.tabText,
            selectedTab === 'online' && styles.activeTabText,
          ]}>
          En ligne
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'groups' && styles.activeTab]}
        onPress={() => setSelectedTab('groups')}>
        <Text
          style={[
            styles.tabText,
            selectedTab === 'groups' && styles.activeTabText,
          ]}>
          Groupes
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header avec recherche / Header with search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color={COLORS.TEXT_SECONDARY_LIGHT}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un contact..."
            placeholderTextColor={COLORS.TEXT_SECONDARY_LIGHT}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-vert" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Onglets de filtrage / Filter tabs */}
      {renderTabs()}

      {/* Statistiques / Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredContacts.length} contact
          {filteredContacts.length > 1 ? 's' : ''}
        </Text>
        <Text style={styles.statsText}>
          {contacts.filter(c => c.isOnline).length} en ligne
        </Text>
      </View>

      {/* Liste des contacts / Contact list */}
      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.id}
        renderItem={renderContactItem}
        style={styles.contactList}
        showsVerticalScrollIndicator={false}
      />

      {/* Boutons d'action / Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="person-add" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="group-add" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.WHITE,
  },

  moreButton: {
    padding: 8,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  activeTab: {
    borderBottomColor: COLORS.PRIMARY_GREEN,
  },

  tabText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    fontWeight: '500',
  },

  activeTabText: {
    color: COLORS.PRIMARY_GREEN,
    fontWeight: '600',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  statsText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },

  contactList: {
    flex: 1,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  avatarContainer: {
    position: 'relative',
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

  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.SUCCESS,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },

  contactContent: {
    flex: 1,
    justifyContent: 'center',
  },

  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 2,
  },

  contactPhone: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    marginBottom: 2,
  },

  contactEmail: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },

  statusContainer: {
    alignItems: 'flex-end',
  },

  statusText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    marginBottom: 4,
  },

  statusOnline: {
    color: COLORS.SUCCESS,
  },

  contactButton: {
    padding: 4,
  },

  actionButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
  },

  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default ContactsScreen;
