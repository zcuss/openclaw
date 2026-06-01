import type { FastifyInstance } from 'fastify';
import { installPluginFromGithub, scanPlugins, setPluginEnabled } from '../../core/plugin-manager/registry.js';

export function registerPluginRoutes(app: FastifyInstance) {
  app.get('/api/plugins', async () => ({ items: await scanPlugins() }));

  app.post<{ Body: { repoUrl: string } }>('/api/plugins/install', async (request) => {
    const result = await installPluginFromGithub(request.body.repoUrl);
    return { ok: true, ...result };
  });

  app.patch<{ Params: { id: string }; Body: { enabled: boolean } }>('/api/plugins/:id', async (request) => {
    await setPluginEnabled(request.params.id, request.body.enabled);
    return { ok: true };
  });
}
