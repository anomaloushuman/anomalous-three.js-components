import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    plugins: [
      react(),
      ...(isBuild
        ? [
            dts({
              include: ['src/index.ts', 'src/components/**/*'],
              exclude: ['src/demo/**/*'],
              rollupTypes: true,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: isBuild
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'AnomalousThreeJsComponents',
            formats: ['es'],
            fileName: 'index',
          },
          rollupOptions: {
            external: [
              'react',
              'react-dom',
              'react/jsx-runtime',
              'three',
              '@react-three/fiber',
              '@react-three/drei',
              '@react-three/postprocessing',
            ],
          },
        }
      : undefined,
  };
});
