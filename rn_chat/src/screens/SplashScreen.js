/**
 * @file SplashScreen.js
 * @description
 * EN: This file contains the SplashScreen component, which is an animated splash screen displayed on application startup for the mobile application.
 * FR: Ce fichier contient le composant SplashScreen, qui est un écran de démarrage animé affiché au lancement de l'application mobile.
 */
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions,
  StatusBar 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * EN: SplashScreen Component. This component displays an animated splash screen with the application logo and name. 
 * It includes fade-in animations and automatically navigates to the login screen after a delay.
 * FR: Composant SplashScreen. Ce composant affiche un écran de démarrage animé avec le logo et le nom de l'application.
 * Il inclut des animations de fondu et navigue automatiquement vers l'écran de connexion après un délai.
 * @param {object} navigation - The navigation object from React Navigation. / L'objet de navigation de React Navigation.
 * @returns {JSX.Element} The rendered SplashScreen component.
 */
const SplashScreen = ({ navigation }) => {
  // EN: Animation values / FR: Valeurs d'animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // EN: Start the animation sequence / FR: Démarrer la séquence d'animation
    const startAnimations = () => {
      // EN: Logo and title fade in and scale animation / FR: Animation de fondu et d'échelle du logo et du titre
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // EN: Progress bar animation / FR: Animation de la barre de progression
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      // EN: Animated dots / FR: Points animés
      const createDotAnimation = (animValue, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      };

      createDotAnimation(dotAnim1, 0).start();
      createDotAnimation(dotAnim2, 200).start();
      createDotAnimation(dotAnim3, 400).start();
    };

    startAnimations();

    // EN: Navigate to login screen after 4 seconds / FR: Naviguer vers l'écran de connexion après 4 secondes
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, progressAnim, dotAnim1, dotAnim2, dotAnim3]);

  // EN: Interpolate progress bar width / FR: Interpoler la largeur de la barre de progression
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#4f46e5', '#7c3aed', '#ec4899']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" />
      
      {/* EN: Animated logo container / FR: Conteneur de logo animé */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* EN: Logo placeholder - you can replace this with an actual logo image / FR: Placeholder de logo - vous pouvez le remplacer par une vraie image de logo */}
        <View style={styles.logo}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>S</Text>
          </View>
        </View>
        
        {/* EN: Application name / FR: Nom de l'application */}
        <Text style={styles.title}>Solisakane</Text>
        
        {/* EN: Tagline / FR: Slogan */}
        <Animated.Text 
          style={[
            styles.subtitle,
            { opacity: fadeAnim }
          ]}
        >
          Connectez-vous, communiquez, partagez
        </Animated.Text>
      </Animated.View>

      {/* EN: Loading progress bar / FR: Barre de progression de chargement */}
      <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: progressWidth }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>Chargement...</Text>
      </Animated.View>

      {/* EN: Animated dots for loading effect / FR: Points animés pour l'effet de chargement */}
      <View style={styles.dotsContainer}>
        <Animated.View 
          style={[
            styles.dot,
            { opacity: dotAnim1 }
          ]} 
        />
        <Animated.View 
          style={[
            styles.dot,
            { opacity: dotAnim2 }
          ]} 
        />
        <Animated.View 
          style={[
            styles.dot,
            { opacity: dotAnim3 }
          ]} 
        />
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    width: width * 0.7,
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
});

export default SplashScreen;