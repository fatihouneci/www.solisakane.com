import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StatusBar,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function NewGroupChatScreen() {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [showMembersList, setShowMembersList] = useState(false);
  const [groupPhoto, setGroupPhoto] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // Données simulées pour la démonstration
  useEffect(() => {
    const mockContacts = [
      { id: '1', name: 'Marie Dubois', phone: '+33 6 12 34 56 78', avatar: null, status: 'online' },
      { id: '2', name: 'Jean Martin', phone: '+33 6 23 45 67 89', avatar: null, status: 'away' },
      { id: '3', name: 'Sophie Laurent', phone: '+33 6 34 56 78 90', avatar: null, status: 'online' },
      { id: '4', name: 'Pierre Moreau', phone: '+33 6 45 67 89 01', avatar: null, status: 'offline' },
      { id: '5', name: 'Alice Bernard', phone: '+33 6 56 78 90 12', avatar: null, status: 'online' },
      { id: '6', name: 'Thomas Petit', phone: '+33 6 67 89 01 23', avatar: null, status: 'away' },
      { id: '7', name: 'Emma Roux', phone: '+33 6 78 90 12 34', avatar: null, status: 'online' },
      { id: '8', name: 'Lucas Simon', phone: '+33 6 89 01 23 45', avatar: null, status: 'offline' },
    ];
    setAllContacts(mockContacts);
  }, []);

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour le groupe');
      return;
    }

    if (selectedMembers.length < 2) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins 2 membres');
      return;
    }

    // Créer le groupe
    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      description: groupDescription,
      members: selectedMembers,
      admin: 'me',
      avatar: groupPhoto,
      isPrivate: isPrivate,
      createdAt: new Date().toISOString(),
    };

    // Naviguer vers le chat du groupe
    navigation.navigate('GroupChatScreen', { group: newGroup });
  };

  const handleAddPhoto = () => {
    Alert.alert('Photo', 'Fonctionnalité de photo à implémenter');
  };

  const handleSelectMember = (member) => {
    if (selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
  };

  const getAvatarColor = (name) => {
    const colors = ['#669253', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#E91E63', '#9C27B0', '#673AB7'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderContact = ({ item }) => {
    const isSelected = selectedMembers.find(m => m.id === item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.contactItem, isSelected && styles.selectedContactItem]}
        onPress={() => handleSelectMember(item)}
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

  const renderSelectedMember = (member) => (
    <View key={member.id} style={styles.selectedMemberItem}>
      <View style={styles.selectedMemberAvatar}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.smallAvatar} />
        ) : (
          <View style={[styles.smallDefaultAvatar, { backgroundColor: getAvatarColor(member.name) }]}>
            <Text style={styles.smallAvatarText}>{member.name.charAt(0)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.selectedMemberName} numberOfLines={1}>{member.name}</Text>
      <TouchableOpacity 
        style={styles.removeMemberButton}
        onPress={() => handleRemoveMember(member.id)}
      >
        <Ionicons name="close" size={18} color="#666" />
      </TouchableOpacity>
    </View>
  );

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
        
        <Text style={styles.headerTitle}>Nouveau Groupe</Text>
        
        <TouchableOpacity 
          style={[styles.headerButton, styles.createButton]}
          onPress={handleCreateGroup}
        >
          <Text style={styles.createButtonText}>
            Créer
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Photo - Style Skype */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={handleAddPhoto}>
            {groupPhoto ? (
              <Image source={{ uri: groupPhoto }} style={styles.groupPhoto} />
            ) : (
              <View style={styles.defaultPhoto}>
                <Ionicons name="camera" size={24} color="#669253" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoLabel}>Photo de groupe</Text>
        </View>

        {/* Group Name - Style Skype */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            placeholder="Nom du groupe"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={50}
          />
        </View>

        {/* Selected Members - Style Skype */}
        <View style={styles.membersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ajouter des personnes</Text>
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={() => setShowMembersList(!showMembersList)}
            >
              <Ionicons 
                name={showMembersList ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#669253" 
              />
            </TouchableOpacity>
          </View>
          
          {showMembersList && (
            <View style={styles.contactsList}>
              <FlatList
                data={allContacts}
                keyExtractor={(item) => item.id}
                renderItem={renderContact}
                showsVerticalScrollIndicator={false}
                style={styles.contactsFlatList}
              />
            </View>
          )}
        </View>

        {/* Selected Members List */}
        {selectedMembers.length > 0 && (
          <View style={styles.selectedMembersSection}>
            <Text style={styles.sectionTitle}>Membres du groupe ({selectedMembers.length})</Text>
            <View style={styles.selectedMembersList}>
              {selectedMembers.map(renderSelectedMember)}
            </View>
          </View>
        )}
      </ScrollView>

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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  groupPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultPhoto: {
    alignItems: 'center',
  },
  photoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  membersSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleButton: {
    padding: 4,
  },
  selectedMembersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactsList: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 300,
  },
  contactsFlatList: {
    maxHeight: 300,
  },
  selectedMembersList: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedMemberAvatar: {
    marginRight: 8,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  smallDefaultAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAvatarText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedMemberName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  removeMemberButton: {
    padding: 2,
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
