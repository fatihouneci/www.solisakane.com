/**
 * Écran de démarrage avec logo animé Solisakane
 * Splash screen with animated Solisakane logo
 *
 * Affiche le logo avec animation pendant le chargement de l'application
 * Displays logo with animation during app loading
 */

import React, {useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Import des constantes / Import constants
import {COLORS, GRADIENTS} from '../constants/colors';

const {width, height} = Dimensions.get('window');

/**
 * Écran de démarrage avec animation du logo
 * Splash screen with logo animation
 */
const SplashScreen = () => {
  // Animations / Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, [startAnimations]);

  /**
   * Démarrer les animations du logo
   * Start logo animations
   */
  const startAnimations = useCallback(() => {
    // Animation parallèle / Parallel animation
    Animated.parallel([
      // Animation d'échelle du logo / Logo scale animation
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),

      // Animation d'opacité du logo / Logo opacity animation
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),

      // Animation de rotation / Rotation animation
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),

      // Animation du texte / Text animation
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 800,
        useNativeDriver: true,
      }),

      // Animation de la barre de progression / Progress bar animation
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 2500,
        delay: 500,
        useNativeDriver: false,
      }),
    ]).start();

    // Animation des points de chargement / Loading dots animation
    setTimeout(() => {
      startLoadingDotsAnimation();
    }, 1500);
  }, [logoScale, logoOpacity, logoRotation, textOpacity, progressWidth]);

  /**
   * Démarrer l'animation des points de chargement
   * Start loading dots animation
   */
  const startLoadingDotsAnimation = useCallback(() => {
    const createDotAnimation = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createDotAnimation(dot1Opacity, 0),
      createDotAnimation(dot2Opacity, 200),
      createDotAnimation(dot3Opacity, 400),
    ]).start();
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  /**
   * Créer le logo SVG avec les trois anneaux entrelacés
   * Create SVG logo with three interlocked rings
   */
  const renderLogo = () => {
    const rotation = logoRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{scale: logoScale}, {rotate: rotation}],
            opacity: logoOpacity,
          },
        ]}>
        {/* Anneau 1 - Gauche / Ring 1 - Left */}
        <View style={[styles.ring, styles.ring1]} />

        {/* Anneau 2 - Centre / Ring 2 - Center */}
        <View style={[styles.ring, styles.ring2]} />

        {/* Anneau 3 - Droite / Ring 3 - Right */}
        <View style={[styles.ring, styles.ring3]} />
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={GRADIENTS.PRIMARY} style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.PRIMARY_GREEN}
      />

      {/* Logo animé / Animated logo */}
      {renderLogo()}

      {/* Nom de l'application / App name */}
      <Animated.Text style={[styles.appName, {opacity: textOpacity}]}>
        Solisakane
      </Animated.Text>

      {/* Message personnalisé / Custom message */}
      <Animated.Text style={[styles.subtitle, {opacity: textOpacity}]}>
        Bismillah Rahmane Rahim, Bienvenue dans l'Univers de la Salat
      </Animated.Text>

      {/* Barre de progression / Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Indicateur de chargement animé / Animated loading indicator */}
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingDots, {opacity: textOpacity}]}>
          <Animated.View style={[styles.dot, styles.dot1, {opacity: dot1Opacity}]} />
          <Animated.View style={[styles.dot, styles.dot2, {opacity: dot2Opacity}]} />
          <Animated.View style={[styles.dot, styles.dot3, {opacity: dot3Opacity}]} />
        </Animated.View>
        <Animated.Text style={[styles.loadingText, {opacity: textOpacity}]}>
          Chargement...
        </Animated.Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY_GREEN,
    paddingHorizontal: 20,
  },

  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },

  ring: {
    position: 'absolute',
    borderWidth: 10,
    borderColor: COLORS.WHITE,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  ring1: {
    width: 100,
    height: 100,
    left: -10,
    top: 15,
  },

  ring2: {
    width: 100,
    height: 100,
    left: 25,
    top: 15,
  },

  ring3: {
    width: 100,
    height: 100,
    left: 60,
    top: 15,
  },

  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },

  subtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: 50,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  progressContainer: {
    width: width * 0.6,
    marginBottom: 20,
  },

  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 2,
  },

  loadingContainer: {
    alignItems: 'center',
  },

  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 4,
  },

  dot1: {
    // Styles spécifiques pour le premier point
  },

  dot2: {
    // Styles spécifiques pour le deuxième point
  },

  dot3: {
    // Styles spécifiques pour le troisième point
  },

  loadingText: {
    fontSize: 14,
    color: COLORS.WHITE,
    opacity: 0.8,
    fontWeight: '500',
  },
});

export default SplashScreen;
