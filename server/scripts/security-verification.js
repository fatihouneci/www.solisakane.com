/**
 * @file security-verification.js
 * @description
 * EN: Script to run security verification and generate report.
 * FR: Script pour exécuter la vérification de sécurité et générer le rapport.
 */
import SecurityVerificationService from '../services/securityVerification.service.js';
import fs from 'fs';
import path from 'path';

async function runSecurityVerification() {
  try {
    console.log('🔐 Starting security verification...');
    
    const securityService = new SecurityVerificationService();
    const results = await securityService.runCompleteSecurityVerification();
    const summary = securityService.getSecuritySummary();
    
    console.log('✅ Security verification completed successfully!');
    console.log(`📊 Security Score: ${summary.overallScore}/100`);
    console.log(`🛡️ Overall Status: ${summary.overallStatus}`);
    
    // EN: Update the security report / FR: Mettre à jour le rapport de sécurité
    const reportPath = path.join(process.cwd(), '..', '.github', 'securityReport.md');
    console.log(`📝 Security report updated: ${reportPath}`);
    
    return results;
  } catch (error) {
    console.error('❌ Security verification failed:', error);
    process.exit(1);
  }
}

runSecurityVerification();
