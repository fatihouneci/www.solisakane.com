/**
 * Écran d'onboarding avec tutoriel de bienvenue
 * Onboarding screen with welcome tutorial
 *
 * Tutoriel multi-étapes pour la première connexion
 * Multi-step tutorial for first-time users
 */

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import des constantes / Import constants
import {COLORS, GRADIENTS} from '../constants/colors';

const {width, height} = Dimensions.get('window');

/**
 * Données des pages d'onboarding
 * Onboarding pages data
 */
const onboardingData = [
  {
    id: 1,
    title: 'Bienvenue sur Solisakane',
    subtitle: 'Paix sur nos Maîtres Ra',
    description:
      'Connectez-vous avec vos proches grâce à une messagerie sécurisée et des appels de qualité.',
    icon: 'chat',
    color: COLORS.PRIMARY_GREEN,
  },
  {
    id: 2,
    title: 'Messages & Appels',
    subtitle: 'Tout en un',
    description:
      'Envoyez des messages texte, audio et vidéo. Passez des appels clairs et fiables.',
    icon: 'call',
    color: COLORS.SECONDARY_BLUE,
  },
  {
    id: 3,
    title: 'Sécurité & Confidentialité',
    subtitle: 'Vos données protégées',
    description:
      'Tous vos messages et appels sont chiffrés de bout en bout pour votre sécurité.',
    icon: 'security',
    color: COLORS.SECONDARY_PURPLE,
  },
  {
    id: 4,
    title: 'Prêt à commencer ?',
    subtitle: 'Rejoignez la communauté',
    description:
      'Créez votre compte et découvrez une nouvelle façon de communiquer.',
    icon: 'rocket-launch',
    color: COLORS.SECONDARY_GOLD,
  },
];

/**
 * Écran d'onboarding
 * Onboarding screen
 */
const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  /**
   * Passer à la page suivante
   * Go to next page
   */
  const nextPage = () => {
    if (currentPage < onboardingData.length - 1) {
      const nextIndex = currentPage + 1;
      setCurrentPage(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      finishOnboarding();
    }
  };

  /**
   * Passer à la page précédente
   * Go to previous page
   */
  const prevPage = () => {
    if (currentPage > 0) {
      const prevIndex = currentPage - 1;
      setCurrentPage(prevIndex);
      scrollViewRef.current?.scrollTo({
        x: prevIndex * width,
        animated: true,
      });
    }
  };

  /**
   * Terminer l'onboarding
   * Finish onboarding
   */
  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Error saving onboarding state
    }
  };

  /**
   * Gérer le changement de page lors du scroll
   * Handle page change on scroll
   */
  const handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentPage(index);
  };

  /**
   * Rendre une page d'onboarding
   * Render onboarding page
   */
  const renderPage = (item, index) => (
    <View key={item.id} style={styles.page}>
      <LinearGradient
        colors={[item.color, item.color + '80']}
        style={styles.iconContainer}>
        <Icon name={item.icon} size={80} color={COLORS.WHITE} />
      </LinearGradient>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Pages d'onboarding / Onboarding pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}>
        {onboardingData.map((item, index) => renderPage(item, index))}
      </ScrollView>

      {/* Indicateurs de page / Page indicators */}
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentPage
                    ? COLORS.WHITE
                    : 'rgba(255, 255, 255, 0.3)',
                width: index === currentPage ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Boutons de navigation / Navigation buttons */}
      <View style={styles.buttonContainer}>
        {currentPage > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevPage}>
            <Icon name="arrow-back" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.nextButton} onPress={nextPage}>
          <Text style={styles.nextButtonText}>
            {currentPage === onboardingData.length - 1
              ? 'Commencer'
              : 'Suivant'}
          </Text>
          <Icon
            name={
              currentPage === onboardingData.length - 1
                ? 'check'
                : 'arrow-forward'
            }
            size={20}
            color={COLORS.WHITE}
          />
        </TouchableOpacity>
      </View>

      {/* Passer / Skip */}
      {currentPage < onboardingData.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={finishOnboarding}>
          <Text style={styles.skipButtonText}>Passer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_GREEN,
  },

  scrollView: {
    flex: 1,
  },

  page: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 18,
    color: COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
  },

  description: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
  },

  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },

  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },

  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  nextButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginLeft: 20,
  },

  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_GREEN,
    marginRight: 8,
  },

  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  skipButtonText: {
    fontSize: 16,
    color: COLORS.WHITE,
    opacity: 0.8,
  },
});

export default OnboardingScreen;
