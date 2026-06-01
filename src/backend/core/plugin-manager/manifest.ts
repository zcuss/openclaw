import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { PluginManifest } from '../../../shared/types/plugin.js';

export async function readPluginManifest(pluginDir: string): Promise<PluginManifest> {
  const raw = await readFile(resolve(pluginDir, 'plugin.json'), 'utf8');
  const manifest = JSON.parse(raw) as PluginManifest;

  if (!manifest.id || !manifest.name || !manifest.version || !manifest.entry || !manifest.type) {
    throw new Error(`Invalid plugin.json in ${pluginDir}`);
  }

  return manifest;
}
