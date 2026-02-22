export const ANALYTICS_OPTION_FLAGS = '--no-analytics';
export const ANALYTICS_OPTION_DESCRIPTION = 'disable anonymous analytics';

export const ANALYTICS_CONFIG_KEY = 'analytics';

interface ProgramWithOption {
  option(flags: string, description: string): unknown;
}

export const addAnalyticsOption = (program: ProgramWithOption): void => {
  program.option(ANALYTICS_OPTION_FLAGS, ANALYTICS_OPTION_DESCRIPTION);
};
