import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function NewChatScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Simuler des contacts
  useEffect(() => {
    setContacts([
      { 
        id: '1', 
        name: 'Marie Dubois', 
        avatar: null, 
        status: 'online',
        phone: '+33 6 12 34 56 78'
      },
      { 
        id: '2', 
        name: 'Jean Martin', 
        avatar: null, 
        status: 'away',
        phone: '+33 6 23 45 67 89'
      },
      { 
        id: '3', 
        name: 'Sophie Laurent', 
        avatar: null, 
        status: 'online',
        phone: '+33 6 34 56 78 90'
      },
      { 
        id: '4', 
        name: 'Pierre Moreau', 
        avatar: null, 
        status: 'offline',
        phone: '+33 6 45 67 89 01'
      },
      { 
        id: '5', 
        name: 'Emma Rousseau', 
        avatar: null, 
        status: 'online',
        phone: '+33 6 56 78 90 12'
      },
      { 
        id: '6', 
        name: 'Lucas Bernard', 
        avatar: null, 
        status: 'away',
        phone: '+33 6 67 89 01 23'
      },
    ]);
  }, []);

  const getAvatarColor = (name) => {
    const colors = ['#669253', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#E91E63', '#9C27B0', '#673AB7'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.phone.includes(searchText)
  );

  const handleContactSelect = (contact) => {
    if (selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleStartChat = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un contact');
      return;
    }

    if (selectedContacts.length === 1) {
      // Chat individuel
      navigation.navigate('CommChatScreen', { 
        contact: selectedContacts[0] 
      });
    } else {
      // Chat de groupe
      navigation.navigate('CreateGroupScreen', { 
        selectedMembers: selectedContacts 
      });
    }
  };

  const renderContact = ({ item }) => {
    const isSelected = selectedContacts.find(c => c.id === item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.contactItem, isSelected && styles.selectedContactItem]}
        onPress={() => handleContactSelect(item)}
      >
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.defaultAvatar, { backgroundColor: getAvatarColor(item.name) }]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <View style={[styles.statusIndicator, { backgroundColor: 
            item.status === 'online' ? '#4CAF50' : 
            item.status === 'away' ? '#FF9800' : '#9E9E9E'
          }]} />
        </View>
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
        
        <View style={styles.contactActions}>
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#669253" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Nouveau Chat</Text>
        
        <TouchableOpacity 
          style={[styles.headerButton, selectedContacts.length > 0 && styles.headerButtonActive]}
          onPress={handleStartChat}
          disabled={selectedContacts.length === 0}
        >
          <Ionicons name="checkmark" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des contacts..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Selected Contacts Count */}
      {selectedContacts.length > 0 && (
        <View style={styles.selectedCountContainer}>
          <Text style={styles.selectedCountText}>
            {selectedContacts.length} contact(s) sélectionné(s)
          </Text>
        </View>
      )}

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        showsVerticalScrollIndicator={false}
        style={styles.contactsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#669253',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  selectedCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e8f5e8',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCountText: {
    fontSize: 14,
    color: '#669253',
    fontWeight: '500',
  },
  contactsList: {
    flex: 1,
    backgroundColor: 'white',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedContactItem: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 3,
    borderLeftColor: '#669253',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  contactActions: {
    alignItems: 'center',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#669253',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
