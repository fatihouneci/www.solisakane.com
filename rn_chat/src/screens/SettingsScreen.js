/**
 * @file SettingsScreen.js
 * @description
 * EN: This screen displays comprehensive user settings and preferences management.
 * FR: Cet écran affiche la gestion complète des paramètres et préférences utilisateur.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import { useUser } from '../contexts/UserProvider';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

// EN: Icons from react-native-vector-icons / FR: Icônes de react-native-vector-icons
import Icon from 'react-native-vector-icons/MaterialIcons';

const API_URL = 'http://localhost:3000/api';

export default function SettingsScreen({ navigation }) {
  const { user, token } = useUser();

  // EN: State management / FR: Gestion d'état
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // EN: Load user settings / FR: Charger les paramètres utilisateur
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(data.settings);
    } catch (error) {
      console.error('EN: Error loading settings / FR: Erreur de chargement des paramètres:', error);
      Alert.alert('Erreur', 'Impossible de charger les paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  // EN: Update specific settings / FR: Mettre à jour des paramètres spécifiques
  const updateSettings = async (category, newSettings) => {
    try {
      setIsSaving(true);
      await axios.put(`${API_URL}/settings/${category}`, newSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // EN: Update local state / FR: Mettre à jour l'état local
      setSettings(prev => ({
        ...prev,
        [category]: newSettings
      }));
    } catch (error) {
      console.error('EN: Error updating settings / FR: Erreur de mise à jour des paramètres:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour les paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  // EN: Setup two-factor authentication / FR: Configurer l'authentification à deux facteurs
  const setup2FA = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/settings/2fa/setup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQrCode(data.data.qrCode);
      setBackupCodes(data.data.backupCodes);
      setShow2FASetup(true);
    } catch (error) {
      console.error('EN: Error setting up 2FA / FR: Erreur de configuration 2FA:', error);
      Alert.alert('Erreur', 'Impossible de configurer l\'authentification à deux facteurs');
    }
  };

  // EN: Verify two-factor authentication / FR: Vérifier l'authentification à deux facteurs
  const verify2FA = async () => {
    try {
      await axios.post(`${API_URL}/settings/2fa/verify`, {
        token: verificationCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShow2FASetup(false);
      setVerificationCode('');
      await loadSettings();
      Alert.alert('Succès', 'Authentification à deux facteurs activée avec succès !');
    } catch (error) {
      console.error('EN: Error verifying 2FA / FR: Erreur de vérification 2FA:', error);
      Alert.alert('Erreur', 'Code de vérification invalide');
    }
  };

  // EN: Disable two-factor authentication / FR: Désactiver l'authentification à deux facteurs
  const disable2FA = async () => {
    Alert.alert(
      'Confirmer la désactivation',
      'Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.post(`${API_URL}/settings/2fa/disable`, {
                password: passwordData.currentPassword,
                token: verificationCode
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              await loadSettings();
              Alert.alert('Succès', 'Authentification à deux facteurs désactivée avec succès !');
            } catch (error) {
              console.error('EN: Error disabling 2FA / FR: Erreur de désactivation 2FA:', error);
              Alert.alert('Erreur', 'Impossible de désactiver l\'authentification à deux facteurs');
            }
          }
        }
      ]
    );
  };

  // EN: Change password / FR: Changer le mot de passe
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    try {
      await axios.put(`${API_URL}/settings/change-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Succès', 'Mot de passe modifié avec succès !');
    } catch (error) {
      console.error('EN: Error changing password / FR: Erreur de changement de mot de passe:', error);
      Alert.alert('Erreur', 'Impossible de changer le mot de passe');
    }
  };

  // EN: Load settings on component mount / FR: Charger les paramètres au montage du composant
  useEffect(() => {
    if (token) {
      loadSettings();
    }
  }, [token]);

  // EN: Tab configuration / FR: Configuration des onglets
  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'privacy', label: 'Confidentialité', icon: 'visibility' },
    { id: 'audioVideo', label: 'Audio/Vidéo', icon: 'videocam' },
    { id: 'theme', label: 'Thème', icon: 'palette' },
    { id: 'security', label: 'Sécurité', icon: 'security' },
    { id: 'data', label: 'Données', icon: 'storage' }
  ];

  // EN: Render setting item / FR: Rendre l'élément de paramètre
  const renderSettingItem = (title, description, value, onValueChange, type = 'switch') => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <View style={styles.settingControl}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
            thumbColor={value ? '#ffffff' : '#f3f4f6'}
          />
        ) : (
          <TouchableOpacity onPress={onValueChange}>
            <Icon name="chevron-right" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Chargement des paramètres...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSubtitle}>Gérez vos préférences</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* EN: Tab Navigation / FR: Navigation par onglets */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.id ? '#ffffff' : '#6b7280'} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* EN: Settings Content / FR: Contenu des paramètres */}
        <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
          {/* EN: Notifications Tab / FR: Onglet Notifications */}
          {activeTab === 'notifications' && settings && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>Paramètres de notification</Text>
              
              {renderSettingItem(
                'Notifications de messages',
                'Recevoir des notifications pour les nouveaux messages',
                settings.notifications.messageNotifications,
                (value) => updateSettings('notifications', {
                  ...settings.notifications,
                  messageNotifications: value
                })
              )}

              {renderSettingItem(
                'Notifications d\'appels',
                'Recevoir des notifications pour les appels entrants',
                settings.notifications.callNotifications,
                (value) => updateSettings('notifications', {
                  ...settings.notifications,
                  callNotifications: value
                })
              )}

              {renderSettingItem(
                'Sons activés',
                'Jouer des sons pour les notifications',
                settings.notifications.soundEnabled,
                (value) => updateSettings('notifications', {
                  ...settings.notifications,
                  soundEnabled: value
                })
              )}

              {renderSettingItem(
                'Vibrations activées',
                'Vibrer pour les notifications',
                settings.notifications.vibrationEnabled,
                (value) => updateSettings('notifications', {
                  ...settings.notifications,
                  vibrationEnabled: value
                })
              )}

              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>Ne pas déranger</Text>
                
                {renderSettingItem(
                  'Activer',
                  'Désactiver les notifications pendant les heures définies',
                  settings.notifications.doNotDisturb.enabled,
                  (value) => updateSettings('notifications', {
                    ...settings.notifications,
                    doNotDisturb: {
                      ...settings.notifications.doNotDisturb,
                      enabled: value
                    }
                  })
                )}

                {settings.notifications.doNotDisturb.enabled && (
                  <View style={styles.timeSettings}>
                    <View style={styles.timeInput}>
                      <Text style={styles.timeLabel}>Heure de début</Text>
                      <TextInput
                        style={styles.timeInputField}
                        value={settings.notifications.doNotDisturb.startTime}
                        onChangeText={(value) => updateSettings('notifications', {
                          ...settings.notifications,
                          doNotDisturb: {
                            ...settings.notifications.doNotDisturb,
                            startTime: value
                          }
                        })}
                        placeholder="22:00"
                      />
                    </View>
                    <View style={styles.timeInput}>
                      <Text style={styles.timeLabel}>Heure de fin</Text>
                      <TextInput
                        style={styles.timeInputField}
                        value={settings.notifications.doNotDisturb.endTime}
                        onChangeText={(value) => updateSettings('notifications', {
                          ...settings.notifications,
                          doNotDisturb: {
                            ...settings.notifications.doNotDisturb,
                            endTime: value
                          }
                        })}
                        placeholder="08:00"
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* EN: Privacy Tab / FR: Onglet Confidentialité */}
          {activeTab === 'privacy' && settings && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>Paramètres de confidentialité</Text>
              
              {renderSettingItem(
                'Afficher le statut en ligne',
                'Permettre aux autres de voir quand vous êtes en ligne',
                settings.privacy.showOnlineStatus,
                (value) => updateSettings('privacy', {
                  ...settings.privacy,
                  showOnlineStatus: value
                })
              )}

              {renderSettingItem(
                'Afficher la dernière fois vu',
                'Permettre aux autres de voir votre dernière activité',
                settings.privacy.showLastSeen,
                (value) => updateSettings('privacy', {
                  ...settings.privacy,
                  showLastSeen: value
                })
              )}

              {renderSettingItem(
                'Autoriser les messages d\'inconnus',
                'Permettre aux utilisateurs non contactés de vous envoyer des messages',
                settings.privacy.allowMessagesFromStrangers,
                (value) => updateSettings('privacy', {
                  ...settings.privacy,
                  allowMessagesFromStrangers: value
                })
              )}

              {renderSettingItem(
                'Afficher les accusés de lecture',
                'Permettre aux autres de voir quand vous avez lu leurs messages',
                settings.privacy.showReadReceipts,
                (value) => updateSettings('privacy', {
                  ...settings.privacy,
                  showReadReceipts: value
                })
              )}
            </View>
          )}

          {/* EN: Security Tab / FR: Onglet Sécurité */}
          {activeTab === 'security' && settings && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>Paramètres de sécurité</Text>
              
              {/* EN: Two-Factor Authentication / FR: Authentification à deux facteurs */}
              <View style={styles.securitySection}>
                <View style={styles.securityHeader}>
                  <View>
                    <Text style={styles.securityTitle}>Authentification à deux facteurs</Text>
                    <Text style={styles.securityDescription}>
                      Ajouter une couche de sécurité supplémentaire à votre compte
                    </Text>
                  </View>
                  <View style={styles.securityStatus}>
                    {settings.security.twoFactorAuth.enabled ? (
                      <View style={styles.statusBadge}>
                        <Icon name="check-circle" size={16} color="#059669" />
                        <Text style={styles.statusText}>Activé</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, styles.statusBadgeDisabled]}>
                        <Icon name="cancel" size={16} color="#dc2626" />
                        <Text style={[styles.statusText, styles.statusTextDisabled]}>Désactivé</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {!settings.security.twoFactorAuth.enabled ? (
                  <TouchableOpacity style={styles.setupButton} onPress={setup2FA}>
                    <Icon name="qr-code" size={20} color="#ffffff" />
                    <Text style={styles.setupButtonText}>Configurer 2FA</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.disableButton} onPress={disable2FA}>
                    <Text style={styles.disableButtonText}>Désactiver 2FA</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* EN: Change Password / FR: Changer le mot de passe */}
              <View style={styles.passwordSection}>
                <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
                
                <View style={styles.passwordInputs}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Mot de passe actuel"
                    value={passwordData.currentPassword}
                    onChangeText={(value) => setPasswordData({ ...passwordData, currentPassword: value })}
                    secureTextEntry
                  />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Nouveau mot de passe"
                    value={passwordData.newPassword}
                    onChangeText={(value) => setPasswordData({ ...passwordData, newPassword: value })}
                    secureTextEntry
                  />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirmer le nouveau mot de passe"
                    value={passwordData.confirmPassword}
                    onChangeText={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
                    secureTextEntry
                  />
                  <TouchableOpacity style={styles.changePasswordButton} onPress={changePassword}>
                    <Icon name="lock" size={20} color="#ffffff" />
                    <Text style={styles.changePasswordButtonText}>Changer le mot de passe</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* EN: Other tabs content would go here... / FR: Le contenu des autres onglets irait ici... */}
        </ScrollView>
      </View>

      {/* EN: 2FA Setup Modal / FR: Modal de configuration 2FA */}
      <Modal
        visible={show2FASetup}
        transparent
        animationType="slide"
        onRequestClose={() => setShow2FASetup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurer l'authentification à deux facteurs</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShow2FASetup(false)}
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrCodeText}>
                  Scannez ce code QR avec votre application d'authentification :
                </Text>
                {qrCode && (
                  <Image source={{ uri: qrCode }} style={styles.qrCodeImage} />
                )}
              </View>
              
              <View style={styles.verificationContainer}>
                <Text style={styles.verificationLabel}>Code de vérification</Text>
                <TextInput
                  style={styles.verificationInput}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="Entrez le code à 6 chiffres"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
              
              <View style={styles.backupCodesContainer}>
                <View style={styles.backupCodesHeader}>
                  <Icon name="warning" size={20} color="#f59e0b" />
                  <Text style={styles.backupCodesTitle}>Codes de sauvegarde</Text>
                </View>
                <Text style={styles.backupCodesDescription}>
                  Sauvegardez ces codes en lieu sûr. Vous en aurez besoin si vous perdez votre appareil :
                </Text>
                <View style={styles.backupCodesGrid}>
                  {backupCodes.map((code, index) => (
                    <View key={index} style={styles.backupCodeItem}>
                      <Text style={styles.backupCodeText}>{code}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShow2FASetup(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={verify2FA}
                >
                  <Text style={styles.modalConfirmButtonText}>Vérifier</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
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
  content: {
    flex: 1,
  },
  tabContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  settingsContent: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingControl: {
    // EN: Control styling handled by Switch component / FR: Style de contrôle géré par le composant Switch
  },
  settingSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  timeSettings: {
    flexDirection: 'row',
    marginTop: 16,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  timeInputField: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  securitySection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  securityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  securityStatus: {
    marginLeft: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeDisabled: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  statusTextDisabled: {
    color: '#dc2626',
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  setupButtonText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  disableButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disableButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '500',
  },
  passwordSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passwordInputs: {
    marginTop: 16,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  changePasswordButtonText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
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
    maxHeight: '80%',
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
  modalBody: {
    padding: 20,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodeText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
  verificationContainer: {
    marginBottom: 24,
  },
  verificationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  verificationInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
  backupCodesContainer: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  backupCodesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backupCodesTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  backupCodesDescription: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 12,
  },
  backupCodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  backupCodeItem: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    width: '48%',
  },
  backupCodeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  modalConfirmButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});
