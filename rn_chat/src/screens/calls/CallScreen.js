/**
 * Écran d'appel audio/vidéo
 * Audio/video call screen
 *
 * Interface d'appel complète similaire à WhatsApp
 * Complete calling interface similar to WhatsApp
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useRoute, useNavigation} from '@react-navigation/native';

// Import des constantes / Import constants
import {COLORS} from '../../constants/colors';

const {width, height} = Dimensions.get('window');

/**
 * Écran d'appel
 * Call screen
 */
const CallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {call, isIncoming = false} = route.params || {};
  
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(call?.type === 'video');

  useEffect(() => {
    // Démarrer le chronomètre / Start timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Simuler la connexion / Simulate connection
    if (!isIncoming) {
      setTimeout(() => {
        setIsConnected(true);
      }, 2000);
    }

    return () => clearInterval(timer);
  }, [isIncoming]);

  /**
   * Accepter l'appel
   * Accept call
   */
  const acceptCall = () => {
    setIsConnected(true);
  };

  /**
   * Rejeter l'appel
   * Reject call
   */
  const rejectCall = () => {
    navigation.goBack();
  };

  /**
   * Terminer l'appel
   * End call
   */
  const endCall = () => {
    Alert.alert(
      'Terminer l\'appel',
      'Voulez-vous vraiment terminer cet appel ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {text: 'Terminer', style: 'destructive', onPress: () => navigation.goBack()},
      ]
    );
  };

  /**
   * Basculer le micro
   * Toggle microphone
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  /**
   * Basculer le haut-parleur
   * Toggle speaker
   */
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  /**
   * Basculer la vidéo
   * Toggle video
   */
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  /**
   * Formater la durée
   * Format duration
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Fond vidéo ou avatar / Video background or avatar */}
      <View style={styles.backgroundContainer}>
        {isVideoOn ? (
          <View style={styles.videoContainer}>
            <Text style={styles.videoText}>Vidéo de {call?.name}</Text>
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="person" size={80} color={COLORS.WHITE} />
            </View>
          </View>
        )}
      </View>

      {/* Informations de l'appel / Call information */}
      <View style={styles.callInfo}>
        <Text style={styles.contactName}>{call?.name || 'Inconnu'}</Text>
        {isConnected ? (
          <Text style={styles.callStatus}>
            {formatDuration(callDuration)}
          </Text>
        ) : isIncoming ? (
          <Text style={styles.callStatus}>Appel entrant...</Text>
        ) : (
          <Text style={styles.callStatus}>Appel en cours...</Text>
        )}
      </View>

      {/* Contrôles d'appel / Call controls */}
      <View style={styles.controlsContainer}>
        {!isConnected && isIncoming ? (
          // Contrôles pour appel entrant / Incoming call controls
          <View style={styles.incomingControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.rejectButton]}
              onPress={rejectCall}>
              <Icon name="call-end" size={32} color={COLORS.WHITE} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.acceptButton]}
              onPress={acceptCall}>
              <Icon name="call" size={32} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
        ) : (
          // Contrôles pour appel actif / Active call controls
          <View style={styles.activeControls}>
            <View style={styles.topControls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  styles.smallButton,
                  isMuted ? styles.activeButton : styles.inactiveButton,
                ]}
                onPress={toggleMute}>
                <Icon
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color={isMuted ? COLORS.WHITE : COLORS.TEXT_PRIMARY_LIGHT}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.controlButton,
                  styles.smallButton,
                  isSpeakerOn ? styles.activeButton : styles.inactiveButton,
                ]}
                onPress={toggleSpeaker}>
                <Icon
                  name={isSpeakerOn ? 'volume-up' : 'volume-down'}
                  size={24}
                  color={isSpeakerOn ? COLORS.WHITE : COLORS.TEXT_PRIMARY_LIGHT}
                />
              </TouchableOpacity>

              {call?.type === 'video' && (
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    styles.smallButton,
                    isVideoOn ? styles.activeButton : styles.inactiveButton,
                  ]}
                  onPress={toggleVideo}>
                  <Icon
                    name={isVideoOn ? 'videocam' : 'videocam-off'}
                    size={24}
                    color={isVideoOn ? COLORS.WHITE : COLORS.TEXT_PRIMARY_LIGHT}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.endCallButton]}
                onPress={endCall}>
                <Icon name="call-end" size={32} color={COLORS.WHITE} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_DARK,
  },

  backgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoContainer: {
    width: width,
    height: height,
    backgroundColor: COLORS.BACKGROUND_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoText: {
    fontSize: 18,
    color: COLORS.WHITE,
    textAlign: 'center',
  },

  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },

  callInfo: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  contactName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 8,
  },

  callStatus: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.8,
  },

  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.6,
  },

  activeControls: {
    alignItems: 'center',
  },

  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.8,
    marginBottom: 40,
  },

  bottomControls: {
    alignItems: 'center',
  },

  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  acceptButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  rejectButton: {
    backgroundColor: COLORS.ERROR_RED,
  },

  endCallButton: {
    backgroundColor: COLORS.ERROR_RED,
  },

  activeButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  inactiveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default CallScreen;
