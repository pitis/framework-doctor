export interface FrameworkSecurityProfile {
  plugin: string;
  envLeakPrefixes: string[];
  configFilenames: string[];
  configPathsForHeaders: string[];
  middlewarePaths: string[];
  apiRoutePathPatterns: RegExp[];
  publicConfigPathPatterns: RegExp[];
}

const NEXTJS_PROFILE: FrameworkSecurityProfile = {
  plugin: 'react-doctor',
  envLeakPrefixes: ['NEXT_PUBLIC_'],
  configFilenames: ['next.config.js', 'next.config.mjs', 'next.config.ts', 'next.config.cjs'],
  configPathsForHeaders: ['next.config.js', 'next.config.mjs', 'next.config.ts', 'next.config.cjs'],
  middlewarePaths: ['middleware.ts', 'src/middleware.ts'],
  apiRoutePathPatterns: [
    /^app\/.*\/route\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^src\/app\/.*\/route\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^pages\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^src\/pages\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
  ],
  publicConfigPathPatterns: [],
};

const SVELTEKIT_PROFILE: FrameworkSecurityProfile = {
  plugin: 'svelte-doctor',
  envLeakPrefixes: ['PUBLIC_'],
  configFilenames: ['svelte.config.js', 'svelte.config.ts'],
  configPathsForHeaders: ['svelte.config.js', 'svelte.config.ts', 'src/hooks.server.ts'],
  middlewarePaths: ['hooks.server.ts', 'src/hooks.server.ts'],
  apiRoutePathPatterns: [/^src\/routes\/.*\/\+server\.(?:ts|js|mts|cts|mjs|cjs)$/],
  publicConfigPathPatterns: [],
};

const VITE_PROFILE: FrameworkSecurityProfile = {
  plugin: 'react-doctor',
  envLeakPrefixes: ['VITE_', 'REACT_APP_'],
  configFilenames: ['vite.config.js', 'vite.config.ts', 'vite.config.mjs', 'vite.config.cjs'],
  configPathsForHeaders: ['vite.config.js', 'vite.config.ts', 'vite.config.mjs', 'vite.config.cjs'],
  middlewarePaths: [],
  apiRoutePathPatterns: [
    /^api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^server\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^src\/server\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^functions\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
  ],
  publicConfigPathPatterns: [],
};

const VUE_VITE_PROFILE: FrameworkSecurityProfile = {
  plugin: 'vue-doctor',
  envLeakPrefixes: ['VITE_'],
  configFilenames: ['vite.config.js', 'vite.config.ts', 'vite.config.mjs', 'vite.config.cjs'],
  configPathsForHeaders: ['vite.config.js', 'vite.config.ts', 'vite.config.mjs', 'vite.config.cjs'],
  middlewarePaths: [],
  apiRoutePathPatterns: [
    /^api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^server\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^src\/server\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^functions\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
  ],
  publicConfigPathPatterns: [],
};

const NUXT_PROFILE: FrameworkSecurityProfile = {
  plugin: 'vue-doctor',
  envLeakPrefixes: ['NUXT_PUBLIC_'],
  configFilenames: ['nuxt.config.ts', 'nuxt.config.js'],
  configPathsForHeaders: ['nuxt.config.ts', 'nuxt.config.js'],
  middlewarePaths: ['middleware', 'server/middleware'],
  apiRoutePathPatterns: [/^server\/api\/.*\.(?:ts|js|mts|cts|mjs|cjs)$/],
  publicConfigPathPatterns: [],
};

const SVELTE_PLAIN_PROFILE: FrameworkSecurityProfile = {
  plugin: 'svelte-doctor',
  envLeakPrefixes: ['PUBLIC_', 'VITE_'],
  configFilenames: ['svelte.config.js', 'svelte.config.ts', 'vite.config.js', 'vite.config.ts'],
  configPathsForHeaders: [
    'svelte.config.js',
    'svelte.config.ts',
    'vite.config.js',
    'vite.config.ts',
  ],
  middlewarePaths: [],
  apiRoutePathPatterns: [
    /^api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^server\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^src\/server\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^functions\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
  ],
  publicConfigPathPatterns: [],
};

const ANGULAR_PROFILE: FrameworkSecurityProfile = {
  plugin: 'angular-doctor',
  envLeakPrefixes: ['NG_APP_'],
  configFilenames: ['angular.json'],
  configPathsForHeaders: ['angular.json', 'src/index.html'],
  middlewarePaths: [],
  apiRoutePathPatterns: [
    /^api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^server\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^src\/server\/api\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
    /^functions\/.*\.(?:ts|tsx|js|jsx|mts|cts|mjs|cjs)$/,
  ],
  publicConfigPathPatterns: [/^src\/environments\/environment(?:\.[\w-]+)?\.ts$/],
};

const PROFILE_MAP: Record<string, FrameworkSecurityProfile> = {
  nextjs: NEXTJS_PROFILE,
  sveltekit: SVELTEKIT_PROFILE,
  svelte: SVELTE_PLAIN_PROFILE,
  vite: VITE_PROFILE,
  vue: VUE_VITE_PROFILE,
  nuxt: NUXT_PROFILE,
  angular: ANGULAR_PROFILE,
};

export const getFrameworkProfile = (
  plugin: string,
  framework: string,
): FrameworkSecurityProfile | null => {
  const profile = PROFILE_MAP[framework];
  if (!profile || profile.plugin !== plugin) return null;
  return profile;
};
