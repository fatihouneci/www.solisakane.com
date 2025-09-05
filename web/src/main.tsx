/**
 * @file main.tsx
 * @description
 * EN: This is the main entry point for the React web application. It renders the root component and wraps it with all the necessary context providers.
 * FR: Ce fichier est le point d'entrée principal de l'application web React. Il effectue le rendu du composant racine et l'enveloppe avec tous les fournisseurs de contexte nécessaires.
 */
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { UserProvider } from "./contexts/UserProvider.tsx";

import { Toaster } from "react-hot-toast";
// EN: NOTE: The following providers were declared but do not exist yet. They are commented out to prevent errors.
// FR: NOTE: Les fournisseurs suivants ont été déclarés mais n'existent pas encore. Ils sont commentés pour éviter les erreurs.
// import { ChatProvider } from "./contexts/ChatProvider.tsx";
// import { ModalProvider } from "./contexts/ModalProvider.tsx";
// import { ThemeProvider } from "./contexts/ThemeProvider.tsx";
// import SocketProvider from "./contexts/SocketProvider.tsx";
// import { MeetingProvider } from "./contexts/MeetingProvider.tsx";

// EN: Get the root element from the DOM
// FR: Récupérer l'élément racine du DOM
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

// EN: Create a root for React to render into
// FR: Créer une racine pour le rendu de React
const root = createRoot(rootElement);

// EN: Render the application
// FR: Effectuer le rendu de l'application
root.render(
  // EN: BrowserRouter handles the routing for the application
  // FR: BrowserRouter gère le routage pour l'application
  <BrowserRouter>
    {/* 
      EN: NOTE: The commented-out providers are placeholders. They should be implemented and re-enabled to provide their respective functionalities.
      FR: NOTE: Les fournisseurs commentés sont des placeholders. Ils doivent être implémentés et réactivés pour fournir leurs fonctionnalités respectives.
    */}
    {/* <ThemeProvider> */}
      {/* <MeetingProvider> */}
        {/* <SocketProvider> */}
          {/* EN: UserProvider handles user authentication state / FR: UserProvider gère l'état d'authentification de l'utilisateur */}
          <UserProvider>
            {/* <ChatProvider> */}
              {/* <ModalProvider> */}
                
                {/* EN: The main App component containing all the routes / FR: Le composant App principal contenant toutes les routes */}
                <App />
                
                {/* EN: Toaster is used for displaying pop-up notifications / FR: Toaster est utilisé pour afficher les notifications pop-up */}
                <Toaster />

              {/* </ModalProvider> */}
            {/* </ChatProvider> */}
          </UserProvider>
        {/* </SocketProvider> */}
      {/* </MeetingProvider> */}
    {/* </ThemeProvider> */}
  </BrowserRouter>
);