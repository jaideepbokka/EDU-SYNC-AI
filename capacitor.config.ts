import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.edusync.ai',
  appName: 'EduSync AI',
  webDir: 'public',
  server: {
    url: 'https://edusync-ai-dun.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
