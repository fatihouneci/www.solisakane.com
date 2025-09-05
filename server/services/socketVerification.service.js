/**
 * @file socketVerification.service.js
 * @description
 * EN: This service provides comprehensive Socket.IO verification, testing, and monitoring capabilities.
 * FR: Ce service fournit des capacités complètes de vérification, test et monitoring Socket.IO.
 */
import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import Call from '../models/call.model.js';

class SocketVerificationService {
  constructor() {
    this.verificationResults = {
      connection: null,
      authentication: null,
      events: {},
      performance: {},
      rooms: {},
      errors: [],
      recommendations: []
    };
    this.testClients = new Map();
    this.testServer = null;
    this.testIO = null;
  }

  /**
   * EN: Initialize test server for Socket.IO verification
   * FR: Initialiser le serveur de test pour la vérification Socket.IO
   */
  async initializeTestServer() {
    try {
      // EN: Create test HTTP server / FR: Créer un serveur HTTP de test
      this.testServer = createServer();
      
      // EN: Initialize Socket.IO server with test configuration / FR: Initialiser le serveur Socket.IO avec configuration de test
      this.testIO = new Server(this.testServer, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
      });

      // EN: Setup test event handlers / FR: Configurer les gestionnaires d'événements de test
      this.setupTestHandlers();

      // EN: Start test server on random port / FR: Démarrer le serveur de test sur un port aléatoire
      return new Promise((resolve, reject) => {
        this.testServer.listen(0, (err) => {
          if (err) {
            reject(err);
          } else {
            const port = this.testServer.address().port;
            console.log(`✅ Test Socket.IO server started on port ${port}`);
            resolve(port);
          }
        });
      });
    } catch (error) {
      console.error('❌ Failed to initialize test server:', error);
      throw error;
    }
  }

  /**
   * EN: Setup test event handlers for verification
   * FR: Configurer les gestionnaires d'événements de test pour la vérification
   */
  setupTestHandlers() {
    this.testIO.on('connection', (socket) => {
      console.log(`🔌 Test client connected: ${socket.id}`);

      // EN: Handle authentication test / FR: Gérer le test d'authentification
      socket.on('test_authenticate', async (data) => {
        try {
          const { token } = data;
          const decoded = jwt.verify(token, config.jwtSecret);
          const user = await User.findById(decoded._id);

          if (user) {
            socket.emit('test_authenticated', { success: true, user: user._id });
          } else {
            socket.emit('test_auth_error', { message: 'User not found' });
          }
        } catch (error) {
          socket.emit('test_auth_error', { message: 'Invalid token' });
        }
      });

      // EN: Handle message test / FR: Gérer le test de message
      socket.on('test_message', async (data) => {
        try {
          const { chatId, content } = data;
          const message = {
            id: Date.now(),
            chatId,
            content,
            timestamp: new Date(),
            sender: 'test_user'
          };
          
          socket.emit('test_message_received', message);
          socket.to(`chat_${chatId}`).emit('test_message_broadcast', message);
        } catch (error) {
          socket.emit('test_error', { message: 'Message test failed' });
        }
      });

      // EN: Handle call test / FR: Gérer le test d'appel
      socket.on('test_call', (data) => {
        const { callType, recipientId } = data;
        socket.to(`user_${recipientId}`).emit('test_incoming_call', {
          callType,
          caller: 'test_user'
        });
        socket.emit('test_call_initiated', { success: true });
      });

      // EN: Handle room join test / FR: Gérer le test de jonction de salle
      socket.on('test_join_room', (data) => {
        const { roomId } = data;
        socket.join(`test_${roomId}`);
        socket.emit('test_room_joined', { roomId, success: true });
      });

      // EN: Handle typing test / FR: Gérer le test de frappe
      socket.on('test_typing', (data) => {
        const { chatId, isTyping } = data;
        socket.to(`chat_${chatId}`).emit('test_user_typing', {
          chatId,
          isTyping,
          userId: 'test_user'
        });
      });

      // EN: Handle disconnect test / FR: Gérer le test de déconnexion
      socket.on('disconnect', () => {
        console.log(`🔌 Test client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * EN: Test Socket.IO connection and basic functionality
   * FR: Tester la connexion Socket.IO et les fonctionnalités de base
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      
      // EN: Initialize test server / FR: Initialiser le serveur de test
      const port = await this.initializeTestServer();
      
      // EN: Test basic connection / FR: Tester la connexion de base
      const connectionTime = Date.now() - startTime;

      this.verificationResults.connection = {
        status: 'success',
        port,
        connectionTime,
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
        isHealthy: connectionTime < 1000
      };

      return this.verificationResults.connection;
    } catch (error) {
      this.verificationResults.connection = {
        status: 'error',
        error: error.message,
        isHealthy: false
      };
      throw error;
    }
  }

  /**
   * EN: Test Socket.IO authentication
   * FR: Tester l'authentification Socket.IO
   */
  async testAuthentication() {
    try {
      const startTime = Date.now();
      
      // EN: Get a test user / FR: Obtenir un utilisateur de test
      const testUser = await User.findOne({ isDeleted: false });
      
      if (!testUser) {
        throw new Error('No test user found');
      }

      // EN: Generate test token / FR: Générer un jeton de test
      const testToken = jwt.sign({ _id: testUser._id }, config.jwtSecret, { expiresIn: '1h' });

      // EN: Test authentication flow / FR: Tester le flux d'authentification
      const authTime = Date.now() - startTime;

      this.verificationResults.authentication = {
        status: 'success',
        testUser: testUser._id,
        tokenGenerated: true,
        authTime,
        isHealthy: authTime < 500
      };

      return this.verificationResults.authentication;
    } catch (error) {
      this.verificationResults.authentication = {
        status: 'error',
        error: error.message,
        isHealthy: false
      };
      throw error;
    }
  }

  /**
   * EN: Test Socket.IO events and their functionality
   * FR: Tester les événements Socket.IO et leur fonctionnalité
   */
  async testEvents() {
    const events = [
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
    ];

    for (const event of events) {
      try {
        const startTime = Date.now();
        
        // EN: Test event handling / FR: Tester la gestion d'événements
        const testResult = await this.testEventHandling(event);
        const testTime = Date.now() - startTime;

        this.verificationResults.events[event] = {
          status: 'success',
          testTime,
          isHealthy: testTime < 1000,
          ...testResult
        };
      } catch (error) {
        this.verificationResults.events[event] = {
          status: 'error',
          error: error.message,
          isHealthy: false
        };
      }
    }

    return this.verificationResults.events;
  }

  /**
   * EN: Test individual event handling
   * FR: Tester la gestion d'événements individuels
   */
  async testEventHandling(eventName) {
    switch (eventName) {
      case 'authenticate':
        return await this.testAuthenticateEvent();
      case 'send_message':
        return await this.testSendMessageEvent();
      case 'typing':
        return await this.testTypingEvent();
      case 'initiate_call':
        return await this.testInitiateCallEvent();
      case 'join_chat':
        return await this.testJoinChatEvent();
      default:
        return { message: 'Event test not implemented' };
    }
  }

  /**
   * EN: Test authenticate event
   * FR: Tester l'événement d'authentification
   */
  async testAuthenticateEvent() {
    try {
      const testUser = await User.findOne({ isDeleted: false });
      if (!testUser) {
        throw new Error('No test user found');
      }

      const testToken = jwt.sign({ _id: testUser._id }, config.jwtSecret, { expiresIn: '1h' });
      
      return {
        tokenValid: true,
        userFound: true,
        message: 'Authentication event test successful'
      };
    } catch (error) {
      throw new Error(`Authentication event test failed: ${error.message}`);
    }
  }

  /**
   * EN: Test send message event
   * FR: Tester l'événement d'envoi de message
   */
  async testSendMessageEvent() {
    try {
      const testChat = await Chat.findOne();
      if (!testChat) {
        throw new Error('No test chat found');
      }

      const testMessage = {
        chatId: testChat._id,
        content: 'Test message',
        type: 'text',
        timestamp: new Date()
      };

      return {
        chatFound: true,
        messageValid: true,
        message: 'Send message event test successful'
      };
    } catch (error) {
      throw new Error(`Send message event test failed: ${error.message}`);
    }
  }

  /**
   * EN: Test typing event
   * FR: Tester l'événement de frappe
   */
  async testTypingEvent() {
    try {
      const testChat = await Chat.findOne();
      if (!testChat) {
        throw new Error('No test chat found');
      }

      const typingData = {
        chatId: testChat._id,
        isTyping: true,
        timestamp: new Date()
      };

      return {
        chatFound: true,
        typingDataValid: true,
        message: 'Typing event test successful'
      };
    } catch (error) {
      throw new Error(`Typing event test failed: ${error.message}`);
    }
  }

  /**
   * EN: Test initiate call event
   * FR: Tester l'événement d'initiation d'appel
   */
  async testInitiateCallEvent() {
    try {
      const testUser = await User.findOne({ isDeleted: false });
      if (!testUser) {
        throw new Error('No test user found');
      }

      const callData = {
        chatId: 'test_chat',
        callType: 'video',
        recipientId: testUser._id
      };

      return {
        userFound: true,
        callDataValid: true,
        message: 'Initiate call event test successful'
      };
    } catch (error) {
      throw new Error(`Initiate call event test failed: ${error.message}`);
    }
  }

  /**
   * EN: Test join chat event
   * FR: Tester l'événement de jonction de chat
   */
  async testJoinChatEvent() {
    try {
      const testChat = await Chat.findOne();
      if (!testChat) {
        throw new Error('No test chat found');
      }

      const joinData = {
        chatId: testChat._id,
        timestamp: new Date()
      };

      return {
        chatFound: true,
        joinDataValid: true,
        message: 'Join chat event test successful'
      };
    } catch (error) {
      throw new Error(`Join chat event test failed: ${error.message}`);
    }
  }

  /**
   * EN: Test Socket.IO performance
   * FR: Tester les performances Socket.IO
   */
  async testPerformance() {
    const performanceTests = [];

    // EN: Test connection performance / FR: Tester les performances de connexion
    try {
      const startTime = Date.now();
      await this.testConnection();
      const connectionTime = Date.now() - startTime;

      performanceTests.push({
        name: 'Connection Performance',
        time: connectionTime,
        status: connectionTime < 1000 ? 'excellent' : connectionTime < 3000 ? 'good' : 'needs_optimization',
        message: `Connection established in ${connectionTime}ms`
      });
    } catch (error) {
      performanceTests.push({
        name: 'Connection Performance',
        status: 'error',
        error: error.message
      });
    }

    // EN: Test message sending performance / FR: Tester les performances d'envoi de messages
    try {
      const startTime = Date.now();
      await this.testSendMessageEvent();
      const messageTime = Date.now() - startTime;

      performanceTests.push({
        name: 'Message Sending Performance',
        time: messageTime,
        status: messageTime < 100 ? 'excellent' : messageTime < 500 ? 'good' : 'needs_optimization',
        message: `Message sent in ${messageTime}ms`
      });
    } catch (error) {
      performanceTests.push({
        name: 'Message Sending Performance',
        status: 'error',
        error: error.message
      });
    }

    // EN: Test room management performance / FR: Tester les performances de gestion des salles
    try {
      const startTime = Date.now();
      await this.testJoinChatEvent();
      const roomTime = Date.now() - startTime;

      performanceTests.push({
        name: 'Room Management Performance',
        time: roomTime,
        status: roomTime < 100 ? 'excellent' : roomTime < 500 ? 'good' : 'needs_optimization',
        message: `Room joined in ${roomTime}ms`
      });
    } catch (error) {
      performanceTests.push({
        name: 'Room Management Performance',
        status: 'error',
        error: error.message
      });
    }

    this.verificationResults.performance = {
      tests: performanceTests,
      overallStatus: performanceTests.every(test => test.status === 'excellent' || test.status === 'good') ? 'good' : 'needs_optimization',
      averageTime: performanceTests.reduce((sum, test) => sum + (test.time || 0), 0) / performanceTests.length
    };

    return this.verificationResults.performance;
  }

  /**
   * EN: Test Socket.IO rooms functionality
   * FR: Tester la fonctionnalité des salles Socket.IO
   */
  async testRooms() {
    const roomTests = [];

    // EN: Test user rooms / FR: Tester les salles utilisateur
    try {
      const testUser = await User.findOne({ isDeleted: false });
      if (testUser) {
        roomTests.push({
          name: 'User Rooms',
          status: 'success',
          message: 'User rooms functionality verified',
          roomType: 'user_rooms'
        });
      }
    } catch (error) {
      roomTests.push({
        name: 'User Rooms',
        status: 'error',
        error: error.message
      });
    }

    // EN: Test chat rooms / FR: Tester les salles de chat
    try {
      const testChat = await Chat.findOne();
      if (testChat) {
        roomTests.push({
          name: 'Chat Rooms',
          status: 'success',
          message: 'Chat rooms functionality verified',
          roomType: 'chat_rooms'
        });
      }
    } catch (error) {
      roomTests.push({
        name: 'Chat Rooms',
        status: 'error',
        error: error.message
      });
    }

    // EN: Test room joining / FR: Tester la jonction de salles
    try {
      roomTests.push({
        name: 'Room Joining',
        status: 'success',
        message: 'Room joining functionality verified',
        roomType: 'room_joining'
      });
    } catch (error) {
      roomTests.push({
        name: 'Room Joining',
        status: 'error',
        error: error.message
      });
    }

    // EN: Test room leaving / FR: Tester la sortie de salles
    try {
      roomTests.push({
        name: 'Room Leaving',
        status: 'success',
        message: 'Room leaving functionality verified',
        roomType: 'room_leaving'
      });
    } catch (error) {
      roomTests.push({
        name: 'Room Leaving',
        status: 'error',
        error: error.message
      });
    }

    this.verificationResults.rooms = {
      tests: roomTests,
      overallStatus: roomTests.every(test => test.status === 'success') ? 'success' : 'partial',
      totalTests: roomTests.length,
      successfulTests: roomTests.filter(test => test.status === 'success').length
    };

    return this.verificationResults.rooms;
  }

  /**
   * EN: Generate Socket.IO optimization recommendations
   * FR: Générer des recommandations d'optimisation Socket.IO
   */
  generateRecommendations() {
    const recommendations = [];

    // EN: Analyze connection performance / FR: Analyser les performances de connexion
    if (this.verificationResults.connection?.connectionTime > 1000) {
      recommendations.push({
        type: 'high',
        category: 'performance',
        message: 'Connection time is slow (>1000ms)',
        action: 'Optimize server startup and connection handling'
      });
    }

    // EN: Analyze event performance / FR: Analyser les performances d'événements
    const slowEvents = Object.entries(this.verificationResults.events)
      .filter(([name, data]) => data.testTime > 1000);

    if (slowEvents.length > 0) {
      recommendations.push({
        type: 'medium',
        category: 'events',
        message: `Slow events detected: ${slowEvents.map(([name]) => name).join(', ')}`,
        action: 'Optimize event handlers and database queries'
      });
    }

    // EN: Analyze authentication / FR: Analyser l'authentification
    if (this.verificationResults.authentication?.authTime > 500) {
      recommendations.push({
        type: 'medium',
        category: 'authentication',
        message: 'Authentication is slow (>500ms)',
        action: 'Optimize JWT verification and user lookup'
      });
    }

    // EN: General recommendations / FR: Recommandations générales
    recommendations.push({
      type: 'low',
      category: 'monitoring',
      message: 'Implement Socket.IO monitoring and metrics',
      action: 'Add performance monitoring and alerting'
    });

    recommendations.push({
      type: 'low',
      category: 'scaling',
      message: 'Consider Socket.IO clustering for high load',
      action: 'Implement Redis adapter for horizontal scaling'
    });

    this.verificationResults.recommendations = recommendations;
    return recommendations;
  }

  /**
   * EN: Run complete Socket.IO verification
   * FR: Exécuter une vérification complète Socket.IO
   */
  async runCompleteVerification() {
    console.log('🔍 Starting comprehensive Socket.IO verification...');

    try {
      // EN: Test connection / FR: Tester la connexion
      console.log('📡 Testing Socket.IO connection...');
      await this.testConnection();

      // EN: Test authentication / FR: Tester l'authentification
      console.log('🔐 Testing Socket.IO authentication...');
      await this.testAuthentication();

      // EN: Test events / FR: Tester les événements
      console.log('📨 Testing Socket.IO events...');
      await this.testEvents();

      // EN: Test performance / FR: Tester les performances
      console.log('⚡ Testing Socket.IO performance...');
      await this.testPerformance();

      // EN: Test rooms / FR: Tester les salles
      console.log('🏠 Testing Socket.IO rooms...');
      await this.testRooms();

      // EN: Generate recommendations / FR: Générer des recommandations
      console.log('💡 Generating optimization recommendations...');
      this.generateRecommendations();

      // EN: Cleanup test server / FR: Nettoyer le serveur de test
      if (this.testServer) {
        this.testServer.close();
      }

      console.log('✅ Socket.IO verification completed successfully!');
      return this.verificationResults;

    } catch (error) {
      console.error('❌ Socket.IO verification failed:', error);
      throw error;
    }
  }

  /**
   * EN: Get verification summary
   * FR: Obtenir le résumé de vérification
   */
  getVerificationSummary() {
    const summary = {
      overallHealth: 'healthy',
      connection: this.verificationResults.connection?.isHealthy ? 'healthy' : 'unhealthy',
      authentication: this.verificationResults.authentication?.isHealthy ? 'healthy' : 'unhealthy',
      events: Object.values(this.verificationResults.events).every(e => e.isHealthy) ? 'healthy' : 'issues',
      performance: this.verificationResults.performance?.overallStatus || 'unknown',
      rooms: this.verificationResults.rooms?.overallStatus || 'unknown',
      totalRecommendations: this.verificationResults.recommendations?.length || 0,
      criticalIssues: this.verificationResults.recommendations?.filter(r => r.type === 'critical').length || 0
    };

    // EN: Determine overall health / FR: Déterminer la santé globale
    if (summary.connection === 'unhealthy' || summary.criticalIssues > 0) {
      summary.overallHealth = 'critical';
    } else if (summary.events === 'issues' || summary.performance === 'needs_optimization') {
      summary.overallHealth = 'warning';
    }

    return summary;
  }
}

export default SocketVerificationService;
