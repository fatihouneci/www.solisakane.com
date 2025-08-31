import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { UserProvider } from "./contexts/UserProvider.tsx";

import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./contexts/ChatProvider.tsx";
import { ModalProvider } from "./contexts/ModalProvider.tsx";
import { ThemeProvider } from "./contexts/ThemeProvider.tsx";
import SocketProvider from "./contexts/SocketProvider.tsx";
import { MeetingProvider } from "./contexts/MeetingProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <MeetingProvider>
        <SocketProvider>
          <UserProvider>
            <ChatProvider>
              <ModalProvider>
                <App />
                <Toaster />
              </ModalProvider>
            </ChatProvider>
          </UserProvider>
        </SocketProvider>
      </MeetingProvider>
    </ThemeProvider>
  </BrowserRouter>
);
