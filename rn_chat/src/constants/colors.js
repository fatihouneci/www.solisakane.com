/**
 * Charte graphique Solisakane - Couleurs principales basées sur le logo
 * Color scheme Solisakane - Main colors based on the logo
 *
 * Logo: Trois anneaux blancs entrelacés sur fond vert (#3D8C40)
 * Logo: Three white interlocked rings on green background (#3D8C40)
 */

// Couleurs principales / Primary colors
export const COLORS = {
  // Couleurs du logo / Logo colors
  PRIMARY_GREEN: '#3D8C40', // Vert principal du logo / Main green from logo
  WHITE: '#FFFFFF', // Blanc des anneaux / White from rings

  // Couleurs secondaires harmonisées / Harmonized secondary colors
  SECONDARY_GOLD: '#FFD700', // Doré / Gold
  SECONDARY_BLUE: '#4A90E2', // Bleu / Blue
  SECONDARY_PURPLE: '#9B59B6', // Violet / Purple

  // Couleurs de fond / Background colors
  BACKGROUND_LIGHT: '#F8F9FA', // Fond clair / Light background
  BACKGROUND_DARK: '#1A1A1A', // Fond sombre / Dark background
  SURFACE_LIGHT: '#FFFFFF', // Surface claire / Light surface
  SURFACE_DARK: '#2D2D2D', // Surface sombre / Dark surface

  // Couleurs de texte / Text colors
  TEXT_PRIMARY_LIGHT: '#1A1A1A', // Texte principal clair / Primary light text
  TEXT_PRIMARY_DARK: '#FFFFFF', // Texte principal sombre / Primary dark text
  TEXT_SECONDARY_LIGHT: '#6C757D', // Texte secondaire clair / Secondary light text
  TEXT_SECONDARY_DARK: '#B0B0B0', // Texte secondaire sombre / Secondary dark text

  // Couleurs d'état / Status colors
  SUCCESS: '#28A745', // Succès / Success
  WARNING: '#FFC107', // Attention / Warning
  ERROR: '#DC3545', // Erreur / Error
  INFO: '#17A2B8', // Information / Info

  // Couleurs pour les chats / Chat colors
  CHAT_BUBBLE_SENT: '#DCF8C6', // Bulle envoyée / Sent message bubble
  CHAT_BUBBLE_RECEIVED: '#FFFFFF', // Bulle reçue / Received message bubble
  CHAT_BUBBLE_SENT_DARK: '#054740', // Bulle envoyée sombre / Dark sent bubble
  CHAT_BUBBLE_RECEIVED_DARK: '#2A2A2A', // Bulle reçue sombre / Dark received bubble

  // Couleurs pour les appels / Call colors
  CALL_ACTIVE: '#4CAF50', // Appel actif / Active call
  CALL_MISSED: '#F44336', // Appel manqué / Missed call
  CALL_INCOMING: '#2196F3', // Appel entrant / Incoming call

  // Couleurs de bordure / Border colors
  BORDER_LIGHT: '#E9ECEF', // Bordure claire / Light border
  BORDER_DARK: '#404040', // Bordure sombre / Dark border

  // Couleurs d'ombre / Shadow colors
  SHADOW_LIGHT: 'rgba(0, 0, 0, 0.1)', // Ombre claire / Light shadow
  SHADOW_DARK: 'rgba(255, 255, 255, 0.1)', // Ombre sombre / Dark shadow
};

// Gradients / Gradients
export const GRADIENTS = {
  PRIMARY: ['#3D8C40', '#2E7D32'], // Gradient principal / Primary gradient
  SECONDARY: ['#FFD700', '#FFA000'], // Gradient doré / Gold gradient
  BACKGROUND_LIGHT: ['#F8F9FA', '#FFFFFF'], // Gradient fond clair / Light background gradient
  BACKGROUND_DARK: ['#1A1A1A', '#2D2D2D'], // Gradient fond sombre / Dark background gradient
};

// Thèmes / Themes
export const THEMES = {
  LIGHT: {
    background: COLORS.BACKGROUND_LIGHT,
    surface: COLORS.SURFACE_LIGHT,
    text: COLORS.TEXT_PRIMARY_LIGHT,
    textSecondary: COLORS.TEXT_SECONDARY_LIGHT,
    border: COLORS.BORDER_LIGHT,
    shadow: COLORS.SHADOW_LIGHT,
    primary: COLORS.PRIMARY_GREEN,
    secondary: COLORS.SECONDARY_GOLD,
    chatBubbleSent: COLORS.CHAT_BUBBLE_SENT,
    chatBubbleReceived: COLORS.CHAT_BUBBLE_RECEIVED,
  },
  DARK: {
    background: COLORS.BACKGROUND_DARK,
    surface: COLORS.SURFACE_DARK,
    text: COLORS.TEXT_PRIMARY_DARK,
    textSecondary: COLORS.TEXT_SECONDARY_DARK,
    border: COLORS.BORDER_DARK,
    shadow: COLORS.SHADOW_DARK,
    primary: COLORS.PRIMARY_GREEN,
    secondary: COLORS.SECONDARY_GOLD,
    chatBubbleSent: COLORS.CHAT_BUBBLE_SENT_DARK,
    chatBubbleReceived: COLORS.CHAT_BUBBLE_RECEIVED_DARK,
  },
};

export default COLORS;
