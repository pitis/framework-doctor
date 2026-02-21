import pc from 'picocolors';

export const highlighter = {
  error: (text: string) => pc.red(text),
  warn: (text: string) => pc.yellow(text),
  success: (text: string) => pc.green(text),
  info: (text: string) => pc.cyan(text),
  dim: (text: string) => pc.dim(text),
};
