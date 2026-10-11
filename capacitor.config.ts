import type { CapacitorConfig } from '@capacitor/cli';

// Production HTTPS backend deployed on Vercel with Neon PostgreSQL
const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://edusync-ai-dun.vercel.app';

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
    webContentsDebuggingEnabled: false,
  },
};

export default config;
