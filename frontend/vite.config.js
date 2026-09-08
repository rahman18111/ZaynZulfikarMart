import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export const config = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true // Listen on 0.0.0.0 for mobile network testing
  }
});

export default config;
