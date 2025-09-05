
/**
 * @file ProfileScreen.js
 * @description
 * EN: This file contains the ProfileScreen component, which displays and allows editing of the authenticated user's profile information for the mobile application.
 * It includes personal information, contacts management, privacy settings, and account management.
 * FR: Ce fichier contient le composant ProfileScreen, qui affiche et permet l'édition des informations du profil de l'utilisateur authentifié pour l'application mobile.
 * Il inclut les informations personnelles, la gestion des contacts, les paramètres de confidentialité et la gestion du compte.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  FlatList
} from 'react-native';
import { useUser } from '../contexts/UserProvider';

/**
 * EN: ProfileScreen Component. A comprehensive profile management component that displays and allows editing of user information.
 * It includes personal details, contacts, privacy settings, and account management features.
 * FR: Composant ProfileScreen. Un composant de gestion de profil complet qui affiche et permet l'édition des informations utilisateur.
 * Il inclut les détails personnels, les contacts, les paramètres de confidentialité et les fonctionnalités de gestion de compte.
 * @param {object} navigation - The navigation object from React Navigation. / L'objet de navigation de React Navigation.
 * @returns {JSX.Element} The rendered ProfileScreen component.
 */
const ProfileScreen = ({ navigation }) => {
  const { user, loading, logout, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    telephone: ''
  });
  const [contacts, setContacts] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    allowMessagesFromStrangers: false,
    showLastSeen: true,
    showProfilePicture: true
  });
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        telephone: user.telephone || ''
      });
      setPrivacySettings({
        showOnlineStatus: user.notificationSettings?.showOnlineStatus ?? true,
        allowMessagesFromStrangers: user.notificationSettings?.allowMessagesFromStrangers ?? false,
        showLastSeen: user.notificationSettings?.showLastSeen ?? true,
        showProfilePicture: user.notificationSettings?.showProfilePicture ?? true
      });
    }
  }, [user]);

  /**
   * EN: Handles the logout process with confirmation.
   * FR: Gère le processus de déconnexion avec confirmation.
   */
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            // EN: Navigation will be handled by RootNavigator / FR: La navigation sera gérée par RootNavigator
          }
        }
      ]
    );
  };

  /**
   * EN: Handles form input changes.
   * FR: Gère les changements de saisie du formulaire.
   * @param {string} field - The field name. / Le nom du champ.
   * @param {string} value - The field value. / La valeur du champ.
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * EN: Handles privacy settings changes.
   * FR: Gère les changements des paramètres de confidentialité.
   * @param {string} setting - The setting name. / Le nom du paramètre.
   * @param {boolean} value - The setting value. / La valeur du paramètre.
   */
  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  /**
   * EN: Handles profile update submission.
   * FR: Gère la soumission de la mise à jour du profil.
   */
  const handleUpdateProfile = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la mise à jour du profil');
    }
  };

  /**
   * EN: Handles adding a new contact.
   * FR: Gère l'ajout d'un nouveau contact.
   */
  const handleAddContact = () => {
    if (newContactEmail.trim()) {
      setContacts(prev => [...prev, { 
        id: Date.now(), 
        email: newContactEmail.trim(), 
        name: newContactEmail.split('@')[0] 
      }]);
      setNewContactEmail('');
      setShowAddContactModal(false);
    }
  };

  /**
   * EN: Handles removing a contact.
   * FR: Gère la suppression d'un contact.
   * @param {number} contactId - The contact ID. / L'ID du contact.
   */
  const handleRemoveContact = (contactId) => {
    Alert.alert(
      'Supprimer le contact',
      'Êtes-vous sûr de vouloir supprimer ce contact ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setContacts(prev => prev.filter(contact => contact.id !== contactId));
          }
        }
      ]
    );
  };

  /**
   * EN: Renders a tab button.
   * FR: Affiche un bouton d'onglet.
   * @param {string} tabId - The tab ID. / L'ID de l'onglet.
   * @param {string} title - The tab title. / Le titre de l'onglet.
   */
  const renderTabButton = (tabId, title) => (
    <TouchableOpacity
      key={tabId}
      style={[styles.tabButton, activeTab === tabId && styles.activeTabButton]}
      onPress={() => setActiveTab(tabId)}
    >
      <Text style={[styles.tabButtonText, activeTab === tabId && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  /**
   * EN: Renders a contact item.
   * FR: Affiche un élément de contact.
   * @param {object} item - The contact item. / L'élément de contact.
   */
  const renderContactItem = ({ item }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveContact(item.id)}
        style={styles.removeContactButton}
      >
        <Text style={styles.removeContactText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  // EN: Show a loading indicator while user data is being fetched
  // FR: Afficher un indicateur de chargement pendant la récupération des données de l'utilisateur
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  // EN: Show a message if the user is not logged in
  // FR: Afficher un message si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Vous n'êtes pas connecté.</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* EN: Header / FR: En-tête */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* EN: Profile Overview / FR: Aperçu du profil */}
        <View style={styles.profileOverview}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.firstName?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.statusIndicator} />
          </View>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>En ligne</Text>
          </View>
        </View>

        {/* EN: Tab Navigation / FR: Navigation par onglets */}
        <View style={styles.tabContainer}>
          {renderTabButton('personal', 'Personnel')}
          {renderTabButton('contacts', 'Contacts')}
          {renderTabButton('privacy', 'Confidentialité')}
          {renderTabButton('security', 'Sécurité')}
        </View>

        {/* EN: Tab Content / FR: Contenu des onglets */}
        <View style={styles.tabContent}>
          {/* EN: Personal Information Tab / FR: Onglet Informations personnelles */}
          {activeTab === 'personal' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Informations personnelles</Text>
                <TouchableOpacity
                  onPress={() => setIsEditing(!isEditing)}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Prénom</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    editable={isEditing}
                    placeholder="Votre prénom"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    editable={isEditing}
                    placeholder="Votre nom"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    editable={isEditing}
                    placeholder="Votre email"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Téléphone</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    value={formData.telephone}
                    onChangeText={(value) => handleInputChange('telephone', value)}
                    editable={isEditing}
                    placeholder="Votre téléphone"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Biographie</Text>
                  <TextInput
                    style={[styles.textArea, !isEditing && styles.inputDisabled]}
                    value={formData.bio}
                    onChangeText={(value) => handleInputChange('bio', value)}
                    editable={isEditing}
                    placeholder="Parlez-nous de vous..."
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {isEditing && (
                  <TouchableOpacity
                    onPress={handleUpdateProfile}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Sauvegarder</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* EN: Contacts Tab / FR: Onglet Contacts */}
          {activeTab === 'contacts' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mes Contacts</Text>
                <TouchableOpacity
                  onPress={() => setShowAddContactModal(true)}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>+ Ajouter</Text>
                </TouchableOpacity>
              </View>

              {contacts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Aucun contact ajouté</Text>
                  <Text style={styles.emptyStateSubtext}>Appuyez sur "+ Ajouter" pour commencer</Text>
                </View>
              ) : (
                <FlatList
                  data={contacts}
                  renderItem={renderContactItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

          {/* EN: Privacy Tab / FR: Onglet Confidentialité */}
          {activeTab === 'privacy' && (
            <View>
              <Text style={styles.sectionTitle}>Paramètres de confidentialité</Text>
              
              <View style={styles.privacySettings}>
                <View style={styles.privacyItem}>
                  <View style={styles.privacyInfo}>
                    <Text style={styles.privacyTitle}>Afficher le statut en ligne</Text>
                    <Text style={styles.privacyDescription}>Permettre aux autres de voir quand vous êtes en ligne</Text>
                  </View>
                  <Switch
                    value={privacySettings.showOnlineStatus}
                    onValueChange={(value) => handlePrivacyChange('showOnlineStatus', value)}
                    trackColor={{ false: '#e5e5e5', true: '#4f46e5' }}
                    thumbColor={privacySettings.showOnlineStatus ? '#ffffff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.privacyItem}>
                  <View style={styles.privacyInfo}>
                    <Text style={styles.privacyTitle}>Autoriser les messages d'inconnus</Text>
                    <Text style={styles.privacyDescription}>Permettre aux utilisateurs non contactés de vous envoyer des messages</Text>
                  </View>
                  <Switch
                    value={privacySettings.allowMessagesFromStrangers}
                    onValueChange={(value) => handlePrivacyChange('allowMessagesFromStrangers', value)}
                    trackColor={{ false: '#e5e5e5', true: '#4f46e5' }}
                    thumbColor={privacySettings.allowMessagesFromStrangers ? '#ffffff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.privacyItem}>
                  <View style={styles.privacyInfo}>
                    <Text style={styles.privacyTitle}>Afficher la dernière connexion</Text>
                    <Text style={styles.privacyDescription}>Permettre aux autres de voir quand vous vous êtes connecté pour la dernière fois</Text>
                  </View>
                  <Switch
                    value={privacySettings.showLastSeen}
                    onValueChange={(value) => handlePrivacyChange('showLastSeen', value)}
                    trackColor={{ false: '#e5e5e5', true: '#4f46e5' }}
                    thumbColor={privacySettings.showLastSeen ? '#ffffff' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.privacyItem}>
                  <View style={styles.privacyInfo}>
                    <Text style={styles.privacyTitle}>Afficher la photo de profil</Text>
                    <Text style={styles.privacyDescription}>Permettre aux autres de voir votre photo de profil</Text>
                  </View>
                  <Switch
                    value={privacySettings.showProfilePicture}
                    onValueChange={(value) => handlePrivacyChange('showProfilePicture', value)}
                    trackColor={{ false: '#e5e5e5', true: '#4f46e5' }}
                    thumbColor={privacySettings.showProfilePicture ? '#ffffff' : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>
          )}

          {/* EN: Security Tab / FR: Onglet Sécurité */}
          {activeTab === 'security' && (
            <View>
              <Text style={styles.sectionTitle}>Sécurité du compte</Text>
              
              <View style={styles.securitySettings}>
                <TouchableOpacity style={styles.securityItem}>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Changer le mot de passe</Text>
                    <Text style={styles.securityDescription}>Mettez à jour votre mot de passe pour sécuriser votre compte</Text>
                  </View>
                  <Text style={styles.securityArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.securityItem}>
                  <View style={styles.securityInfo}>
                    <Text style={styles.securityTitle}>Sessions actives</Text>
                    <Text style={styles.securityDescription}>Gérez vos sessions de connexion actives</Text>
                  </View>
                  <Text style={styles.securityArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.securityItem, styles.dangerItem]}>
                  <View style={styles.securityInfo}>
                    <Text style={[styles.securityTitle, styles.dangerText]}>Supprimer le compte</Text>
                    <Text style={[styles.securityDescription, styles.dangerText]}>Supprimer définitivement votre compte</Text>
                  </View>
                  <Text style={[styles.securityArrow, styles.dangerText]}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* EN: Add Contact Modal / FR: Modal d'ajout de contact */}
      <Modal
        visible={showAddContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un contact</Text>
            <TextInput
              style={styles.modalInput}
              value={newContactEmail}
              onChangeText={setNewContactEmail}
              placeholder="Adresse email du contact"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddContactModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddContact}
              >
                <Text style={styles.confirmButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: '#4f46e5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  logoutButton: {
    padding: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  profileOverview: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#4f46e5',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  editButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  removeContactButton: {
    padding: 8,
  },
  removeContactText: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacySettings: {
    gap: 20,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyInfo: {
    flex: 1,
    marginRight: 16,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  securitySettings: {
    gap: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  securityArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  dangerItem: {
    borderBottomColor: '#fecaca',
  },
  dangerText: {
    color: '#dc2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#4f46e5',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;
