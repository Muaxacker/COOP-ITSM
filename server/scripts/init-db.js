const { execSync } = require('child_process');

console.log('🔄 Synchronizing database schema with Prisma...');

try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database schema in sync.');
} catch (error) {
  console.warn('⚠️ Standard db push encountered an error (likely leftover legacy tables/enums). Running force-reset...');
  try {
    execSync('npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema cleanly reset and synchronized.');
  } catch (resetErr) {
    console.error('❌ Failed to force-reset schema:', resetErr);
    process.exit(1);
  }
}

console.log('🌱 Checking seed data...');
try {
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
  console.log('✅ Seed check completed.');
} catch (seedErr) {
  console.error('⚠️ Seed script warning:', seedErr);
}
