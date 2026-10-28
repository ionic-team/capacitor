import { existsSync, readFileSync, writeFileSync } from 'fs-extra';
import { join } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';
import { readdirp } from '../util/fs';

interface Language {
  imports: string[];
  enableCall: string;
  onCreate: string;
}

const JAVA: Language = {
  imports: ['import android.os.Bundle;', 'import androidx.activity.EdgeToEdge;'],
  enableCall: 'EdgeToEdge.enable(this);',
  onCreate: `
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
    }
`,
};

const KOTLIN: Language = {
  imports: ['import android.os.Bundle', 'import androidx.activity.enableEdgeToEdge'],
  enableCall: 'enableEdgeToEdge()',
  onCreate: `
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
    }
`,
};

export async function migrateToEdgeToEdge(config: Config): Promise<void> {
  if (config.app.extConfig.plugins?.SystemBars?.insetsHandling === 'disable') {
    logger.info(`Edge-to-edge migration: SystemBars insetsHandling is 'disable', skipping.`);
    return;
  }

  const activities = await findBridgeActivities(config);

  if (activities.length === 0) {
    logger.warn(
      `Edge-to-edge migration: no Activity extending BridgeActivity found. ${manualInstructions(JAVA.enableCall)}`,
    );
    return;
  }

  if (activities.length > 1) {
    logger.warn(
      `Edge-to-edge migration: found more than one Activity extending BridgeActivity (${activities.join(', ')}), ` +
        `skipping. ${manualInstructions(JAVA.enableCall)}`,
    );
    return;
  }

  const path = activities[0];
  const language = path.endsWith('.kt') ? KOTLIN : JAVA;
  const source = readFileSync(path, 'utf-8');

  if (hasEdgeToEdgeEnabled(source)) {
    logger.info('Edge-to-edge migration: Activity already enables edge-to-edge, skipping.');
    return;
  }

  const patched = patchActivitySource(source, language);

  if (!patched) {
    logger.warn(`Edge-to-edge migration: could not patch ${path}. ${manualInstructions(language.enableCall)}`);
    return;
  }

  writeFileSync(path, patched, 'utf-8');
}

function manualInstructions(enableCall: string): string {
  return (
    `Add ${enableCall} to the onCreate of the Activity hosting Capacitor. ` +
    `Without it the 'native' insetsHandling default of the SystemBars plugin cannot apply safe area insets.`
  );
}

async function findBridgeActivities(config: Config): Promise<string[]> {
  const javaDir = join(config.android.srcMainDirAbs, 'java');

  if (!existsSync(javaDir)) {
    return [];
  }

  const sources = await readdirp(javaDir, {
    filter: (entry) => !entry.stats.isDirectory() && (entry.path.endsWith('.java') || entry.path.endsWith('.kt')),
  });

  return sources.filter((path) => readFileSync(path, 'utf-8').includes('BridgeActivity'));
}

function hasEdgeToEdgeEnabled(source: string): boolean {
  return source.includes('EdgeToEdge.enable(') || source.includes('enableEdgeToEdge(');
}

function patchActivitySource(source: string, language: Language): string | undefined {
  const patched = insertEnableCall(source, language) ?? insertOnCreate(source, language);

  if (!patched) {
    return undefined;
  }

  return addImports(patched, language.imports);
}

function insertEnableCall(source: string, language: Language): string | undefined {
  const lines = source.split('\n');
  const superCall = lines.findIndex((line) => line.includes('super.onCreate('));

  if (superCall === -1) {
    return undefined;
  }

  const indentation = lines[superCall].match(/^\s*/)?.[0] ?? '';
  lines.splice(superCall + 1, 0, `${indentation}${language.enableCall}`);

  return lines.join('\n');
}

function insertOnCreate(source: string, language: Language): string | undefined {
  const classDeclaration = source.search(/\bclass\s+\w+/);

  if (classDeclaration === -1) {
    return undefined;
  }

  const bodyStart = source.indexOf('{', classDeclaration);

  if (bodyStart === -1) {
    return undefined;
  }

  const bodyEnd = findMatchingBrace(source, bodyStart);

  if (bodyEnd === -1) {
    return undefined;
  }

  const body = source.slice(0, bodyEnd).replace(/\s*$/, '\n');

  return body + language.onCreate + source.slice(bodyEnd);
}

function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0;

  for (let i = openIndex; i < source.length; i++) {
    if (source[i] === '{') {
      depth++;
    } else if (source[i] === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

function addImports(source: string, statements: string[]): string {
  const lines = source.split('\n');

  for (const statement of statements) {
    if (!lines.includes(statement)) {
      lines.splice(importInsertIndex(lines, statement), 0, statement);
    }
  }

  return lines.join('\n');
}

function importInsertIndex(lines: string[], statement: string): number {
  const sortsAfter = lines.findIndex((line) => line.startsWith('import ') && line > statement);

  if (sortsAfter !== -1) {
    return sortsAfter;
  }

  let lastImport = -1;
  lines.forEach((line, index) => {
    if (line.startsWith('import ')) {
      lastImport = index;
    }
  });

  if (lastImport !== -1) {
    return lastImport + 1;
  }

  return lines.findIndex((line) => line.startsWith('package ')) + 1;
}

export const __testables = {
  JAVA,
  KOTLIN,
  addImports,
  hasEdgeToEdgeEnabled,
  patchActivitySource,
};
