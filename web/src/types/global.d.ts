/**
 * @file global.d.ts
 * @description
 * EN: Global type definitions for the Solisakane web application.
 * FR: Définitions de types globaux pour l'application web Solisakane.
 */

// EN: Extend ImportMeta interface for Vite environment variables
// FR: Étendre l'interface ImportMeta pour les variables d'environnement Vite
declare interface ImportMeta {
  readonly env: {
    readonly VITE_API_URL: string;
    readonly VITE_SOCKET_URL: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_APP_ENV: string;
    readonly [key: string]: string | undefined;
  };
}

// EN: Global type definitions for common interfaces
// FR: Définitions de types globaux pour les interfaces communes
declare global {
  // EN: User interface
  // FR: Interface utilisateur
  interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: Date;
    notificationSettings: NotificationSettings;
    privacySettings: PrivacySettings;
    audioVideoSettings: AudioVideoSettings;
    themeSettings: ThemeSettings;
    securitySettings: SecuritySettings;
    dataSettings: DataSettings;
  }

  // EN: Notification settings interface
  // FR: Interface des paramètres de notification
  interface NotificationSettings {
    pushNotifications: boolean;
    emailNotifications: boolean;
    soundNotifications: boolean;
    messageNotifications: boolean;
    callNotifications: boolean;
    groupNotifications: boolean;
    statusNotifications: boolean;
    meetingNotifications: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  }

  // EN: Privacy settings interface
  // FR: Interface des paramètres de confidentialité
  interface PrivacySettings {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowReadReceipts: boolean;
    allowTypingIndicators: boolean;
    allowContactRequests: boolean;
    allowGroupInvites: boolean;
    allowStatusViews: boolean;
    allowProfileViews: boolean;
    blockUnknownCallers: boolean;
    hidePhoneNumber: boolean;
  }

  // EN: Audio/Video settings interface
  // FR: Interface des paramètres audio/vidéo
  interface AudioVideoSettings {
    microphoneEnabled: boolean;
    cameraEnabled: boolean;
    speakerEnabled: boolean;
    audioQuality: 'low' | 'medium' | 'high';
    videoQuality: 'low' | 'medium' | 'high';
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
    preferredAudioDevice: string;
    preferredVideoDevice: string;
    preferredSpeakerDevice: string;
  }

  // EN: Theme settings interface
  // FR: Interface des paramètres de thème
  interface ThemeSettings {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    fontFamily: string;
    animations: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  }

  // EN: Security settings interface
  // FR: Interface des paramètres de sécurité
  interface SecuritySettings {
    twoFactorAuth: boolean;
    biometricAuth: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
    securityAlerts: boolean;
    dataEncryption: boolean;
    secureBackup: boolean;
    privacyMode: boolean;
  }

  // EN: Data settings interface
  // FR: Interface des paramètres de données
  interface DataSettings {
    autoSync: boolean;
    syncFrequency: 'realtime' | '5min' | '15min' | '30min' | '1hour';
    dataSavingMode: boolean;
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    dataRetention: number;
    cacheSize: number;
    offlineMode: boolean;
  }

  // EN: Chat interface
  // FR: Interface de chat
  interface Chat {
    _id: string;
    chatName?: string;
    isGroupChat: boolean;
    users: User[];
    owner?: User;
    lastMessage?: Message;
    lastTimeMessageRead?: Date;
    image?: string;
    ongoingCall?: {
      callId: string;
      type: 'audio' | 'video';
      participants: string[];
    };
  }

  // EN: Message interface
  // FR: Interface de message
  interface Message {
    _id: string;
    sender: User;
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';
    timestamp: Date;
    isRead: boolean;
    isEdited: boolean;
    isDeleted: boolean;
    replyTo?: Message;
    reactions: {
      emoji: string;
      users: string[];
    }[];
    file?: {
      filename: string;
      originalName: string;
      size: number;
      type: string;
      url: string;
      thumbnail?: string;
    };
  }

  // EN: Notification interface
  // FR: Interface de notification
  interface Notification {
    _id: string;
    userId: string;
    senderId?: string;
    type: 'message' | 'call' | 'friend_request' | 'group_invite' | 'status_update' | 'meeting_invite' | 'system' | 'security';
    message: string;
    link?: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'social' | 'communication' | 'system' | 'security' | 'reminder';
    createdAt: Date;
  }

  // EN: Status interface
  // FR: Interface de statut
  interface Status {
    _id: string;
    userId: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'poll';
    content: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    pollOptions?: {
      option: string;
      votes: number;
    }[];
    visibility: 'public' | 'contacts' | 'custom';
    reactions: {
      emoji: string;
      users: string[];
    }[];
    comments: {
      userId: string;
      content: string;
      timestamp: Date;
    }[];
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }

  // EN: Meeting interface
  // FR: Interface de réunion
  interface Meeting {
    _id: string;
    organizer: User;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    participants: {
      userId: string;
      role: 'organizer' | 'participant' | 'observer';
      status: 'pending' | 'accepted' | 'declined' | 'tentative';
    }[];
    agenda?: string[];
    recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrenceDetails?: {
      interval: number;
      daysOfWeek?: number[];
      dayOfMonth?: number;
      endDate?: Date;
    };
    type: 'video' | 'audio' | 'in_person' | 'hybrid';
    location?: string;
    meetingLink?: string;
    password?: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    recordingEnabled: boolean;
    waitingRoomEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  // EN: File interface
  // FR: Interface de fichier
  interface File {
    _id: string;
    filename: string;
    originalName: string;
    category: 'image' | 'video' | 'audio' | 'document' | 'other';
    size: number;
    type: string;
    path: string;
    url: string;
    thumbnail?: string;
    metadata?: {
      width?: number;
      height?: number;
      duration?: number;
      format?: string;
    };
    chat?: string;
    message?: string;
    isPublic: boolean;
    downloadCount: number;
    lastAccessed?: Date;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  // EN: Network status interface
  // FR: Interface du statut réseau
  interface NetworkStatus {
    isOnline: boolean;
    connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
    strength: number;
    bandwidth: number;
    latency: number;
    lastChecked: Date;
  }

  // EN: Data saving mode interface
  // FR: Interface du mode d'économie de données
  interface DataSavingMode {
    enabled: boolean;
    settings: {
      imageQuality: 'low' | 'medium' | 'high';
      videoQuality: 'low' | 'medium' | 'high';
      autoDownload: boolean;
      syncFrequency: 'realtime' | '5min' | '15min' | '30min' | '1hour';
      cacheSize: number;
    };
    autoActivation: {
      enabled: boolean;
      threshold: number;
      conditions: string[];
    };
  }

  // EN: Sync status interface
  // FR: Interface du statut de synchronisation
  interface SyncStatus {
    lastSync: Date;
    frequency: 'realtime' | '5min' | '15min' | '30min' | '1hour';
    pendingItems: number;
    errors: {
      type: string;
      message: string;
      timestamp: Date;
    }[];
    isSyncing: boolean;
  }

  // EN: Backup settings interface
  // FR: Interface des paramètres de sauvegarde
  interface BackupSettings {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    types: ('messages' | 'contacts' | 'settings' | 'media')[];
    location: 'local' | 'cloud' | 'both';
    encryption: boolean;
    retention: number;
    lastBackup?: Date;
    nextBackup?: Date;
  }

  // EN: Emoji settings interface
  // FR: Interface des paramètres d'emoji
  interface EmojiSettings {
    recent: string[];
    favorites: string[];
    skinTone: 'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
    categories: {
      name: string;
      emojis: string[];
    }[];
  }

  // EN: API response interface
  // FR: Interface de réponse API
  interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
  }

  // EN: Pagination interface
  // FR: Interface de pagination
  interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }

  // EN: Search result interface
  // FR: Interface de résultat de recherche
  interface SearchResult {
    users: User[];
    chats: Chat[];
    messages: Message[];
    files: File[];
    statuses: Status[];
    meetings: Meeting[];
    total: number;
  }

  // EN: Filter interface
  // FR: Interface de filtre
  interface Filter {
    type?: string;
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
    priority?: string;
    isRead?: boolean;
  }

  // EN: Sort interface
  // FR: Interface de tri
  interface Sort {
    field: string;
    order: 'asc' | 'desc';
  }
}

// EN: Export empty object to make this a module
// FR: Exporter un objet vide pour en faire un module
export {};
