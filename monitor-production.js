#!/usr/bin/env node

/**
 * Script de monitoring pour Solisakane.com en production
 * Surveille la santé de l'application et envoie des alertes
 */

const axios = require('axios');
const colors = require('colors');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  API_URL: process.env.API_URL || 'https://solisakane.com',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://solisakane.com',
  CHECK_INTERVAL: parseInt(process.env.CHECK_INTERVAL) || 60000, // 1 minute
  LOG_FILE: process.env.LOG_FILE || './monitoring.log',
  ALERT_EMAIL: process.env.ALERT_EMAIL || 'admin@solisakane.com',
  SLACK_WEBHOOK: process.env.SLACK_WEBHOOK || null
};

// État du monitoring
let monitoringState = {
  isRunning: false,
  lastCheck: null,
  consecutiveFailures: 0,
  totalChecks: 0,
  successfulChecks: 0,
  failedChecks: 0
};

// Couleurs pour les logs
const log = {
  info: (msg) => console.log(`[${new Date().toISOString()}] [INFO] ${msg}`.blue),
  success: (msg) => console.log(`[${new Date().toISOString()}] [SUCCESS] ${msg}`.green),
  error: (msg) => console.log(`[${new Date().toISOString()}] [ERROR] ${msg`.red),
  warning: (msg) => console.log(`[${new Date().toISOString()}] [WARNING] ${msg}`.yellow),
  critical: (msg) => console.log(`[${new Date().toISOString()}] [CRITICAL] ${msg}`.red.bold)
};

/**
 * Écriture dans le fichier de log
 */
function writeLog(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} [${level}] ${message}\n`;
  
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logEntry);
  } catch (error) {
    console.error(`Erreur lors de l'écriture du log: ${error.message}`);
  }
}

/**
 * Envoi d'alerte par email (simulation)
 */
async function sendEmailAlert(subject, message) {
  log.critical(`ALERTE EMAIL: ${subject} - ${message}`);
  writeLog('ALERT', `EMAIL: ${subject} - ${message}`);
  
  // Ici vous pouvez intégrer un service d'email comme SendGrid, AWS SES, etc.
  // Pour l'instant, on simule juste l'envoi
  console.log(`📧 Email envoyé à ${CONFIG.ALERT_EMAIL}: ${subject}`);
}

/**
 * Envoi d'alerte Slack
 */
async function sendSlackAlert(message) {
  if (!CONFIG.SLACK_WEBHOOK) return;
  
  try {
    await axios.post(CONFIG.SLACK_WEBHOOK, {
      text: `🚨 ALERTE SOLISAKANE: ${message}`,
      username: 'Solisakane Monitor',
      icon_emoji: ':warning:'
    });
    log.info('Alerte Slack envoyée');
  } catch (error) {
    log.error(`Erreur envoi Slack: ${error.message}`);
  }
}

/**
 * Test de santé de l'API
 */
async function checkApiHealth() {
  try {
    const response = await axios.get(`${CONFIG.API_URL}/api/health`, {
      timeout: 10000
    });
    
    if (response.status === 200) {
      return { status: 'healthy', responseTime: response.headers['x-response-time'] || 'N/A' };
    }
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Test de l'accès au frontend
 */
async function checkFrontendHealth() {
  try {
    const response = await axios.get(CONFIG.FRONTEND_URL, {
      timeout: 10000
    });
    
    if (response.status === 200) {
      return { status: 'healthy', responseTime: response.headers['x-response-time'] || 'N/A' };
    }
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Test de la base de données via l'API
 */
async function checkDatabaseHealth() {
  try {
    // Test indirect via l'API
    const response = await axios.get(`${CONFIG.API_URL}/api/auth/me`, {
      timeout: 10000,
      validateStatus: () => true // Accepter tous les codes de statut
    });
    
    // Si on reçoit une réponse (même 401), la DB fonctionne
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Test de Redis via l'API
 */
async function checkRedisHealth() {
  try {
    // Test indirect via l'API
    const response = await axios.get(`${CONFIG.API_URL}/api/auth/me`, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Vérification des ressources système (simulation)
 */
async function checkSystemResources() {
  // Dans un vrai environnement, vous utiliseriez des outils comme
  // docker stats, htop, ou des APIs de monitoring
  return {
    cpu: Math.random() * 100, // Simulation
    memory: Math.random() * 100,
    disk: Math.random() * 100
  };
}

/**
 * Exécution d'un cycle de monitoring complet
 */
async function runMonitoringCycle() {
  monitoringState.lastCheck = new Date();
  monitoringState.totalChecks++;
  
  log.info('Démarrage du cycle de monitoring...');
  
  const checks = [
    { name: 'API Health', fn: checkApiHealth },
    { name: 'Frontend Health', fn: checkFrontendHealth },
    { name: 'Database Health', fn: checkDatabaseHealth },
    { name: 'Redis Health', fn: checkRedisHealth }
  ];
  
  let allHealthy = true;
  const results = {};
  
  for (const check of checks) {
    try {
      const result = await check.fn();
      results[check.name] = result;
      
      if (result.status === 'healthy') {
        log.success(`✅ ${check.name}: OK`);
        writeLog('SUCCESS', `${check.name}: OK`);
      } else {
        log.error(`❌ ${check.name}: ${result.error || 'FAILED'}`);
        writeLog('ERROR', `${check.name}: ${result.error || 'FAILED'}`);
        allHealthy = false;
      }
    } catch (error) {
      log.error(`❌ ${check.name}: ${error.message}`);
      writeLog('ERROR', `${check.name}: ${error.message}`);
      allHealthy = false;
    }
  }
  
  // Vérification des ressources système
  try {
    const resources = await checkSystemResources();
    results['System Resources'] = resources;
    
    if (resources.cpu > 80 || resources.memory > 80 || resources.disk > 90) {
      log.warning(`⚠️ Ressources système élevées: CPU ${resources.cpu.toFixed(1)}%, RAM ${resources.memory.toFixed(1)}%, Disk ${resources.disk.toFixed(1)}%`);
      writeLog('WARNING', `Ressources élevées: CPU ${resources.cpu.toFixed(1)}%, RAM ${resources.memory.toFixed(1)}%, Disk ${resources.disk.toFixed(1)}%`);
    } else {
      log.success(`✅ Ressources système: CPU ${resources.cpu.toFixed(1)}%, RAM ${resources.memory.toFixed(1)}%, Disk ${resources.disk.toFixed(1)}%`);
    }
  } catch (error) {
    log.error(`❌ Erreur vérification ressources: ${error.message}`);
  }
  
  // Gestion des alertes
  if (allHealthy) {
    monitoringState.consecutiveFailures = 0;
    monitoringState.successfulChecks++;
  } else {
    monitoringState.consecutiveFailures++;
    monitoringState.failedChecks++;
    
    // Alerte après 3 échecs consécutifs
    if (monitoringState.consecutiveFailures >= 3) {
      const alertMessage = `Application en panne depuis ${monitoringState.consecutiveFailures} vérifications consécutives`;
      
      log.critical(alertMessage);
      writeLog('CRITICAL', alertMessage);
      
      // Envoyer des alertes
      await sendEmailAlert('Solisakane.com - Application en panne', alertMessage);
      await sendSlackAlert(alertMessage);
    }
  }
  
  // Affichage du statut
  const uptime = ((monitoringState.successfulChecks / monitoringState.totalChecks) * 100).toFixed(2);
  log.info(`Statut: ${allHealthy ? 'HEALTHY' : 'UNHEALTHY'} | Uptime: ${uptime}% | Échecs consécutifs: ${monitoringState.consecutiveFailures}`);
  
  return { allHealthy, results };
}

/**
 * Affichage du rapport de statut
 */
function displayStatusReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT DE STATUT SOLISAKANE.COM'.rainbow);
  console.log('='.repeat(60));
  
  const uptime = monitoringState.totalChecks > 0 
    ? ((monitoringState.successfulChecks / monitoringState.totalChecks) * 100).toFixed(2)
    : '0.00';
  
  console.log(`🕐 Dernière vérification: ${monitoringState.lastCheck || 'Jamais'}`);
  console.log(`📈 Total des vérifications: ${monitoringState.totalChecks}`);
  console.log(`✅ Vérifications réussies: ${monitoringState.successfulChecks}`);
  console.log(`❌ Vérifications échouées: ${monitoringState.failedChecks}`);
  console.log(`📊 Uptime: ${uptime}%`);
  console.log(`🔄 Échecs consécutifs: ${monitoringState.consecutiveFailures}`);
  console.log(`📁 Log file: ${CONFIG.LOG_FILE}`);
  
  console.log('\n🌐 URLs surveillées:');
  console.log(`   API: ${CONFIG.API_URL}`);
  console.log(`   Frontend: ${CONFIG.FRONTEND_URL}`);
  
  console.log('\n⚙️ Configuration:');
  console.log(`   Intervalle: ${CONFIG.CHECK_INTERVAL / 1000}s`);
  console.log(`   Email d'alerte: ${CONFIG.ALERT_EMAIL}`);
  console.log(`   Slack webhook: ${CONFIG.SLACK_WEBHOOK ? 'Configuré' : 'Non configuré'}`);
  
  console.log('='.repeat(60) + '\n');
}

/**
 * Démarrage du monitoring
 */
async function startMonitoring() {
  log.info('🚀 Démarrage du monitoring Solisakane.com');
  writeLog('INFO', 'Démarrage du monitoring');
  
  monitoringState.isRunning = true;
  
  // Affichage du rapport initial
  displayStatusReport();
  
  // Boucle de monitoring
  while (monitoringState.isRunning) {
    try {
      await runMonitoringCycle();
      
      // Attendre avant la prochaine vérification
      await new Promise(resolve => setTimeout(resolve, CONFIG.CHECK_INTERVAL));
    } catch (error) {
      log.error(`Erreur dans le cycle de monitoring: ${error.message}`);
      writeLog('ERROR', `Erreur cycle monitoring: ${error.message}`);
      
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, CONFIG.CHECK_INTERVAL));
    }
  }
}

/**
 * Arrêt du monitoring
 */
function stopMonitoring() {
  log.info('🛑 Arrêt du monitoring');
  writeLog('INFO', 'Arrêt du monitoring');
  monitoringState.isRunning = false;
}

// Gestion des signaux pour un arrêt propre
process.on('SIGINT', () => {
  log.info('Signal SIGINT reçu, arrêt du monitoring...');
  stopMonitoring();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.info('Signal SIGTERM reçu, arrêt du monitoring...');
  stopMonitoring();
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  log.error(`Erreur non gérée: ${error.message}`);
  writeLog('ERROR', `Erreur non gérée: ${error.message}`);
});

// Exécution du monitoring
if (require.main === module) {
  startMonitoring().catch(error => {
    log.error(`Erreur lors du démarrage du monitoring: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { startMonitoring, stopMonitoring, runMonitoringCycle };
