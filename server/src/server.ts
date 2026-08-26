import './config/env'; // load env first
import app from './app';
import { config } from './config/env';
import { prisma } from './config/prisma';
import { markOverdueRequests } from './services/request.service';
import cron from 'node-cron';

async function main() {
  // Test DB connection
  await prisma.$connect();
  console.log('✅ Database connected');

  // Start overdue cron job — runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const count = await markOverdueRequests();
      if (count > 0) console.log(`[CRON] Marked ${count} requests as overdue`);
    } catch (err) {
      console.error('[CRON] Error marking overdue requests:', err);
    }
  });

  app.listen(config.port, () => {
    console.log(`🚀 BankCare API running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
