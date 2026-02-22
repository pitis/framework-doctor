import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { index: './src/index.ts' },
  dts: true,
  target: 'node18',
  platform: 'node',
  fixedExtension: false,
});
