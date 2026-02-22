import { loadConfig as loadConfigFromCore } from '@framework-doctor/core';
import type { SvelteDoctorConfig } from '../types.js';

const CONFIG_FILENAME = 'svelte-doctor.config.json';
const PACKAGE_JSON_CONFIG_KEY = 'svelteDoctor';

export const loadConfig = (rootDirectory: string): SvelteDoctorConfig | null =>
  loadConfigFromCore<SvelteDoctorConfig>(rootDirectory, CONFIG_FILENAME, PACKAGE_JSON_CONFIG_KEY);
