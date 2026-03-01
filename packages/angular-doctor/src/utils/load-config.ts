import { loadConfigWithUnified } from '@framework-doctor/core';
import type { AngularDoctorConfig } from '../types.js';

const CONFIG_FILENAME = 'angular-doctor.config.json';
const PACKAGE_JSON_CONFIG_KEY = 'angularDoctor';
const UNIFIED_FRAMEWORK_KEY = 'angularDoctor';

export const loadConfig = (rootDirectory: string): AngularDoctorConfig | null =>
  loadConfigWithUnified<AngularDoctorConfig>(
    rootDirectory,
    CONFIG_FILENAME,
    PACKAGE_JSON_CONFIG_KEY,
    UNIFIED_FRAMEWORK_KEY,
  );
