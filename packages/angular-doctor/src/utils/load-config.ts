import { loadConfig as loadConfigFromCore } from '@framework-doctor/core';
import type { AngularDoctorConfig } from '../types.js';

const CONFIG_FILENAME = 'angular-doctor.config.json';
const PACKAGE_JSON_CONFIG_KEY = 'angularDoctor';

export const loadConfig = (rootDirectory: string): AngularDoctorConfig | null =>
  loadConfigFromCore<AngularDoctorConfig>(rootDirectory, CONFIG_FILENAME, PACKAGE_JSON_CONFIG_KEY);
