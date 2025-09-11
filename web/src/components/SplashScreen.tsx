/**
 * Écran de démarrage avec logo animé Solisakane (Web)
 * Splash screen with animated Solisakane logo (Web)
 * 
 * Affiche le logo avec animation pendant le chargement de l'application
 * Displays logo with animation during app loading
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// Import des constantes / Import constants
import { COLORS, GRADIENTS } from '../constants/colors';

/**
 * Écran de démarrage pour le web
 * Web splash screen
 */
const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animation de la barre de progression
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigation vers l'écran principal après chargement
          setTimeout(() => navigate('/chats'), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${GRADIENTS.PRIMARY[0]}, ${GRADIENTS.PRIMARY[1]})`
      }}
    >
      {/* Logo animé / Animated logo */}
      <div className="relative mb-8">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Anneau 1 - Gauche / Ring 1 - Left */}
          <div 
            className="absolute w-20 h-20 border-8 border-white rounded-full animate-pulse"
            style={{ 
              left: '0px',
              top: '10px',
              animationDelay: '0s'
            }}
          />
          
          {/* Anneau 2 - Centre / Ring 2 - Center */}
          <div 
            className="absolute w-20 h-20 border-8 border-white rounded-full animate-pulse"
            style={{ 
              left: '20px',
              top: '10px',
              animationDelay: '0.3s'
            }}
          />
          
          {/* Anneau 3 - Droite / Ring 3 - Right */}
          <div 
            className="absolute w-20 h-20 border-8 border-white rounded-full animate-pulse"
            style={{ 
              left: '40px',
              top: '10px',
              animationDelay: '0.6s'
            }}
          />
        </div>
      </div>

      {/* Nom de l'application / App name */}
      <h1 className="text-4xl font-bold mb-2 animate-fade-in">
        Solisakane
      </h1>
      
      {/* Sous-titre / Subtitle */}
      <p className="text-lg opacity-90 mb-12 animate-fade-in-delay">
        Communication sans limites
      </p>

      {/* Barre de progression / Progress bar */}
      <div className="w-96 max-w-full px-8">
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm opacity-80 mt-4 text-center">
          Chargement... {progress}%
        </p>
      </div>

      {/* Styles CSS pour les animations / CSS styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.5s both;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
