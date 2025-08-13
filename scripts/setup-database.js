const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️  Setting up production database...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../.env.example');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Copying from .env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please update it with your database credentials.\n');
  } else {
    console.error('❌ No .env.example file found. Please create .env manually.\n');
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env file.\n');
  console.log('Please set DATABASE_URL in your .env file:');
  console.log('DATABASE_URL="postgresql://username:password@localhost:5432/predict_core_db"');
  process.exit(1);
}

console.log('🔄 Running database setup steps...\n');

try {
  // Step 1: Generate Prisma client
  console.log('1️⃣  Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Step 2: Push database schema (for development)
  console.log('2️⃣  Pushing database schema...');
  if (process.env.NODE_ENV === 'production') {
    // In production, use migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Database migrations deployed\n');
  } else {
    // In development, use push for faster iteration
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database schema pushed\n');
  }

  // Step 3: Seed database with sample data
  console.log('3️⃣  Seeding database with sample data...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Database seeded with sample data\n');
  } catch (error) {
    console.log('⚠️  Seeding failed (database might already have data)\n');
  }

  // Step 4: Verify database connection
  console.log('4️⃣  Verifying database connection...');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  const userCount = await prisma.user.count();
  const marketCount = await prisma.market.count();
  
  console.log(`✅ Database connection verified`);
  console.log(`   - Users: ${userCount}`);
  console.log(`   - Markets: ${marketCount}\n`);
  
  await prisma.$disconnect();

  console.log('🎉 Database setup completed successfully!\n');
  console.log('📊 Your prediction marketplace database is ready!');
  console.log('🚀 You can now run: npm run dev\n');

} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Check your DATABASE_URL in .env');
  console.log('3. Ensure the database exists');
  console.log('4. Verify database credentials\n');
  process.exit(1);
}