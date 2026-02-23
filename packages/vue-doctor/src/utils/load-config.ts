import { loadConfig as loadConfigFromCore } from '@framework-doctor/core';
import type { VueDoctorConfig } from '../types.js';

const CONFIG_FILENAME = 'vue-doctor.config.json';
const PACKAGE_JSON_CONFIG_KEY = 'vueDoctor';

export const loadConfig = (rootDirectory: string): VueDoctorConfig | null =>
  loadConfigFromCore<VueDoctorConfig>(rootDirectory, CONFIG_FILENAME, PACKAGE_JSON_CONFIG_KEY);
