import { loadConfig as loadConfigFromCore } from '@framework-doctor/core';
import type { ReactDoctorConfig } from '../types.js';

const CONFIG_FILENAME = 'react-doctor.config.json';
const PACKAGE_JSON_CONFIG_KEY = 'reactDoctor';

export const loadConfig = (rootDirectory: string): ReactDoctorConfig | null =>
  loadConfigFromCore<ReactDoctorConfig>(rootDirectory, CONFIG_FILENAME, PACKAGE_JSON_CONFIG_KEY);
