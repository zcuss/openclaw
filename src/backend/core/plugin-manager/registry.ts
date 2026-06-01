import { mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, basename } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { RegisteredPlugin } from '../../../shared/types/plugin.js';
import { readPluginManifest } from './manifest.js';

const execFileAsync = promisify(execFile);
const PLUGINS_ROOT = resolve(process.cwd(), 'plugins');
const enabledStore = new Map<string, boolean>();

export async function scanPlugins(): Promise<RegisteredPlugin[]> {
  const dirs = await readdir(PLUGINS_ROOT, { withFileTypes: true });
  const results: RegisteredPlugin[] = [];

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const pluginDir = resolve(PLUGINS_ROOT, dir.name);
    const manifestPath = resolve(pluginDir, 'plugin.json');

    try {
      await stat(manifestPath);
      const manifest = await readPluginManifest(pluginDir);
      const enabled = enabledStore.get(manifest.id) ?? manifest.enabled ?? false;
      results.push({ manifest, pluginDir, enabled });
    } catch {
      continue;
    }
  }

  return results;
}

export async function setPluginEnabled(pluginId: string, enabled: boolean) {
  enabledStore.set(pluginId, enabled);
}

export async function installPluginFromGithub(repoUrl: string): Promise<{ installedDir: string }> {
  const normalized = repoUrl.trim();
  if (!/^https:\/\/github\.com\/.+\/.+/i.test(normalized)) {
    throw new Error('repoUrl must be a valid GitHub repository URL');
  }

  const tempDir = await mkdtemp(resolve(tmpdir(), 'zcusclaw-plugin-'));

  try {
    await execFileAsync('git', ['clone', '--depth', '1', normalized, tempDir]);
    const folderName = basename(normalized.replace(/\.git$/i, ''));
    const targetDir = resolve(PLUGINS_ROOT, folderName);

    await rm(targetDir, { recursive: true, force: true });
    await execFileAsync('powershell', ['-NoProfile', '-Command', `Copy-Item -Path "${tempDir}\*" -Destination "${targetDir}" -Recurse -Force`]);

    return { installedDir: targetDir };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
