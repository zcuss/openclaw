import os from 'node:os';
import process from 'node:process';
import type { FastifyInstance } from 'fastify';

export function registerMonitoringRoutes(app: FastifyInstance) {
  app.get('/api/monitoring/resources', async () => {
    const mem = process.memoryUsage();
    return {
      cpu: { cores: os.cpus().length, loadAvg: os.loadavg() },
      memory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal },
      uptimeSeconds: process.uptime(),
    };
  });
}
