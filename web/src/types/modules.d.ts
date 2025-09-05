/**
 * @file modules.d.ts
 * @description
 * EN: Module type declarations for external libraries.
 * FR: Déclarations de types de modules pour les bibliothèques externes.
 */

// EN: React types
// FR: Types React
declare module 'react' {
  export * from 'react';
}

declare module 'react-dom' {
  export * from 'react-dom';
}

declare module 'react-router-dom' {
  export * from 'react-router-dom';
}

// EN: Socket.IO types
// FR: Types Socket.IO
declare module 'socket.io-client' {
  export * from 'socket.io-client';
}

// EN: Axios types
// FR: Types Axios
declare module 'axios' {
  export * from 'axios';
}

// EN: Lucide React types
// FR: Types Lucide React
declare module 'lucide-react' {
  export * from 'lucide-react';
}

// EN: Mediasoup Client types
// FR: Types Mediasoup Client
declare module 'mediasoup-client' {
  export * from 'mediasoup-client';
}

// EN: TensorFlow types
// FR: Types TensorFlow
declare module '@tensorflow/tfjs' {
  export * from '@tensorflow/tfjs';
}

declare module '@tensorflow-models/body-pix' {
  export * from '@tensorflow-models/body-pix';
}

// EN: Formik types
// FR: Types Formik
declare module 'formik' {
  export * from 'formik';
}

// EN: Yup types
// FR: Types Yup
declare module 'yup' {
  export * from 'yup';
}

// EN: Zod types
// FR: Types Zod
declare module 'zod' {
  export * from 'zod';
}

// EN: Moment types
// FR: Types Moment
declare module 'moment' {
  export * from 'moment';
}

// EN: Date-fns types
// FR: Types Date-fns
declare module 'date-fns' {
  export * from 'date-fns';
}

// EN: Crypto-js types
// FR: Types Crypto-js
declare module 'crypto-js' {
  export * from 'crypto-js';
}

// EN: Emoji Picker types
// FR: Types Emoji Picker
declare module 'emoji-picker-react' {
  export * from 'emoji-picker-react';
}

// EN: React Hot Toast types
// FR: Types React Hot Toast
declare module 'react-hot-toast' {
  export * from 'react-hot-toast';
}

// EN: Sonner types
// FR: Types Sonner
declare module 'sonner' {
  export * from 'sonner';
}

// EN: Next Themes types
// FR: Types Next Themes
declare module 'next-themes' {
  export * from 'next-themes';
}

// EN: React Hook Form types
// FR: Types React Hook Form
declare module 'react-hook-form' {
  export * from 'react-hook-form';
}

// EN: React Day Picker types
// FR: Types React Day Picker
declare module 'react-day-picker' {
  export * from 'react-day-picker';
}

// EN: React Resizable Panels types
// FR: Types React Resizable Panels
declare module 'react-resizable-panels' {
  export * from 'react-resizable-panels';
}

// EN: Recharts types
// FR: Types Recharts
declare module 'recharts' {
  export * from 'recharts';
}

// EN: Tailwind Merge types
// FR: Types Tailwind Merge
declare module 'tailwind-merge' {
  export * from 'tailwind-merge';
}

// EN: Class Variance Authority types
// FR: Types Class Variance Authority
declare module 'class-variance-authority' {
  export * from 'class-variance-authority';
}

// EN: CLSX types
// FR: Types CLSX
declare module 'clsx' {
  export * from 'clsx';
}

// EN: CMDK types
// FR: Types CMDK
declare module 'cmdk' {
  export * from 'cmdk';
}

// EN: Comlink Loader types
// FR: Types Comlink Loader
declare module 'comlink-loader' {
  export * from 'comlink-loader';
}

// EN: Events types
// FR: Types Events
declare module 'events' {
  export * from 'events';
}

// EN: Input OTP types
// FR: Types Input OTP
declare module 'input-otp' {
  export * from 'input-otp';
}

// EN: Use Debounce types
// FR: Types Use Debounce
declare module 'use-debounce' {
  export * from 'use-debounce';
}

// EN: Vaul types
// FR: Types Vaul
declare module 'vaul' {
  export * from 'vaul';
}

// EN: Vite Plugin Comlink types
// FR: Types Vite Plugin Comlink
declare module 'vite-plugin-comlink' {
  export * from 'vite-plugin-comlink';
}

// EN: TW Animate CSS types
// FR: Types TW Animate CSS
declare module 'tw-animate-css' {
  export * from 'tw-animate-css';
}

// EN: Embla Carousel React types
// FR: Types Embla Carousel React
declare module 'embla-carousel-react' {
  export * from 'embla-carousel-react';
}

// EN: React Router types
// FR: Types React Router
declare module 'react-router' {
  export * from 'react-router';
}

// EN: Tailwind CSS types
// FR: Types Tailwind CSS
declare module 'tailwindcss' {
  export * from 'tailwindcss';
}

// EN: @tailwindcss/vite types
// FR: Types @tailwindcss/vite
declare module '@tailwindcss/vite' {
  export * from '@tailwindcss/vite';
}

// EN: @vitejs/plugin-react types
// FR: Types @vitejs/plugin-react
declare module '@vitejs/plugin-react' {
  export * from '@vitejs/plugin-react';
}

// EN: Vite types
// FR: Types Vite
declare module 'vite' {
  export * from 'vite';
}

// EN: Path types
// FR: Types Path
declare module 'path' {
  export * from 'path';
}

// EN: Node.js types
// FR: Types Node.js
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_API_URL: string;
    VITE_SOCKET_URL: string;
    VITE_APP_NAME: string;
    VITE_APP_VERSION: string;
    VITE_APP_ENV: string;
    VITE_ENABLE_WEBRTC: string;
    VITE_ENABLE_NOTIFICATIONS: string;
    VITE_ENABLE_ANALYTICS: string;
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_AUTH_DOMAIN: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_STORAGE_BUCKET: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    VITE_FIREBASE_APP_ID: string;
    VITE_DEBUG_MODE: string;
    VITE_LOG_LEVEL: string;
  }
}

// EN: Global types
// FR: Types globaux
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }
}

export {};
