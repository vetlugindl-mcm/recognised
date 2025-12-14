import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Setting the third parameter to '' loads all env vars regardless of the `VITE_` prefix.
  // Cast process to any to avoid type errors if @types/node is missing or conflicting
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Vital: This replaces process.env.API_KEY in your code with the actual string value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});