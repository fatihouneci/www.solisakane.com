
/**
 * @file SplashPage.tsx
 * @description
 * EN: An animated splash screen component displayed on application startup with logo, animations, and automatic navigation.
 * FR: Un composant d'écran de démarrage animé affiché au lancement de l'application avec logo, animations et navigation automatique.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EN: SplashPage Component. This component displays an animated splash screen with the application logo and name. 
 * It includes fade-in animations and automatically navigates to the login page after a delay.
 * FR: Composant SplashPage. Ce composant affiche un écran de démarrage animé avec le logo et le nom de l'application.
 * Il inclut des animations de fondu et navigue automatiquement vers la page de connexion après un délai.
 * @returns {JSX.Element} The rendered SplashPage component.
 */
export default function SplashPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // EN: Start the animation sequence / FR: Démarrer la séquence d'animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // EN: Simulate loading progress / FR: Simuler le progrès de chargement
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // EN: Navigate to login page after loading is complete / FR: Naviguer vers la page de connexion après le chargement
          setTimeout(() => navigate('/login'), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      {/* EN: Animated logo container / FR: Conteneur de logo animé */}
      <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        {/* EN: Logo placeholder - you can replace this with an actual logo image / FR: Placeholder de logo - vous pouvez le remplacer par une vraie image de logo */}
        <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
        </div>
        
        {/* EN: Application name with animation / FR: Nom de l'application avec animation */}
        <h1 className="text-5xl font-bold text-white text-center mb-2 tracking-wide">
          Solisakane
        </h1>
        
        {/* EN: Tagline with fade-in effect / FR: Slogan avec effet de fondu */}
        <p className={`text-lg text-indigo-100 text-center transition-opacity duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          Connectez-vous, communiquez, partagez
        </p>
      </div>

      {/* EN: Loading progress bar / FR: Barre de progression de chargement */}
      <div className={`w-64 mt-12 transition-opacity duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-white text-sm mt-2 opacity-80">
          Chargement... {progress}%
        </p>
      </div>

      {/* EN: Animated dots for loading effect / FR: Points animés pour l'effet de chargement */}
      <div className={`flex space-x-2 mt-8 transition-opacity duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-3 h-3 bg-white rounded-full animate-pulse"
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
}
