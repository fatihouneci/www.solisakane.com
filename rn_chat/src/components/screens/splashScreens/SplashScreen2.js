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

const SplashScreen2 = ({ onFinish }) => {
  // const logoRotateAnim = useRef(new Animated.Value(0)).current;
  // const logoScaleAnim = useRef(new Animated.Value(0)).current;
  // const textSlideAnim = useRef(new Animated.Value(100)).current;
  // const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animations désactivées temporairement
    // const logoAnimation = Animated.parallel([
    //   Animated.timing(logoRotateAnim, {
    //     toValue: 1,
    //     duration: 1500,
    //     useNativeDriver: true,
    //   }),
    //   Animated.spring(logoScaleAnim, {
    //     toValue: 1,
    //     tension: 40,
    //     friction: 8,
    //     useNativeDriver: true,
    //   }),
    // ]);

    // const textAnimation = Animated.timing(textSlideAnim, {
    //   toValue: 0,
    //   duration: 1000,
    //   useNativeDriver: true,
    // });

    // const backgroundAnimation = Animated.timing(backgroundAnim, {
    //   toValue: 1,
    //   duration: 2000,
    //   useNativeDriver: false,
    // });

    // Animated.sequence([
    //   Animated.parallel([logoAnimation, backgroundAnimation]),
    //   Animated.delay(500),
    //   textAnimation,
    // ]).start();
  }, []);

  // const logoRotation = logoRotateAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: ['0deg', '360deg'],
  // });

  // const backgroundColor = backgroundAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: ['#1e3c72', '#2a5298'],
  // });

  return (
    <View style={[styles.container, /* { backgroundColor } */] }>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#4CAF50', '#667eea']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        
        {/* Bouton Skip */}
        <TouchableOpacity style={styles.skipButton} onPress={onFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        
        <View style={styles.content}>
          {/* Logo statique */}
          <View
            style={[
              styles.logoContainer,
              // {
              //   transform: [
              //     { rotate: logoRotation },
              //     { scale: logoScaleAnim },
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
              //   transform: [{ translateY: textSlideAnim }],
              // },
            ]}>
            <Text style={styles.appName}>Solisakane</Text>
            <View style={styles.featuresContainer}>
              <Text style={styles.feature}>💬 Chat en temps réel</Text>
              <Text style={styles.feature}>📞 Appels vidéo HD</Text>
              <Text style={styles.feature}>🔒 Messages sécurisés</Text>
            </View>
          </View>

          {/* Barre de progression statique */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  // {
                  //   width: backgroundAnim.interpolate({
                  //     inputRange: [0, 1],
                  //     outputRange: ['0%', '100%'],
                  //   }),
                  // },
                  { width: '100%' },
                ]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 140,
    height: 140,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  featuresContainer: {
    alignItems: 'center',
  },
  feature: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
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

export default SplashScreen2;
