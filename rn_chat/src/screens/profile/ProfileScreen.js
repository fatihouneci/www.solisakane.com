/**
 * Écran de profil utilisateur
 * User profile screen
 *
 * Gestion complète du profil utilisateur
 * Complete user profile management
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

// Import des constantes / Import constants
import {COLORS} from '../../constants/colors';

/**
 * Données de profil utilisateur
 * User profile data
 */
const userProfile = {
  id: '1',
  name: 'Utilisateur Solisakane',
  phone: '+33 6 12 34 56 78',
  email: 'utilisateur@solisakane.com',
  avatar: null,
  status: 'Disponible',
  bio: 'Bienvenue dans l\'univers de la Salat. Paix sur nos Maîtres RAW',
  lastSeen: 'En ligne',
  isOnline: true,
  joinDate: '2024-01-01',
};

/**
 * Écran de profil utilisateur
 * User profile screen
 */
const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(userProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');

  /**
   * Modifier un champ du profil
   * Edit profile field
   */
  const editProfile = (field, value) => {
    setEditField(field);
    setEditValue(value);
    setEditModalVisible(true);
  };

  /**
   * Sauvegarder les modifications
   * Save changes
   */
  const saveChanges = () => {
    setProfile(prev => ({
      ...prev,
      [editField]: editValue,
    }));
    setEditModalVisible(false);
    setEditField('');
    setEditValue('');
  };

  /**
   * Changer l'avatar
   * Change avatar
   */
  const changeAvatar = () => {
    Alert.alert(
      'Changer l\'avatar',
      'Choisissez une option',
      [
        {text: 'Prendre une photo', onPress: () => console.log('Camera')},
        {text: 'Choisir dans la galerie', onPress: () => console.log('Gallery')},
        {text: 'Annuler', style: 'cancel'},
      ]
    );
  };

  /**
   * Rendre une ligne d'information
   * Render information row
   */
  const renderInfoRow = (label, value, field, icon) => (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={() => editProfile(field, value)}>
      <View style={styles.infoLeft}>
        <Icon name={icon} size={24} color={COLORS.TEXT_SECONDARY_LIGHT} />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
      <Icon name="edit" size={20} color={COLORS.TEXT_SECONDARY_LIGHT} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* En-tête du profil / Profile header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={changeAvatar}>
            {profile.avatar ? (
              <Image source={{uri: profile.avatar}} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Icon name="person" size={60} color={COLORS.WHITE} />
              </View>
            )}
            <View style={styles.avatarEdit}>
              <Icon name="camera-alt" size={16} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>{profile.name}</Text>
        <Text style={styles.userStatus}>{profile.status}</Text>
        <Text style={styles.userBio}>{profile.bio}</Text>
      </View>

      {/* Informations du profil / Profile information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        
        {renderInfoRow('Nom', profile.name, 'name', 'person')}
        {renderInfoRow('Téléphone', profile.phone, 'phone', 'phone')}
        {renderInfoRow('Email', profile.email, 'email', 'email')}
        {renderInfoRow('Statut', profile.status, 'status', 'info')}
        {renderInfoRow('Bio', profile.bio, 'bio', 'description')}
      </View>

      {/* Paramètres de confidentialité / Privacy settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confidentialité</Text>
        
        <TouchableOpacity style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Icon name="visibility" size={24} color={COLORS.TEXT_SECONDARY_LIGHT} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Dernière connexion</Text>
              <Text style={styles.infoValue}>
                {profile.isOnline ? 'En ligne' : profile.lastSeen}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY_LIGHT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Icon name="block" size={24} color={COLORS.TEXT_SECONDARY_LIGHT} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contacts bloqués</Text>
              <Text style={styles.infoValue}>0</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY_LIGHT} />
        </TouchableOpacity>
      </View>

      {/* Actions du profil / Profile actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity style={styles.actionRow}>
          <Icon name="share" size={24} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.actionText}>Partager mon profil</Text>
          <Icon name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY_LIGHT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow}>
          <Icon name="qr-code" size={24} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.actionText}>Code QR</Text>
          <Icon name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY_LIGHT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow}>
          <Icon name="backup" size={24} color={COLORS.PRIMARY_GREEN} />
          <Text style={styles.actionText}>Sauvegarder les chats</Text>
          <Icon name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY_LIGHT} />
        </TouchableOpacity>
      </View>

      {/* Informations de l'application / App information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Icon name="info" size={24} color={COLORS.TEXT_SECONDARY_LIGHT} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Icon name="calendar-today" size={24} color={COLORS.TEXT_SECONDARY_LIGHT} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>
                {new Date(profile.joinDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Modal d'édition / Edit modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Modifier {editField === 'name' ? 'le nom' : 
                      editField === 'phone' ? 'le téléphone' :
                      editField === 'email' ? 'l\'email' :
                      editField === 'status' ? 'le statut' :
                      editField === 'bio' ? 'la bio' : 'l\'information'}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Nouveau ${editField}`}
              multiline={editField === 'bio'}
              numberOfLines={editField === 'bio' ? 3 : 1}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveChanges}>
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },

  header: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    padding: 20,
    alignItems: 'center',
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },

  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 4,
  },

  userStatus: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: 8,
  },

  userBio: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  section: {
    backgroundColor: COLORS.WHITE,
    marginTop: 8,
    paddingVertical: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  infoContent: {
    marginLeft: 16,
    flex: 1,
  },

  infoLabel: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  actionText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginLeft: 16,
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 16,
    textAlign: 'center',
  },

  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 20,
    textAlignVertical: 'top',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  cancelButton: {
    backgroundColor: COLORS.SURFACE_LIGHT,
  },

  saveButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  cancelButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY_LIGHT,
  },

  saveButtonText: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
