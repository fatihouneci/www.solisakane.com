/**
 * @file webrtc.config.js
 * @description
 * EN: This file contains WebRTC configuration settings and optimization options for mediasoup and client applications.
 * FR: Ce fichier contient les paramètres de configuration WebRTC et les options d'optimisation pour mediasoup et les applications clientes.
 */
import mediasoup from 'mediasoup';

/**
 * EN: WebRTC configuration object
 * FR: Objet de configuration WebRTC
 */
const webrtcConfig = {
  // EN: Mediasoup worker configuration / FR: Configuration du worker mediasoup
  mediasoup: {
    worker: {
      logLevel: process.env.MEDIASOUP_LOG_LEVEL || 'warn',
      logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp',
        'rtx',
        'bwe',
        'score',
        'simulcast',
        'svc'
      ],
      rtcMinPort: parseInt(process.env.MEDIASOUP_RTC_MIN_PORT) || 10000,
      rtcMaxPort: parseInt(process.env.MEDIASOUP_RTC_MAX_PORT) || 10100,
      dtlsCertificateFile: process.env.MEDIASOUP_DTLS_CERT_FILE,
      dtlsPrivateKeyFile: process.env.MEDIASOUP_DTLS_PRIVATE_KEY_FILE,
      appData: {
        version: '1.0.0'
      }
    },
    router: {
      mediaCodecs: [
        // EN: Audio codecs / FR: Codecs audio
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
          parameters: {
            useinbandfec: 1,
            usedtx: 1,
            stereo: 1,
            'sprop-stereo': 1
          }
        },
        {
          kind: 'audio',
          mimeType: 'audio/G722',
          clockRate: 8000,
          channels: 1
        },
        {
          kind: 'audio',
          mimeType: 'audio/PCMU',
          clockRate: 8000,
          channels: 1
        },
        {
          kind: 'audio',
          mimeType: 'audio/PCMA',
          clockRate: 8000,
          channels: 1
        },
        // EN: Video codecs / FR: Codecs vidéo
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000,
            'x-google-max-bitrate': 5000,
            'x-google-min-bitrate': 100
          }
        },
        {
          kind: 'video',
          mimeType: 'video/VP9',
          clockRate: 90000,
          parameters: {
            'profile-id': 2,
            'x-google-start-bitrate': 1000,
            'x-google-max-bitrate': 5000,
            'x-google-min-bitrate': 100
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '4d0032',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000,
            'x-google-max-bitrate': 5000,
            'x-google-min-bitrate': 100
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000,
            'x-google-max-bitrate': 5000,
            'x-google-min-bitrate': 100
          }
        }
      ]
    },
    transport: {
      listenIps: [
        {
          ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP
        }
      ],
      enableUdp: process.env.MEDIASOUP_ENABLE_UDP !== 'false',
      enableTcp: process.env.MEDIASOUP_ENABLE_TCP !== 'false',
      preferUdp: process.env.MEDIASOUP_PREFER_UDP !== 'false',
      enableSctp: process.env.MEDIASOUP_ENABLE_SCTP !== 'false',
      numSctpStreams: {
        OS: parseInt(process.env.MEDIASOUP_SCTP_STREAMS_OS) || 1024,
        MIS: parseInt(process.env.MEDIASOUP_SCTP_STREAMS_MIS) || 1024
      },
      maxSctpMessageSize: parseInt(process.env.MEDIASOUP_MAX_SCTP_MESSAGE_SIZE) || 262144,
      sctpSendBufferSize: parseInt(process.env.MEDIASOUP_SCTP_SEND_BUFFER_SIZE) || 262144,
      appData: {
        type: 'webrtc'
      }
    }
  },

  // EN: React Native WebRTC configuration / FR: Configuration WebRTC React Native
  reactNative: {
    webrtc: {
      version: '1.94.2',
      features: [
        'RTCPeerConnection',
        'RTCMediaStream',
        'RTCMediaStreamTrack',
        'RTCDataChannel',
        'getUserMedia',
        'getDisplayMedia'
      ],
      constraints: {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 2
        },
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        }
      }
    },
    mediasoupClient: {
      version: '3.6.36',
      features: [
        'Device',
        'Transport',
        'Producer',
        'Consumer',
        'DataProducer',
        'DataConsumer'
      ]
    },
    callManagement: {
      callKeep: {
        version: '4.3.14',
        features: [
          'Incoming call handling',
          'Call state management',
          'Call UI integration'
        ]
      },
      incomingCall: {
        version: '2.0.3',
        features: [
          'Incoming call notifications',
          'Call acceptance',
          'Call rejection'
        ]
      },
      incallManager: {
        version: '4.2.0',
        features: [
          'Audio session management',
          'Speaker control',
          'Microphone control'
        ]
      }
    }
  },

  // EN: Web client WebRTC configuration / FR: Configuration WebRTC client web
  web: {
    mediasoupClient: {
      version: '3.10.0',
      features: [
        'Device',
        'Transport',
        'Producer',
        'Consumer',
        'DataProducer',
        'DataConsumer'
      ]
    },
    tensorflow: {
      version: '3.8.0',
      bodyPixVersion: '2.2.0',
      features: [
        'Background removal',
        'Body segmentation',
        'AI processing'
      ]
    },
    constraints: {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2
      },
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user'
      },
      screen: {
        video: {
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30, max: 60 }
        }
      }
    }
  },

  // EN: Performance configuration / FR: Configuration des performances
  performance: {
    // EN: Bitrate settings / FR: Paramètres de débit
    bitrates: {
      audio: {
        min: 32000,
        max: 128000,
        default: 64000
      },
      video: {
        min: 100000,
        max: 5000000,
        default: 1000000,
        screen: {
          min: 500000,
          max: 10000000,
          default: 2000000
        }
      }
    },
    // EN: Quality settings / FR: Paramètres de qualité
    quality: {
      low: {
        video: { width: 320, height: 240, frameRate: 15 },
        audio: { bitrate: 32000 }
      },
      medium: {
        video: { width: 640, height: 480, frameRate: 30 },
        audio: { bitrate: 64000 }
      },
      high: {
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: { bitrate: 128000 }
      },
      ultra: {
        video: { width: 1920, height: 1080, frameRate: 60 },
        audio: { bitrate: 128000 }
      }
    },
    // EN: Adaptive bitrate / FR: Débit adaptatif
    adaptiveBitrate: {
      enabled: true,
      thresholds: {
        low: 0.3,
        medium: 0.6,
        high: 0.8
      },
      adjustmentInterval: 5000
    }
  },

  // EN: Security configuration / FR: Configuration de sécurité
  security: {
    // EN: ICE configuration / FR: Configuration ICE
    ice: {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        },
        {
          urls: 'stun:stun1.l.google.com:19302'
        }
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      iceGatheringTimeout: 10000
    },
    // EN: DTLS configuration / FR: Configuration DTLS
    dtls: {
      enabled: true,
      certificateFile: process.env.DTLS_CERT_FILE,
      privateKeyFile: process.env.DTLS_PRIVATE_KEY_FILE
    },
    // EN: SRTP configuration / FR: Configuration SRTP
    srtp: {
      enabled: true,
      cryptoSuite: 'AES_CM_128_HMAC_SHA1_80'
    }
  },

  // EN: Monitoring configuration / FR: Configuration de monitoring
  monitoring: {
    enabled: true,
    metrics: {
      connection: true,
      quality: true,
      performance: true,
      errors: true
    },
    alerts: {
      maxLatency: parseInt(process.env.WEBRTC_MAX_LATENCY) || 1000,
      maxPacketLoss: parseFloat(process.env.WEBRTC_MAX_PACKET_LOSS) || 0.05,
      maxJitter: parseInt(process.env.WEBRTC_MAX_JITTER) || 50
    },
    reporting: {
      interval: parseInt(process.env.WEBRTC_REPORTING_INTERVAL) || 30000,
      endpoint: process.env.WEBRTC_MONITORING_ENDPOINT
    }
  },

  // EN: Environment-specific settings / FR: Paramètres spécifiques à l'environnement
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  }
};

/**
 * EN: Initialize mediasoup worker with configuration
 * FR: Initialiser le worker mediasoup avec configuration
 */
const initializeMediasoupWorker = async () => {
  try {
    const worker = await mediasoup.createWorker(webrtcConfig.mediasoup.worker);
    
    worker.on('died', () => {
      console.error('❌ Mediasoup worker died, exiting in 2 seconds...');
      setTimeout(() => process.exit(1), 2000);
    });

    const router = await worker.createRouter(webrtcConfig.mediasoup.router);
    
    console.log('✅ Mediasoup worker and router initialized successfully');
    return { worker, router };
  } catch (error) {
    console.error('❌ Failed to initialize mediasoup worker:', error);
    throw error;
  }
};

/**
 * EN: Create WebRTC transport with configuration
 * FR: Créer un transport WebRTC avec configuration
 */
const createWebRTCTransport = async (router, direction = 'sendrecv') => {
  try {
    const transport = await router.createWebRtcTransport({
      ...webrtcConfig.mediasoup.transport,
      appData: {
        ...webrtcConfig.mediasoup.transport.appData,
        direction
      }
    });

    return transport;
  } catch (error) {
    console.error('❌ Failed to create WebRTC transport:', error);
    throw error;
  }
};

/**
 * EN: Get WebRTC health status
 * FR: Obtenir le statut de santé WebRTC
 */
const getWebRTCHealth = (worker, router) => {
  try {
    const health = {
      status: 'healthy',
      worker: {
        pid: worker?.pid || null,
        status: worker ? 'active' : 'inactive'
      },
      router: {
        id: router?.id || null,
        status: router ? 'active' : 'inactive'
      },
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    if (!worker || !router) {
      health.status = 'unhealthy';
      health.warnings = ['Worker or router not initialized'];
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

/**
 * EN: Get supported codecs information
 * FR: Obtenir les informations des codecs supportés
 */
const getSupportedCodecs = () => {
  return {
    audio: webrtcConfig.mediasoup.router.mediaCodecs.filter(codec => codec.kind === 'audio'),
    video: webrtcConfig.mediasoup.router.mediaCodecs.filter(codec => codec.kind === 'video')
  };
};

/**
 * EN: Get platform-specific constraints
 * FR: Obtenir les contraintes spécifiques à la plateforme
 */
const getPlatformConstraints = (platform) => {
  switch (platform) {
    case 'react-native':
      return webrtcConfig.reactNative.webrtc.constraints;
    case 'web':
      return webrtcConfig.web.constraints;
    default:
      return webrtcConfig.web.constraints;
  }
};

export default {
  webrtcConfig,
  initializeMediasoupWorker,
  createWebRTCTransport,
  getWebRTCHealth,
  getSupportedCodecs,
  getPlatformConstraints
};
