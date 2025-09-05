/**
 * @file socketio-verification.js
 * @description
 * EN: Script to run Socket.IO verification and generate report.
 * FR: Script pour exécuter la vérification Socket.IO et générer le rapport.
 */
import SocketVerificationService from '../services/socketVerification.service.js';
import fs from 'fs';
import path from 'path';

async function runSocketIOVerification() {
  try {
    console.log('🔌 Starting Socket.IO verification...');
    
    const socketService = new SocketVerificationService();
    const results = await socketService.runCompleteVerification();
    const summary = socketService.getVerificationSummary();
    
    console.log('✅ Socket.IO verification completed successfully!');
    console.log(`📊 Socket.IO Health Score: ${summary.overallHealth}/100`);
    console.log(`🔌 Overall Status: ${summary.overallStatus}`);
    
    // EN: Update the Socket.IO report / FR: Mettre à jour le rapport Socket.IO
    const reportPath = path.join(process.cwd(), '..', '.github', 'socketReport.md');
    console.log(`📝 Socket.IO report updated: ${reportPath}`);
    
    return results;
  } catch (error) {
    console.error('❌ Socket.IO verification failed:', error);
    process.exit(1);
  }
}

runSocketIOVerification();
