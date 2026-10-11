import type { CapacitorConfig } from '@capacitor/cli';

// For local testing: 'http://localhost:3000'
// For production distribution on physical phones: replace with your deployed HTTPS URL (e.g. 'https://edusync-ai.vercel.app')
const serverUrl = process.env.CAPACITOR_SERVER_URL || 'http://localhost:3000';

const config: CapacitorConfig = {
  appId: 'com.edusync.ai',
  appName: 'EduSync AI',
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://'),
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV !== 'production',
  },
};

export default config;
