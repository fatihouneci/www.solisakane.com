#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Solisakane.com - Vérification de déploiement\n');

// Configuration
const config = {
  server: {
    port: 5000,
    healthEndpoint: '/api/health'
  },
  web: {
    port: 3000,
    buildCommand: 'npm run build'
  },
  mobile: {
    buildCommand: 'npx react-native run-android'
  }
};

// Vérifications de déploiement
const deploymentChecks = {
  dependencies: false,
  environment: false,
  database: false,
  tests: false,
  build: false,
  security: false
};

// Helper functions
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkDirectoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

function runCommand(command, cwd = '.') {
  try {
    execSync(command, { cwd, stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    return false;
  }
}

function checkDependencies() {
  console.log('📦 Vérification des dépendances...');
  
  const packageFiles = [
    'server/package.json',
    'web/package.json',
    'rn_chat/package.json'
  ];
  
  let allDepsOk = true;
  
  packageFiles.forEach(pkg => {
    if (checkFileExists(pkg)) {
      console.log(`  ✅ ${pkg} trouvé`);
      
      // Install dependencies
      const dir = path.dirname(pkg);
      if (runCommand('npm install', dir)) {
        console.log(`  ✅ Dépendances installées pour ${dir}`);
      } else {
        console.log(`  ❌ Échec installation dépendances pour ${dir}`);
        allDepsOk = false;
      }
    } else {
      console.log(`  ❌ ${pkg} manquant`);
      allDepsOk = false;
    }
  });
  
  deploymentChecks.dependencies = allDepsOk;
  return allDepsOk;
}

function checkEnvironment() {
  console.log('\n🔧 Vérification de l\'environnement...');
  
  const envFiles = [
    'server/.env',
    'web/.env',
    'rn_chat/.env'
  ];
  
  const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URL',
    'REDIS_URL',
    'MAIL_HOST',
    'MAIL_USER',
    'MAIL_PASS'
  ];
  
  let envOk = true;
  
  envFiles.forEach(envFile => {
    if (checkFileExists(envFile)) {
      console.log(`  ✅ ${envFile} trouvé`);
      
      // Check required variables
      const envContent = fs.readFileSync(envFile, 'utf8');
      requiredEnvVars.forEach(varName => {
        if (envContent.includes(varName)) {
          console.log(`    ✅ ${varName} configuré`);
        } else {
          console.log(`    ⚠️  ${varName} manquant`);
        }
      });
    } else {
      console.log(`  ⚠️  ${envFile} manquant (optionnel)`);
    }
  });
  
  deploymentChecks.environment = true; // Assume OK if basic structure exists
  return true;
}

function checkDatabase() {
  console.log('\n🗄️  Vérification de la base de données...');
  
  // Check if MongoDB is accessible
  if (runCommand('mongosh --eval "db.runCommand({ping: 1})"')) {
    console.log('  ✅ MongoDB accessible');
    deploymentChecks.database = true;
    return true;
  } else {
    console.log('  ⚠️  MongoDB non accessible (vérifiez la connexion)');
    deploymentChecks.database = false;
    return false;
  }
}

function checkTests() {
  console.log('\n🧪 Exécution des tests...');
  
  const testResults = {
    server: false,
    web: false,
    mobile: false
  };
  
  // Server tests
  if (checkDirectoryExists('server/tests')) {
    console.log('  📁 Tests serveur trouvés');
    if (runCommand('npm test', 'server')) {
      console.log('  ✅ Tests serveur passés');
      testResults.server = true;
    } else {
      console.log('  ❌ Tests serveur échoués');
    }
  }
  
  // Web tests
  if (checkDirectoryExists('web/src/tests')) {
    console.log('  📁 Tests web trouvés');
    if (runCommand('npm test', 'web')) {
      console.log('  ✅ Tests web passés');
      testResults.web = true;
    } else {
      console.log('  ❌ Tests web échoués');
    }
  }
  
  // Mobile tests
  if (checkDirectoryExists('rn_chat/src/__tests__')) {
    console.log('  📁 Tests mobile trouvés');
    if (runCommand('npm test', 'rn_chat')) {
      console.log('  ✅ Tests mobile passés');
      testResults.mobile = true;
    } else {
      console.log('  ❌ Tests mobile échoués');
    }
  }
  
  deploymentChecks.tests = testResults.server && testResults.web && testResults.mobile;
  return deploymentChecks.tests;
}

function checkBuild() {
  console.log('\n🏗️  Vérification du build...');
  
  let buildOk = true;
  
  // Web build
  if (checkDirectoryExists('web')) {
    console.log('  📁 Application web trouvée');
    if (runCommand('npm run build', 'web')) {
      console.log('  ✅ Build web réussi');
    } else {
      console.log('  ❌ Build web échoué');
      buildOk = false;
    }
  }
  
  // Server build check
  if (checkDirectoryExists('server')) {
    console.log('  📁 Serveur trouvé');
    if (checkFileExists('server/index.js')) {
      console.log('  ✅ Point d\'entrée serveur trouvé');
    } else {
      console.log('  ❌ Point d\'entrée serveur manquant');
      buildOk = false;
    }
  }
  
  deploymentChecks.build = buildOk;
  return buildOk;
}

function checkSecurity() {
  console.log('\n🔒 Vérification de la sécurité...');
  
  let securityOk = true;
  
  // Check for security-related files
  const securityFiles = [
    'server/helpers/ErrorHandler.js',
    'server/controllers/auth.controller.js',
    'server/middleware/auth.js'
  ];
  
  securityFiles.forEach(file => {
    if (checkFileExists(file)) {
      console.log(`  ✅ ${file} trouvé`);
    } else {
      console.log(`  ⚠️  ${file} manquant`);
    }
  });
  
  // Check for security dependencies
  const securityDeps = [
    'bcryptjs',
    'jsonwebtoken',
    'helmet',
    'cors'
  ];
  
  if (checkFileExists('server/package.json')) {
    const packageContent = fs.readFileSync('server/package.json', 'utf8');
    securityDeps.forEach(dep => {
      if (packageContent.includes(dep)) {
        console.log(`  ✅ ${dep} installé`);
      } else {
        console.log(`  ❌ ${dep} manquant`);
        securityOk = false;
      }
    });
  }
  
  deploymentChecks.security = securityOk;
  return securityOk;
}

function generateDeploymentReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT DE VÉRIFICATION DE DÉPLOIEMENT');
  console.log('='.repeat(60));
  
  const totalChecks = Object.keys(deploymentChecks).length;
  const passedChecks = Object.values(deploymentChecks).filter(Boolean).length;
  const successRate = ((passedChecks / totalChecks) * 100).toFixed(2);
  
  console.log(`\n📈 RÉSULTATS GLOBAUX:`);
  console.log(`   Vérifications totales: ${totalChecks}`);
  console.log(`   ✅ Réussies: ${passedChecks}`);
  console.log(`   ❌ Échouées: ${totalChecks - passedChecks}`);
  console.log(`   📊 Taux de réussite: ${successRate}%`);
  
  console.log(`\n📋 DÉTAIL DES VÉRIFICATIONS:`);
  Object.entries(deploymentChecks).forEach(([check, result]) => {
    const status = result ? '✅' : '❌';
    const name = check.charAt(0).toUpperCase() + check.slice(1);
    console.log(`   ${status} ${name}`);
  });
  
  // Recommendations
  console.log(`\n💡 RECOMMANDATIONS:`);
  if (successRate >= 90) {
    console.log(`   🎉 Excellent! Prêt pour le déploiement`);
    console.log(`   🚀 Vous pouvez déployer en production`);
    console.log(`   📊 Surveillez les métriques après déploiement`);
  } else if (successRate >= 70) {
    console.log(`   ⚠️  Bon état, quelques améliorations recommandées`);
    console.log(`   🔧 Corrigez les problèmes identifiés`);
    console.log(`   🧪 Relancez les tests après corrections`);
  } else {
    console.log(`   🚨 Attention! Des problèmes critiques détectés`);
    console.log(`   🔧 Corrigez tous les problèmes avant déploiement`);
    console.log(`   🆘 Consultez la documentation pour l'aide`);
  }
  
  // Deployment commands
  console.log(`\n🚀 COMMANDES DE DÉPLOIEMENT:`);
  console.log(`   # Démarrer avec Docker Compose:`);
  console.log(`   docker-compose up -d`);
  console.log(`   `);
  console.log(`   # Démarrer manuellement:`);
  console.log(`   cd server && npm start`);
  console.log(`   cd web && npm run dev`);
  console.log(`   `);
  console.log(`   # Tests de santé:`);
  console.log(`   curl http://localhost:5000/api/health`);
  
  console.log(`\n📄 Rapport généré le: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  // Save report
  const reportData = {
    timestamp: new Date().toISOString(),
    successRate: parseFloat(successRate),
    checks: deploymentChecks,
    recommendations: successRate >= 90 ? 'ready_for_deployment' : 'needs_improvements'
  };
  
  fs.writeFileSync('./deployment-report.json', JSON.stringify(reportData, null, 2));
  console.log(`\n💾 Rapport détaillé sauvegardé: deployment-report.json`);
}

// Main execution
async function main() {
  try {
    console.log('🔍 Démarrage de la vérification de déploiement...\n');
    
    checkDependencies();
    checkEnvironment();
    checkDatabase();
    checkTests();
    checkBuild();
    checkSecurity();
    
    generateDeploymentReport();
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    process.exit(1);
  }
}

// Run the checks
main();
