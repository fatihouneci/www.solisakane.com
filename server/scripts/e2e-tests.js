/**
 * @file e2e-tests.js
 * @description
 * EN: Script to run E2E tests and generate report.
 * FR: Script pour exécuter les tests E2E et générer le rapport.
 */
import E2ETestService from '../services/e2eTest.service.js';
import fs from 'fs';
import path from 'path';

async function runE2ETests() {
  try {
    console.log('🧪 Starting E2E tests...');
    
    const e2eService = new E2ETestService();
    const results = await e2eService.runCompleteE2ETests();
    const summary = e2eService.getTestSummary();
    
    console.log('✅ E2E tests completed successfully!');
    console.log(`📊 E2E Health Score: ${summary.overallHealth}/100`);
    console.log(`🧪 Overall Status: ${summary.overallStatus}`);
    
    // EN: Update the E2E test report / FR: Mettre à jour le rapport des tests E2E
    const reportPath = path.join(process.cwd(), '..', '.github', 'e2eTestReport.md');
    console.log(`📝 E2E test report updated: ${reportPath}`);
    
    return results;
  } catch (error) {
    console.error('❌ E2E tests failed:', error);
    process.exit(1);
  }
}

runE2ETests();
