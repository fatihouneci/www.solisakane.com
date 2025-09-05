/**
 * @file database-verification.js
 * @description
 * EN: Script to run database verification and generate report.
 * FR: Script pour exécuter la vérification de base de données et générer le rapport.
 */
import DatabaseVerificationService from '../services/databaseVerification.service.js';
import fs from 'fs';
import path from 'path';

async function runDatabaseVerification() {
  try {
    console.log('🗄️ Starting database verification...');
    
    const databaseService = new DatabaseVerificationService();
    const results = await databaseService.runCompleteVerification();
    const summary = databaseService.getVerificationSummary();
    
    console.log('✅ Database verification completed successfully!');
    console.log(`📊 Database Health Score: ${summary.overallHealth}/100`);
    console.log(`🗄️ Overall Status: ${summary.overallStatus}`);
    
    // EN: Update the database report / FR: Mettre à jour le rapport de base de données
    const reportPath = path.join(process.cwd(), '..', '.github', 'databaseReport.md');
    console.log(`📝 Database report updated: ${reportPath}`);
    
    return results;
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

runDatabaseVerification();
