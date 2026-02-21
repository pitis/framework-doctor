const PACKAGES = ['packages/cli', 'packages/react-doctor', 'packages/svelte-doctor'];

const buildOxlintCommands = (filenames) => {
  const commands = [];
  for (const packagePath of PACKAGES) {
    const packageFiles = filenames.filter((filename) => filename.startsWith(`${packagePath}/`));
    if (packageFiles.length > 0) {
      const fileList = packageFiles.map((file) => `"${file}"`).join(' ');
      const addList = packageFiles.map((file) => `"${file}"`).join(' ');
      commands.push(`pnpm -C ${packagePath} exec oxlint --fix ${fileList} && git add ${addList}`);
    }
  }
  return commands.length > 0 ? commands.join(' && ') : null;
};

export default {
  '*.{js,jsx,ts,tsx,svelte,json,md,yml,yaml,css,scss,html}': 'prettier --write',
  '*.{js,jsx,ts,tsx,svelte}': (filenames) => {
    const command = buildOxlintCommands(filenames);
    return command ?? 'echo "No files to lint"';
  },
};
