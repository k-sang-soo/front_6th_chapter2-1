import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const base = process.env.NODE_ENV === 'production' ? '/front_6th_chapter1-3/' : '';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.js',
  },
});
