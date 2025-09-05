// Types communs pour l'application Solisakane

// Interface pour les conversations
export interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

// Interface pour les contacts
export interface Contact {
  id: number;
  name: string;
  status: string;
  avatar?: string;
  lastSeen?: string;
  isOnline?: boolean;
}

// Interface pour les messages
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  isRead: boolean;
  isDelivered: boolean;
}

// Interface pour les notifications
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// Interface pour les paramètres
export interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  soundEnabled: boolean;
  autoDownload: boolean;
  dataSaver: boolean;
}

// Interface pour les fichiers
export interface FileUpload {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

// Interface pour les appels
export interface Call {
  id: number;
  callerId: number;
  receiverId: number;
  type: 'audio' | 'video';
  status: 'pending' | 'accepted' | 'rejected' | 'ended';
  startTime: string;
  endTime?: string;
  duration?: number;
}

// Interface pour les groupes
export interface Group {
  id: number;
  name: string;
  description?: string;
  members: number[];
  adminId: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les statuts/stories
export interface Status {
  id: number;
  userId: number;
  content: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
  createdAt: string;
  expiresAt: string;
  views: number;
  isViewed: boolean;
}

// Interface pour les recherches
export interface SearchResult {
  id: number;
  type: 'user' | 'group' | 'message' | 'file';
  title: string;
  description?: string;
  url?: string;
  timestamp?: string;
}

// Interface pour les erreurs
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Interface pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// Interface pour la pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Interface pour les réponses paginées
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// Types d'événements Socket.IO
export interface SocketEvents {
  // Événements de connexion
  'user:connected': (userId: number) => void;
  'user:disconnected': (userId: number) => void;
  
  // Événements de messages
  'message:sent': (message: Message) => void;
  'message:received': (message: Message) => void;
  'message:read': (messageId: number, userId: number) => void;
  'message:delivered': (messageId: number, userId: number) => void;
  
  // Événements d'appels
  'call:incoming': (call: Call) => void;
  'call:accepted': (callId: number) => void;
  'call:rejected': (callId: number) => void;
  'call:ended': (callId: number) => void;
  
  // Événements de notifications
  'notification:new': (notification: Notification) => void;
  'notification:read': (notificationId: number) => void;
  
  // Événements de statut
  'status:updated': (userId: number, status: string) => void;
  'status:seen': (statusId: number, userId: number) => void;
}

// Types pour les hooks personnalisés
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

// Types pour les formulaires
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// Types pour les composants UI
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Types pour les routes
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: string[];
}

// Types pour les permissions
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Types pour les préférences utilisateur
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    showOnlineStatus: boolean;
    allowMessagesFromStrangers: boolean;
    showLastSeen: boolean;
    showProfilePicture: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    lastSeenVisibility: 'everyone' | 'friends' | 'nobody';
    readReceipts: boolean;
    typingIndicators: boolean;
  };
  chat: {
    enterToSend: boolean;
    showEmojiPicker: boolean;
    autoDownloadMedia: boolean;
    dataSaver: boolean;
  };
}

export default {
  Conversation,
  Contact,
  Message,
  Notification,
  Settings,
  FileUpload,
  Call,
  Group,
  Status,
  SearchResult,
  ApiError,
  ApiResponse,
  Pagination,
  PaginatedResponse,
  SocketEvents,
  UseApiOptions,
  UseApiResult,
  FormField,
  FormData,
  FormErrors,
  ButtonProps,
  InputProps,
  ModalProps,
  RouteConfig,
  Permission,
  Role,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  UserPreferences,
};
