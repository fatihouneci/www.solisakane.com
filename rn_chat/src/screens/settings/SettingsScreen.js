/**
 * Écran des paramètres
 * Settings screen
 *
 * Configuration de l'application et profil utilisateur
 * Application configuration and user profile
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

// Import des constantes / Import constants
import {COLORS} from '../../constants/colors';

/**
 * Écran des paramètres
 * Settings screen
 */
const SettingsScreen = () => {
  const navigation = useNavigation();
  // États des paramètres / Settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  /**
   * Rendre une section de paramètres
   * Render settings section
   */
  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  /**
   * Rendre un élément de paramètre avec switch
   * Render setting item with switch
   */
  const renderSwitchItem = (
    title,
    subtitle,
    value,
    onValueChange,
    iconName,
  ) => (
    <TouchableOpacity style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={24} color={COLORS.PRIMARY_GREEN} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: COLORS.BORDER_LIGHT,
          true: COLORS.PRIMARY_GREEN + '40',
        }}
        thumbColor={value ? COLORS.PRIMARY_GREEN : COLORS.TEXT_SECONDARY_LIGHT}
      />
    </TouchableOpacity>
  );

  /**
   * Rendre un élément de paramètre avec navigation
   * Render setting item with navigation
   */
  const renderNavigationItem = (title, subtitle, iconName, onPress) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={24} color={COLORS.PRIMARY_GREEN} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Icon
        name="chevron-right"
        size={24}
        color={COLORS.TEXT_SECONDARY_LIGHT}
      />
    </TouchableOpacity>
  );

  /**
   * Déconnexion
   * Logout
   */
  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      {text: 'Annuler', style: 'cancel'},
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: () => {
          // TODO: Implémenter la déconnexion / Implement logout
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profil utilisateur / User profile */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={40} color={COLORS.WHITE} />
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Icon name="edit" size={16} color={COLORS.PRIMARY_GREEN} />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>Marie Dupont</Text>
        <Text style={styles.userEmail}>marie.dupont@email.com</Text>
        <Text style={styles.userPhone}>+33 6 12 34 56 78</Text>

        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.editProfileText}>Modifier le profil</Text>
        </TouchableOpacity>
      </View>

      {/* Paramètres de notifications / Notification settings */}
      {renderSection(
        'Notifications',
        <>
          {renderSwitchItem(
            'Notifications push',
            'Recevoir des notifications',
            notifications,
            setNotifications,
            'notifications',
          )}
          {renderSwitchItem(
            'Sons',
            'Activer les sons de notification',
            soundEnabled,
            setSoundEnabled,
            'volume-up',
          )}
          {renderSwitchItem(
            'Vibration',
            'Vibrer lors des notifications',
            vibrationEnabled,
            setVibrationEnabled,
            'vibration',
          )}
        </>,
      )}

      {/* Paramètres de confidentialité / Privacy settings */}
      {renderSection(
        'Confidentialité',
        <>
          {renderSwitchItem(
            'Accusés de réception',
            'Afficher les accusés de réception',
            showReadReceipts,
            setShowReadReceipts,
            'check-circle',
          )}
          {renderSwitchItem(
            'Statut en ligne',
            'Afficher quand vous êtes en ligne',
            showOnlineStatus,
            setShowOnlineStatus,
            'visibility',
          )}
          {renderNavigationItem(
            'Bloquer des contacts',
            'Gérer les contacts bloqués',
            'block',
            () => Alert.alert('Bloquer', 'Fonctionnalité à venir'),
          )}
        </>,
      )}

      {/* Paramètres de l'application / Application settings */}
      {renderSection(
        'Application',
        <>
          {renderSwitchItem(
            'Mode sombre',
            'Utiliser le thème sombre',
            darkMode,
            setDarkMode,
            'dark-mode',
          )}
          {renderSwitchItem(
            'Téléchargement automatique',
            'Télécharger automatiquement les médias',
            autoDownload,
            setAutoDownload,
            'download',
          )}
          {renderNavigationItem('Langue', 'Français', 'language', () =>
            Alert.alert('Langue', 'Fonctionnalité à venir'),
          )}
          {renderNavigationItem(
            'Stockage',
            "Gérer l'espace de stockage",
            'storage',
            () => Alert.alert('Stockage', 'Fonctionnalité à venir'),
          )}
        </>,
      )}

      {/* Support et informations / Support and information */}
      {renderSection(
        'Support',
        <>
          {renderNavigationItem('Aide', "Centre d'aide et FAQ", 'help', () =>
            Alert.alert('Aide', 'Fonctionnalité à venir'),
          )}
          {renderNavigationItem(
            'Contacter le support',
            "Obtenir de l'aide",
            'support',
            () => Alert.alert('Support', 'Fonctionnalité à venir'),
          )}
          {renderNavigationItem('À propos', 'Version 1.0.0', 'info', () =>
            Alert.alert(
              'À propos',
              'Solisakane v1.0.0\nCommunication sans limites',
            ),
          )}
        </>,
      )}

      {/* Bouton de déconnexion / Logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color={COLORS.ERROR} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      {/* Espacement en bas / Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },

  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.WHITE,
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
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_GREEN,
  },

  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    marginBottom: 2,
  },

  userPhone: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    marginBottom: 20,
  },

  editProfileButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },

  editProfileText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },

  section: {
    backgroundColor: COLORS.WHITE,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY_GREEN + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 2,
  },

  settingSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.ERROR + '40',
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ERROR,
    marginLeft: 8,
  },

  bottomSpacing: {
    height: 20,
  },
});

export default SettingsScreen;
