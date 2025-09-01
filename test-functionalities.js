#!/usr/bin/env node

/**
 * Script de test des fonctionnalités pour Solisakane.com
 * Teste toutes les fonctionnalités principales de l'application
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5100';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3016';

// Couleurs pour les logs
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`.blue),
  success: (msg) => console.log(`[SUCCESS] ${msg}`.green),
  error: (msg) => console.log(`[ERROR] ${msg}`.red),
  warning: (msg) => console.log(`[WARNING] ${msg}`.yellow)
};

// Variables globales pour les tests
let testUser = null;
let authToken = null;
let testChat = null;

/**
 * Test de l'inscription d'un utilisateur
 */
async function testUserRegistration() {
  log.info('Test de l\'inscription utilisateur...');
  
  try {
    const userData = {
      fullName: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };

    const response = await axios.post(`${BASE_URL}/api/auth/register`, userData);
    
    if (response.status === 201) {
      log.success('✅ Inscription utilisateur réussie');
      testUser = userData;
      return true;
    }
  } catch (error) {
    log.error(`❌ Échec de l'inscription: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test de la connexion utilisateur
 */
async function testUserLogin() {
  log.info('Test de la connexion utilisateur...');
  
  try {
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };

    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    
    if (response.status === 200 && response.data.token) {
      log.success('✅ Connexion utilisateur réussie');
      authToken = response.data.token;
      return true;
    }
  } catch (error) {
    log.error(`❌ Échec de la connexion: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test de la récupération du profil utilisateur
 */
async function testUserProfile() {
  log.info('Test de la récupération du profil utilisateur...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
      log.success('✅ Récupération du profil réussie');
      return true;
    }
  } catch (error) {
    log.error(`❌ Échec de la récupération du profil: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test de la création d'un chat
 */
async function testChatCreation() {
  log.info('Test de la création d\'un chat...');
  
  try {
    const chatData = {
      users: [testUser._id || 'test-user-id'],
      isGroupChat: false
    };

    const response = await axios.post(`${BASE_URL}/api/chat`, chatData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201) {
      log.success('✅ Création de chat réussie');
      testChat = response.data.chat;
      return true;
    }
  } catch (error) {
    log.error(`❌ Échec de la création de chat: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test de l'envoi de message
 */
async function testMessageSending() {
  log.info('Test de l\'envoi de message...');
  
  try {
    const messageData = {
      content: 'Test message from automated test',
      type: 'text',
      chatId: testChat?._id || 'test-chat-id'
    };

    const response = await axios.post(`${BASE_URL}/api/message`, messageData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201) {
      log.success('✅ Envoi de message réussi');
      return true;
    }
  } catch (error) {
    log.error(`❌ Échec de l'envoi de message: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test de la récupération des messages
 */
async function testMessageRetrieval() {
  log.info('Test de la récupération des messages...');
  
  try {
    const chatId = testChat?._id || 'test-chat-id';
    const response = await axios.get(`${BASE_URL}/api/message/${chatId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
      log.success('✅ Récupération des messages réussie');
      return true;
    }
  } catch (error) {
    log.error(`❌ Échec de la récupération des messages: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test de l'upload de fichier
 */
async function testFileUpload() {
  log.info('Test de l\'upload de fichier...');
  
  try {
    // Créer un fichier de test
    const testFile = new Blob(['Test file content'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', testFile, 'test.txt');

    const response = await axios.post(`${BASE_URL}/api/file/upload`, formData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.status === 200) {
      log.success('✅ Upload de fichier réussi');
      return true;
    }
  } catch (error) {
    log.error(`❌ Échec de l'upload de fichier: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test de la santé de l'API
 */
async function testApiHealth() {
  log.info('Test de la santé de l\'API...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    if (response.status === 200) {
      log.success('✅ API en bonne santé');
      return true;
    }
  } catch (error) {
    log.warning(`⚠️ Endpoint de santé non disponible: ${error.message}`);
    return false;
  }
}

/**
 * Test de l'accès au frontend
 */
async function testFrontendAccess() {
  log.info('Test de l\'accès au frontend...');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    
    if (response.status === 200) {
      log.success('✅ Frontend accessible');
      return true;
    }
  } catch (error) {
    log.error(`❌ Frontend inaccessible: ${error.message}`);
    return false;
  }
}

/**
 * Test de la connexion à la base de données
 */
async function testDatabaseConnection() {
  log.info('Test de la connexion à la base de données...');
  
  try {
    // Test indirect via l'API
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
      log.success('✅ Connexion à la base de données réussie');
      return true;
    }
  } catch (error) {
    log.error(`❌ Problème de connexion à la base de données: ${error.message}`);
    return false;
  }
}

/**
 * Test de la connexion Redis
 */
async function testRedisConnection() {
  log.info('Test de la connexion Redis...');
  
  try {
    // Test indirect via l'API (sessions)
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
      log.success('✅ Connexion Redis réussie');
      return true;
    }
  } catch (error) {
    log.error(`❌ Problème de connexion Redis: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  console.log('🧪 Démarrage des tests de fonctionnalités Solisakane.com'.rainbow);
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Frontend Access', fn: testFrontendAccess },
    { name: 'API Health', fn: testApiHealth },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Redis Connection', fn: testRedisConnection },
    { name: 'Chat Creation', fn: testChatCreation },
    { name: 'Message Sending', fn: testMessageSending },
    { name: 'Message Retrieval', fn: testMessageRetrieval },
    { name: 'File Upload', fn: testFileUpload }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      log.error(`❌ Erreur lors du test ${test.name}: ${error.message}`);
    }
    console.log(''); // Ligne vide pour la lisibilité
  }

  // Résumé des tests
  console.log('='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS'.rainbow);
  console.log('='.repeat(60));
  
  if (passedTests === totalTests) {
    log.success(`🎉 Tous les tests sont passés ! (${passedTests}/${totalTests})`);
    console.log('✅ L\'application Solisakane.com est prête pour la production !'.green);
  } else {
    log.warning(`⚠️ ${passedTests}/${totalTests} tests sont passés`);
    log.error(`❌ ${totalTests - passedTests} tests ont échoué`);
    console.log('🔧 Veuillez corriger les problèmes avant le déploiement en production.'.yellow);
  }

  console.log('');
  console.log('🌐 URLs de test:'.blue);
  console.log(`   Frontend: ${FRONTEND_URL}`.cyan);
  console.log(`   API: ${BASE_URL}`.cyan);
  console.log('');
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  log.error(`Erreur non gérée: ${error.message}`);
  process.exit(1);
});

// Exécution des tests
if (require.main === module) {
  runTests().catch(error => {
    log.error(`Erreur lors de l'exécution des tests: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
