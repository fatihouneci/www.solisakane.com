import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const scaleAnim = useRef(new Animated.Value(0.3)).current;
  // const slideAnim = useRef(new Animated.Value(50)).current;
  // const textFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation séquentielle (désactivée temporairement)
    // const animationSequence = Animated.sequence([
    //   Animated.parallel([
    //     Animated.timing(fadeAnim, {
    //       toValue: 1,
    //       duration: 1000,
    //       useNativeDriver: true,
    //     }),
    //     Animated.spring(scaleAnim, {
    //       toValue: 1,
    //       tension: 50,
    //       friction: 7,
    //       useNativeDriver: true,
    //     }),
    //   ]),
    //   Animated.parallel([
    //     Animated.timing(slideAnim, {
    //       toValue: 0,
    //       duration: 800,
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(textFadeAnim, {
    //       toValue: 1,
    //       duration: 800,
    //       useNativeDriver: true,
    //     }),
    //   ]),
    // ]);

    // animationSequence.start();
  }, []);

  return (
    <LinearGradient
      colors={['#667eea', '#4CAF50', '#f093fb']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Bouton Skip */}
      <TouchableOpacity style={styles.skipButton} onPress={onFinish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        {/* Logo sans animation */}
        <View
          style={[
            styles.logoContainer,
            // {
            //   opacity: fadeAnim,
            //   transform: [{ scale: scaleAnim }],
            // },
          ]}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Texte sans animation */}
        <View
          style={[
            styles.textContainer,
            // {
            //   opacity: textFadeAnim,
            //   transform: [{ translateY: slideAnim }],
            // },
          ]}>
          <Text style={styles.appName}>Solisakane</Text>
          <Text style={styles.tagline}>Connectez-vous, Communiquez, Collaborez</Text>
          <Text style={styles.description}>
            Chat, appels vidéo et audio en temps réel
          </Text>
        </View>

        {/* Indicateur de chargement (statique) */}
        <View
          style={[
            styles.loadingContainer,
            // {
            //   opacity: textFadeAnim,
            // },
          ]}>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    opacity: 0.7,
  },
  dot1: {
    // Animation sera ajoutée plus tard
  },
  dot2: {
    // Animation sera ajoutée plus tard
  },
  dot3: {
    // Animation sera ajoutée plus tard
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SplashScreen;
