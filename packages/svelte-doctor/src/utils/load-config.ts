import { loadConfigWithUnified } from '@framework-doctor/core';
import type { SvelteDoctorConfig } from '../types.js';

const CONFIG_FILENAME = 'svelte-doctor.config.json';
const PACKAGE_JSON_CONFIG_KEY = 'svelteDoctor';
const UNIFIED_FRAMEWORK_KEY = 'svelteDoctor';

export const loadConfig = (rootDirectory: string): SvelteDoctorConfig | null =>
  loadConfigWithUnified<SvelteDoctorConfig>(
    rootDirectory,
    CONFIG_FILENAME,
    PACKAGE_JSON_CONFIG_KEY,
    UNIFIED_FRAMEWORK_KEY,
  );
