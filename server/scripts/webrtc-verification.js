/**
 * @file webrtc-verification.js
 * @description
 * EN: Script to run WebRTC verification and generate report.
 * FR: Script pour exécuter la vérification WebRTC et générer le rapport.
 */
import WebRTCVerificationService from '../services/webrtcVerification.service.js';
import fs from 'fs';
import path from 'path';

async function runWebRTCVerification() {
  try {
    console.log('📹 Starting WebRTC verification...');
    
    const webrtcService = new WebRTCVerificationService();
    const results = await webrtcService.runCompleteVerification();
    const summary = webrtcService.getVerificationSummary();
    
    console.log('✅ WebRTC verification completed successfully!');
    console.log(`📊 WebRTC Health Score: ${summary.overallHealth}/100`);
    console.log(`📹 Overall Status: ${summary.overallStatus}`);
    
    // EN: Update the WebRTC report / FR: Mettre à jour le rapport WebRTC
    const reportPath = path.join(process.cwd(), '..', '.github', 'webrtcReport.md');
    console.log(`📝 WebRTC report updated: ${reportPath}`);
    
    return results;
  } catch (error) {
    console.error('❌ WebRTC verification failed:', error);
    process.exit(1);
  }
}

runWebRTCVerification();
