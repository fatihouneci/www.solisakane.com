#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de Solisakane.com...\n');

// Configuration des services
const services = {
  server: {
    name: 'Backend API',
    command: 'npm',
    args: ['start'],
    cwd: './server',
    port: 5000,
    color: '\x1b[36m' // Cyan
  },
  web: {
    name: 'Frontend Web',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: './web',
    port: 3000,
    color: '\x1b[32m' // Green
  }
};

// Stockage des processus
const processes = {};

// Fonction pour colorer les logs
function colorLog(color, service, message) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${color}[${timestamp}] ${service}: ${message}\x1b[0m`);
}

// Fonction pour démarrer un service
function startService(serviceName, config) {
  return new Promise((resolve, reject) => {
    colorLog(config.color, config.name, 'Démarrage...');
    
    const process = spawn(config.command, config.args, {
      cwd: config.cwd,
      stdio: 'pipe',
      shell: true
    });

    // Gestion des logs
    process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        colorLog(config.color, config.name, line);
      });
    });

    process.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        colorLog('\x1b[31m', config.name, `ERROR: ${line}`);
      });
    });

    process.on('close', (code) => {
      if (code !== 0) {
        colorLog('\x1b[31m', config.name, `Processus terminé avec le code ${code}`);
        reject(new Error(`Service ${serviceName} s'est arrêté avec le code ${code}`));
      } else {
        colorLog(config.color, config.name, 'Processus terminé normalement');
        resolve();
      }
    });

    process.on('error', (error) => {
      colorLog('\x1b[31m', config.name, `Erreur: ${error.message}`);
      reject(error);
    });

    // Attendre que le service soit prêt
    setTimeout(() => {
      colorLog(config.color, config.name, '✅ Service démarré avec succès');
      resolve(process);
    }, 3000);

    processes[serviceName] = process;
  });
}

// Fonction pour vérifier la santé des services
async function checkHealth() {
  const axios = require('axios');
  
  console.log('\n🔍 Vérification de la santé des services...\n');
  
  // Vérifier le serveur
  try {
    const serverResponse = await axios.get('http://localhost:5000/api/health', {
      timeout: 5000
    });
    console.log('✅ Serveur API: Opérationnel');
  } catch (error) {
    console.log('❌ Serveur API: Non accessible');
  }
  
  // Vérifier le frontend web
  try {
    const webResponse = await axios.get('http://localhost:3000', {
      timeout: 5000
    });
    console.log('✅ Frontend Web: Opérationnel');
  } catch (error) {
    console.log('❌ Frontend Web: Non accessible');
  }
}

// Fonction pour arrêter tous les services
function stopAllServices() {
  console.log('\n🛑 Arrêt de tous les services...\n');
  
  Object.entries(processes).forEach(([name, process]) => {
    if (process && !process.killed) {
      colorLog('\x1b[33m', name, 'Arrêt en cours...');
      process.kill('SIGTERM');
    }
  });
  
  setTimeout(() => {
    console.log('✅ Tous les services ont été arrêtés');
    process.exit(0);
  }, 2000);
}

// Gestion des signaux d'arrêt
process.on('SIGINT', stopAllServices);
process.on('SIGTERM', stopAllServices);

// Fonction principale
async function main() {
  try {
    console.log('📋 Services à démarrer:');
    Object.entries(services).forEach(([name, config]) => {
      console.log(`   - ${config.name} (${config.cwd})`);
    });
    console.log('');

    // Démarrer les services
    const startPromises = Object.entries(services).map(([name, config]) => 
      startService(name, config)
    );

    await Promise.all(startPromises);

    console.log('\n🎉 Tous les services sont démarrés!');
    console.log('\n📱 Accès aux applications:');
    console.log('   🌐 Frontend Web: http://localhost:3000');
    console.log('   🔧 API Backend: http://localhost:5000');
    console.log('   📊 Documentation API: http://localhost:5000/api-docs');
    
    console.log('\n💡 Commandes utiles:');
    console.log('   - Ctrl+C pour arrêter tous les services');
    console.log('   - npm run test pour lancer les tests');
    console.log('   - npm run deploy-check pour vérifier le déploiement');

    // Vérifier la santé après 10 secondes
    setTimeout(checkHealth, 10000);

  } catch (error) {
    console.error('\n❌ Erreur lors du démarrage:', error.message);
    stopAllServices();
  }
}

// Vérifier les prérequis
function checkPrerequisites() {
  console.log('🔍 Vérification des prérequis...\n');
  
  const requiredDirs = ['server', 'web'];
  const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));
  
  if (missingDirs.length > 0) {
    console.error(`❌ Répertoires manquants: ${missingDirs.join(', ')}`);
    process.exit(1);
  }
  
  const requiredFiles = [
    'server/package.json',
    'web/package.json',
    'server/index.js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error(`❌ Fichiers manquants: ${missingFiles.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ Tous les prérequis sont satisfaits\n');
}

// Démarrer l'application
checkPrerequisites();
main();
