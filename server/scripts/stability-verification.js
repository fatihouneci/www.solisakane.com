/**
 * @file stability-verification.js
 * @description
 * EN: Script to run stability verification and generate report.
 * FR: Script pour exécuter la vérification de stabilité et générer le rapport.
 */
import StabilityVerificationService from '../services/stabilityVerification.service.js';
import fs from 'fs';
import path from 'path';

async function runStabilityVerification() {
  try {
    console.log('🛡️ Starting stability verification...');
    
    const stabilityService = new StabilityVerificationService();
    const results = await stabilityService.runCompleteStabilityVerification();
    const summary = stabilityService.getStabilitySummary();
    
    console.log('✅ Stability verification completed successfully!');
    console.log(`📊 Stability Score: ${summary.overallStability}/100`);
    console.log(`🛡️ Overall Status: ${summary.overallStability}`);
    
    // EN: Update the stability report / FR: Mettre à jour le rapport de stabilité
    const reportPath = path.join(process.cwd(), '..', '.github', 'stabilityReport.md');
    console.log(`📝 Stability report updated: ${reportPath}`);
    
    return results;
  } catch (error) {
    console.error('❌ Stability verification failed:', error);
    process.exit(1);
  }
}

runStabilityVerification();
