/**
 * @file socket.config.js
 * @description
 * EN: This file contains Socket.IO configuration settings and optimization options.
 * FR: Ce fichier contient les paramètres de configuration Socket.IO et les options d'optimisation.
 */
import { Server } from 'socket.io';
import config from './config.js';

/**
 * EN: Socket.IO configuration object
 * FR: Objet de configuration Socket.IO
 */
const socketConfig = {
  // EN: Server configuration / FR: Configuration du serveur
  server: {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
    upgradeTimeout: parseInt(process.env.SOCKET_UPGRADE_TIMEOUT) || 10000,
    maxHttpBufferSize: parseInt(process.env.SOCKET_MAX_HTTP_BUFFER_SIZE) || 1000000,
    allowEIO3: process.env.SOCKET_ALLOW_EIO3 === 'true',
    allowRequest: null, // EN: Custom request validation / FR: Validation de requête personnalisée
    serveClient: process.env.SOCKET_SERVE_CLIENT !== 'false',
    path: process.env.SOCKET_PATH || '/socket.io/',
    connectTimeout: parseInt(process.env.SOCKET_CONNECT_TIMEOUT) || 45000,
    destroyUpgrade: process.env.SOCKET_DESTROY_UPGRADE !== 'false',
    destroyUpgradeTimeout: parseInt(process.env.SOCKET_DESTROY_UPGRADE_TIMEOUT) || 1000
  },

  // EN: Engine configuration / FR: Configuration du moteur
  engine: {
    protocol: process.env.SOCKET_ENGINE_PROTOCOL || 'ws',
    transports: ['websocket', 'polling'],
    allowUpgrades: true,
    perMessageDeflate: {
      threshold: 1024,
      concurrencyLimit: 10,
      memLevel: 7
    },
    maxPayload: parseInt(process.env.SOCKET_MAX_PAYLOAD) || 1000000,
    compression: process.env.SOCKET_COMPRESSION !== 'false',
    httpCompression: {
      threshold: 1024,
      level: 6,
      memLevel: 8
    }
  },

  // EN: Namespace configuration / FR: Configuration des espaces de noms
  namespaces: {
    '/': {
      // EN: Default namespace / FR: Espace de noms par défaut
      events: [
        'authenticate',
        'join_chat',
        'leave_chat',
        'send_message',
        'typing',
        'initiate_call',
        'answer_call',
        'end_call',
        'status_change',
        'disconnect'
      ],
      middleware: [
        'authentication',
        'rateLimiting',
        'logging'
      ]
    },
    '/admin': {
      // EN: Admin namespace / FR: Espace de noms admin
      events: [
        'admin_authenticate',
        'get_server_stats',
        'get_connected_users',
        'send_broadcast',
        'kick_user',
        'ban_user'
      ],
      middleware: [
        'adminAuthentication',
        'adminRateLimiting',
        'adminLogging'
      ]
    },
    '/support': {
      // EN: Support namespace / FR: Espace de noms support
      events: [
        'support_authenticate',
        'create_ticket',
        'update_ticket',
        'send_support_message',
        'get_tickets'
      ],
      middleware: [
        'supportAuthentication',
        'supportRateLimiting',
        'supportLogging'
      ]
    }
  },

  // EN: Room configuration / FR: Configuration des salles
  rooms: {
    userRooms: {
      prefix: 'user_',
      maxUsers: 1,
      autoJoin: true,
      autoLeave: true
    },
    chatRooms: {
      prefix: 'chat_',
      maxUsers: parseInt(process.env.SOCKET_MAX_CHAT_USERS) || 100,
      autoJoin: false,
      autoLeave: true
    },
    callRooms: {
      prefix: 'call_',
      maxUsers: parseInt(process.env.SOCKET_MAX_CALL_USERS) || 10,
      autoJoin: false,
      autoLeave: true
    },
    adminRooms: {
      prefix: 'admin_',
      maxUsers: parseInt(process.env.SOCKET_MAX_ADMIN_USERS) || 50,
      autoJoin: false,
      autoLeave: false
    }
  },

  // EN: Event configuration / FR: Configuration des événements
  events: {
    authentication: {
      timeout: 30000,
      maxAttempts: 3,
      rateLimit: {
        windowMs: 60000,
        max: 5
      }
    },
    messaging: {
      maxMessageLength: parseInt(process.env.SOCKET_MAX_MESSAGE_LENGTH) || 10000,
      rateLimit: {
        windowMs: 1000,
        max: 10
      },
      floodProtection: {
        enabled: true,
        threshold: 5,
        windowMs: 10000
      }
    },
    calling: {
      maxCallDuration: parseInt(process.env.SOCKET_MAX_CALL_DURATION) || 3600000, // 1 hour
      rateLimit: {
        windowMs: 60000,
        max: 10
      }
    },
    typing: {
      rateLimit: {
        windowMs: 1000,
        max: 5
      },
      debounceTime: 1000
    }
  },

  // EN: Security configuration / FR: Configuration de sécurité
  security: {
    authentication: {
      required: true,
      tokenValidation: true,
      userValidation: true,
      sessionValidation: true
    },
    rateLimiting: {
      enabled: true,
      global: {
        windowMs: 60000,
        max: 1000
      },
      perUser: {
        windowMs: 60000,
        max: 100
      },
      perEvent: {
        windowMs: 60000,
        max: 50
      }
    },
    inputValidation: {
      enabled: true,
      sanitization: true,
      maxLength: 10000,
      allowedTypes: ['string', 'number', 'boolean', 'object', 'array']
    },
    cors: {
      enabled: true,
      origin: process.env.SOCKET_CORS_ORIGIN || "*",
      credentials: true
    }
  },

  // EN: Performance configuration / FR: Configuration des performances
  performance: {
    compression: {
      enabled: true,
      threshold: 1024,
      level: 6
    },
    clustering: {
      enabled: process.env.SOCKET_CLUSTERING === 'true',
      adapter: process.env.SOCKET_CLUSTER_ADAPTER || 'redis',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || null,
        db: parseInt(process.env.REDIS_DB) || 0
      }
    },
    monitoring: {
      enabled: true,
      metrics: {
        connections: true,
        events: true,
        rooms: true,
        errors: true,
        performance: true
      },
      alerts: {
        maxConnections: parseInt(process.env.SOCKET_MAX_CONNECTIONS) || 10000,
        maxErrorRate: parseFloat(process.env.SOCKET_MAX_ERROR_RATE) || 0.1,
        maxLatency: parseInt(process.env.SOCKET_MAX_LATENCY) || 1000
      }
    }
  },

  // EN: Logging configuration / FR: Configuration de journalisation
  logging: {
    enabled: true,
    level: process.env.SOCKET_LOG_LEVEL || 'info',
    events: {
      connection: true,
      disconnection: true,
      authentication: true,
      errors: true,
      performance: true
    },
    format: process.env.SOCKET_LOG_FORMAT || 'json',
    destination: process.env.SOCKET_LOG_DESTINATION || 'console'
  },

  // EN: Environment-specific settings / FR: Paramètres spécifiques à l'environnement
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  }
};

/**
 * EN: Initialize Socket.IO server with enhanced configuration
 * FR: Initialiser le serveur Socket.IO avec une configuration améliorée
 */
const initializeSocketIO = (httpServer) => {
  try {
    // EN: Create Socket.IO server with configuration / FR: Créer le serveur Socket.IO avec configuration
    const io = new Server(httpServer, socketConfig.server);

    // EN: Configure engine settings / FR: Configurer les paramètres du moteur
    if (socketConfig.engine.protocol) {
      io.engine.protocol = socketConfig.engine.protocol;
    }

    // EN: Set up compression / FR: Configurer la compression
    if (socketConfig.performance.compression.enabled) {
      io.engine.perMessageDeflate = socketConfig.engine.perMessageDeflate;
    }

    // EN: Set up clustering if enabled / FR: Configurer le clustering si activé
    if (socketConfig.performance.clustering.enabled) {
      const { createAdapter } = require('@socket.io/redis-adapter');
      const { createClient } = require('redis');
      
      const pubClient = createClient({
        host: socketConfig.performance.clustering.redis.host,
        port: socketConfig.performance.clustering.redis.port,
        password: socketConfig.performance.clustering.redis.password,
        db: socketConfig.performance.clustering.redis.db
      });
      
      const subClient = pubClient.duplicate();
      
      Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Socket.IO Redis adapter configured');
      }).catch(error => {
        console.error('❌ Failed to configure Socket.IO Redis adapter:', error);
      });
    }

    // EN: Set up monitoring if enabled / FR: Configurer le monitoring si activé
    if (socketConfig.performance.monitoring.enabled) {
      setupMonitoring(io);
    }

    // EN: Set up logging if enabled / FR: Configurer la journalisation si activée
    if (socketConfig.logging.enabled) {
      setupLogging(io);
    }

    console.log('✅ Socket.IO server initialized with enhanced configuration');
    return io;
  } catch (error) {
    console.error('❌ Failed to initialize Socket.IO server:', error);
    throw error;
  }
};

/**
 * EN: Setup Socket.IO monitoring
 * FR: Configurer le monitoring Socket.IO
 */
const setupMonitoring = (io) => {
  const metrics = {
    connections: 0,
    events: 0,
    errors: 0,
    startTime: Date.now()
  };

  // EN: Monitor connections / FR: Surveiller les connexions
  io.on('connection', (socket) => {
    metrics.connections++;
    
    socket.on('disconnect', () => {
      metrics.connections--;
    });
  });

  // EN: Monitor events / FR: Surveiller les événements
  io.on('connection', (socket) => {
    socket.onAny((event, ...args) => {
      metrics.events++;
    });
  });

  // EN: Monitor errors / FR: Surveiller les erreurs
  io.on('connection', (socket) => {
    socket.on('error', (error) => {
      metrics.errors++;
      console.error('Socket.IO error:', error);
    });
  });

  // EN: Periodic metrics reporting / FR: Rapport périodique des métriques
  setInterval(() => {
    const uptime = Date.now() - metrics.startTime;
    const errorRate = metrics.errors / metrics.events || 0;
    
    console.log('📊 Socket.IO Metrics:', {
      connections: metrics.connections,
      events: metrics.events,
      errors: metrics.errors,
      errorRate: errorRate.toFixed(4),
      uptime: Math.floor(uptime / 1000) + 's'
    });

    // EN: Check alerts / FR: Vérifier les alertes
    if (metrics.connections > socketConfig.performance.monitoring.alerts.maxConnections) {
      console.warn('⚠️  High connection count:', metrics.connections);
    }
    
    if (errorRate > socketConfig.performance.monitoring.alerts.maxErrorRate) {
      console.warn('⚠️  High error rate:', errorRate);
    }
  }, 60000); // EN: Every minute / FR: Chaque minute
};

/**
 * EN: Setup Socket.IO logging
 * FR: Configurer la journalisation Socket.IO
 */
const setupLogging = (io) => {
  const logLevel = socketConfig.logging.level;
  const logEvents = socketConfig.logging.events;

  // EN: Log connections / FR: Enregistrer les connexions
  if (logEvents.connection) {
    io.on('connection', (socket) => {
      console.log(`🔌 Socket.IO connection: ${socket.id}`);
    });
  }

  // EN: Log disconnections / FR: Enregistrer les déconnexions
  if (logEvents.disconnection) {
    io.on('connection', (socket) => {
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket.IO disconnection: ${socket.id}, reason: ${reason}`);
      });
    });
  }

  // EN: Log errors / FR: Enregistrer les erreurs
  if (logEvents.errors) {
    io.on('connection', (socket) => {
      socket.on('error', (error) => {
        console.error(`❌ Socket.IO error: ${socket.id}`, error);
      });
    });
  }
};

/**
 * EN: Get Socket.IO health status
 * FR: Obtenir le statut de santé Socket.IO
 */
const getSocketIOHealth = (io) => {
  try {
    const health = {
      status: 'healthy',
      connections: io.engine?.clientsCount || 0,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      engine: io.engine?.protocol || 'unknown',
      transports: io.engine?.transports || [],
      timestamp: new Date().toISOString()
    };

    // EN: Check health thresholds / FR: Vérifier les seuils de santé
    if (health.connections > socketConfig.performance.monitoring.alerts.maxConnections) {
      health.status = 'warning';
      health.warnings = ['High connection count'];
    }

    return health;
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  socketConfig,
  initializeSocketIO,
  setupMonitoring,
  setupLogging,
  getSocketIOHealth
};
