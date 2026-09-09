import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iron.muscletracker',
  appName: 'IronMuscle',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Haptics: {
      enabled: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B0C10'
    }
  }
};

export default config;
