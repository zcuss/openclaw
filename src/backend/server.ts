import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { registerHealthRoutes } from './api/routes/health.js';
import { registerMonitoringRoutes } from './api/routes/monitoring.js';
import { registerPluginRoutes } from './api/routes/plugins.js';
import { loadEnabledPlugins } from './core/plugin-manager/loader.js';

export async function buildServer() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(sensible);

  registerHealthRoutes(app);
  registerMonitoringRoutes(app);
  registerPluginRoutes(app);

  await loadEnabledPlugins(app);
  return app;
}

if (process.env.NODE_ENV !== 'test') {
  buildServer()
    .then((app) => app.listen({ port: Number(process.env.PORT || 8787), host: '0.0.0.0' }))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
