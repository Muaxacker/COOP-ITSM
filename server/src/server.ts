import './config/env'; // load env first
import app from './app';
import { config } from './config/env';
import { prisma } from './config/prisma';
import { checkSlaBreaches } from './services/incident.service';
import cron from 'node-cron';

import http from 'http';
import { initSocket } from './config/socket';

async function main() {
  const rawDbUrl = process.env.DATABASE_URL || config.databaseUrl || '';
  const maskedDbUrl = rawDbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`📡 Connecting to database: ${maskedDbUrl}`);

  await prisma.$connect();
  console.log('✅ Database connected successfully');

  const httpServer = http.createServer(app);
  const io = initSocket(httpServer);
  console.log('⚡ Socket.io Real-Time Engine initialized');

  // Check SLA deadlines every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const count = await checkSlaBreaches();
      if (count > 0) {
        console.log(`[SLA-MONITOR] Alert: ${count} incidents breached SLA deadline`);
      }
    } catch (err) {
      console.error('[SLA-MONITOR] Error checking SLA deadlines:', err);
    }
  });

  httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 COOP-ITSM API running on port ${config.port} (0.0.0.0)`);
    console.log(`   Environment: ${config.nodeEnv}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
