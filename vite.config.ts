import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/tennis-boy-showcases-website/' : '/',
  plugins: [react()],
}));
