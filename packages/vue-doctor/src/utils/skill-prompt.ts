import { highlighter, logger, readGlobalConfig, writeGlobalConfig } from '@framework-doctor/core';
import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import prompts from 'prompts';

const HOME_DIRECTORY = homedir();

const SKILL_NAME = 'vue-doctor';
const WINDSURF_MARKER = '# Vue Doctor';

const SKILL_DESCRIPTION =
  'Run after making Vue changes to catch issues early. Use when reviewing code, finishing a feature, or fixing bugs in a Vue project.';

const SKILL_BODY = `Scans your Vue codebase for security, performance, correctness, and architecture issues. Outputs a 0-100 score with actionable diagnostics.

## Usage

\`\`\`bash
npx -y @framework-doctor/vue@latest . --verbose --diff
\`\`\`

Or use the unified CLI (auto-detects Vue):

\`\`\`bash
npx -y @framework-doctor/cli . --verbose --diff
\`\`\`

## Workflow

Run after making changes to catch issues early. Fix errors first, then re-run to verify the score improved.`;

const SKILL_CONTENT = `---
name: ${SKILL_NAME}
description: ${SKILL_DESCRIPTION}
version: 1.0.0
---

# Vue Doctor

${SKILL_BODY}
`;

const AGENTS_CONTENT = `# Vue Doctor

${SKILL_DESCRIPTION}

${SKILL_BODY}
`;

const CODEX_AGENT_CONFIG = `interface:
  display_name: "${SKILL_NAME}"
  short_description: "Diagnose and fix Vue codebase health issues"
`;

interface SkillTarget {
  name: string;
  detect: () => boolean;
  install: () => void;
}

const writeSkillFiles = (directory: string): void => {
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'SKILL.md'), SKILL_CONTENT);
  writeFileSync(join(directory, 'AGENTS.md'), AGENTS_CONTENT);
};

const isCommandAvailable = (command: string): boolean => {
  try {
    const whichCommand = process.platform === 'win32' ? 'where' : 'which';
    execSync(`${whichCommand} ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const SKILL_TARGETS: SkillTarget[] = [
  {
    name: 'Claude Code',
    detect: () => existsSync(join(HOME_DIRECTORY, '.claude')),
    install: () => writeSkillFiles(join(HOME_DIRECTORY, '.claude', 'skills', SKILL_NAME)),
  },
  {
    name: 'Amp Code',
    detect: () => existsSync(join(HOME_DIRECTORY, '.amp')),
    install: () => writeSkillFiles(join(HOME_DIRECTORY, '.config', 'amp', 'skills', SKILL_NAME)),
  },
  {
    name: 'Cursor',
    detect: () => existsSync(join(HOME_DIRECTORY, '.cursor')),
    install: () => writeSkillFiles(join(HOME_DIRECTORY, '.cursor', 'skills', SKILL_NAME)),
  },
  {
    name: 'OpenCode',
    detect: () =>
      isCommandAvailable('opencode') || existsSync(join(HOME_DIRECTORY, '.config', 'opencode')),
    install: () =>
      writeSkillFiles(join(HOME_DIRECTORY, '.config', 'opencode', 'skills', SKILL_NAME)),
  },
  {
    name: 'Windsurf',
    detect: () =>
      existsSync(join(HOME_DIRECTORY, '.codeium')) ||
      existsSync(join(HOME_DIRECTORY, 'Library', 'Application Support', 'Windsurf')),
    install: () => {
      const memoriesDirectory = join(HOME_DIRECTORY, '.codeium', 'windsurf', 'memories');
      mkdirSync(memoriesDirectory, { recursive: true });
      const rulesFile = join(memoriesDirectory, 'global_rules.md');

      if (existsSync(rulesFile)) {
        const existingContent = readFileSync(rulesFile, 'utf-8');
        if (existingContent.includes(WINDSURF_MARKER)) return;
        appendFileSync(rulesFile, `\n${WINDSURF_MARKER}\n\n${SKILL_CONTENT}`);
      } else {
        writeFileSync(rulesFile, `${WINDSURF_MARKER}\n\n${SKILL_CONTENT}`);
      }
    },
  },
  {
    name: 'Antigravity',
    detect: () =>
      isCommandAvailable('agy') || existsSync(join(HOME_DIRECTORY, '.gemini', 'antigravity')),
    install: () =>
      writeSkillFiles(join(HOME_DIRECTORY, '.gemini', 'antigravity', 'skills', SKILL_NAME)),
  },
  {
    name: 'Gemini CLI',
    detect: () => isCommandAvailable('gemini') || existsSync(join(HOME_DIRECTORY, '.gemini')),
    install: () => writeSkillFiles(join(HOME_DIRECTORY, '.gemini', 'skills', SKILL_NAME)),
  },
  {
    name: 'Codex',
    detect: () => isCommandAvailable('codex') || existsSync(join(HOME_DIRECTORY, '.codex')),
    install: () => {
      const skillDirectory = join(HOME_DIRECTORY, '.codex', 'skills', SKILL_NAME);
      writeSkillFiles(skillDirectory);
      const agentsDirectory = join(skillDirectory, 'agents');
      mkdirSync(agentsDirectory, { recursive: true });
      writeFileSync(join(agentsDirectory, 'openai.yaml'), CODEX_AGENT_CONFIG);
    },
  },
];

const installSkill = (): void => {
  let installedCount = 0;

  for (const target of SKILL_TARGETS) {
    if (!target.detect()) continue;
    try {
      target.install();
      logger.log(`  ${highlighter.success('✔')} ${target.name}`);
      installedCount++;
    } catch {
      logger.dim(`  ✗ ${target.name} (failed)`);
    }
  }

  try {
    const projectSkillDirectory = join('.agents', SKILL_NAME);
    writeSkillFiles(projectSkillDirectory);
    logger.log(`  ${highlighter.success('✔')} .agents/`);
    installedCount++;
  } catch {
    logger.dim('  ✗ .agents/ (failed)');
  }

  logger.break();
  if (installedCount === 0) {
    logger.dim('No supported tools detected.');
  } else {
    logger.success('Done! The skill will activate when working on Vue projects.');
  }
};

export const maybePromptSkillInstall = async (shouldSkipPrompts: boolean): Promise<void> => {
  const config = readGlobalConfig();
  if (config.skillPromptDismissed) return;
  if (shouldSkipPrompts) return;

  logger.break();
  logger.log(`${highlighter.info('💡')} Have your coding agent fix these issues automatically?`);
  logger.dim(
    `   Install the ${highlighter.info('vue-doctor')} skill to teach Cursor, Claude Code,`,
  );
  logger.dim('   and other AI agents how to diagnose and fix Vue issues.');
  logger.break();

  const { shouldInstall } = await prompts({
    type: 'confirm',
    name: 'shouldInstall',
    message: 'Install skill? (recommended)',
    initial: true,
  });

  if (shouldInstall) {
    logger.break();
    installSkill();
  }

  writeGlobalConfig({ ...config, skillPromptDismissed: true });
};
