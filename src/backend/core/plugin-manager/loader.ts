import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { FastifyInstance } from 'fastify';
import type { RuntimePluginModule } from '../../../shared/types/plugin.js';
import { scanPlugins } from './registry.js';

export async function loadEnabledPlugins(app: FastifyInstance) {
  const plugins = await scanPlugins();

  for (const plugin of plugins) {
    if (!plugin.enabled) continue;

    const entryPath = resolve(plugin.pluginDir, plugin.manifest.entry);
    const moduleUrl = pathToFileURL(entryPath).href;
    const runtime = (await import(moduleUrl)) as RuntimePluginModule;

    if (runtime.setup) {
      await runtime.setup({ app });
    }
  }
}
