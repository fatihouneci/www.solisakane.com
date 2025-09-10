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

const { width, height } = Dimensions.get('window');

const SplashScreen3 = ({ onFinish }) => {
  // const pulseAnim = useRef(new Animated.Value(1)).current;
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const slideAnim = useRef(new Animated.Value(30)).current;
  // const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animations désactivées temporairement
    // const pulseAnimation = Animated.loop(
    //   Animated.sequence([
    //     Animated.timing(pulseAnim, {
    //       toValue: 1.1,
    //       duration: 1000,
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(pulseAnim, {
    //       toValue: 1,
    //       duration: 1000,
    //       useNativeDriver: true,
    //     }),
    //   ])
    // );

    // const fadeAnimation = Animated.timing(fadeAnim, {
    //   toValue: 1,
    //   duration: 1500,
    //   useNativeDriver: true,
    // });

    // const slideAnimation = Animated.timing(slideAnim, {
    //   toValue: 0,
    //   duration: 1200,
    //   useNativeDriver: true,
    // });

    // const waveAnimation = Animated.loop(
    //   Animated.timing(waveAnim, {
    //     toValue: 1,
    //     duration: 2000,
    //     useNativeDriver: true,
    //   })
    // );

    // pulseAnimation.start();
    // fadeAnimation.start();
    // slideAnimation.start();
    // waveAnimation.start();

    // return () => {
    //   pulseAnimation.stop();
    //   waveAnimation.stop();
    // };
  }, []);

  // const waveOpacity = waveAnim.interpolate({
  //   inputRange: [0, 0.5, 1],
  //   outputRange: [0.3, 0.8, 0.3],
  // });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Bouton Skip */}
      <TouchableOpacity style={styles.skipButton} onPress={onFinish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      {/* Fond avec dégradé */}
      <View style={styles.background}>
        <View style={styles.gradientOverlay} />
      </View>

      {/* Ondes statiques */}
      <View
        style={[
          styles.wave,
          // {
          //   opacity: waveOpacity,
          //   transform: [
          //     {
          //       scale: waveAnim.interpolate({
          //         inputRange: [0, 1],
          //         outputRange: [0.8, 1.2],
          //       }),
          //     },
          //   ],
          // },
        ]}
      />

      <View style={styles.content}>
        {/* Logo statique */}
        <View
          style={[
            styles.logoContainer,
            // {
            //   opacity: fadeAnim,
            //   transform: [
            //     { scale: pulseAnim },
            //     { translateY: slideAnim },
            //   ],
            // },
          ]}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Texte statique */}
        <View
          style={[
            styles.textContainer,
            // {
            //   opacity: fadeAnim,
            //   transform: [{ translateY: slideAnim }],
            // },
          ]}>
          <Text style={styles.appName}>Solisakane</Text>
          <Text style={styles.subtitle}>Communication Réinventée</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>HD</Text>
              <Text style={styles.statLabel}>Qualité</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Disponible</Text>
            </View>
          </View>
        </View>

        {/* Indicateur de chargement minimaliste (statique) */}
        <View
          style={[
            styles.loadingContainer,
            // {
            //   opacity: fadeAnim,
            // },
          ]}>
          <View style={styles.loadingLine} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: '#1a3a1a',
    opacity: 0.8,
  },
  wave: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    height: 200,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logo: {
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    opacity: 0.8,
    fontWeight: '400',
    letterSpacing: 1,
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    width: '60%',
    alignItems: 'center',
  },
  loadingLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  skipText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SplashScreen3;
