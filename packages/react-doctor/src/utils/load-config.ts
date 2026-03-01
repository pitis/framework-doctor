import { loadConfigWithUnified } from '@framework-doctor/core';
import type { ReactDoctorConfig } from '../types.js';

const CONFIG_FILENAME = 'react-doctor.config.json';
const PACKAGE_JSON_CONFIG_KEY = 'reactDoctor';
const UNIFIED_FRAMEWORK_KEY = 'reactDoctor';

export const loadConfig = (rootDirectory: string): ReactDoctorConfig | null =>
  loadConfigWithUnified<ReactDoctorConfig>(
    rootDirectory,
    CONFIG_FILENAME,
    PACKAGE_JSON_CONFIG_KEY,
    UNIFIED_FRAMEWORK_KEY,
  );
