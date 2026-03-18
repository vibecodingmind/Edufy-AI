import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function createTestUsers() {
  console.log('Creating test users...');
  
  // Test regular user
  const userPassword = await hashPassword('password123');
  const user = await db.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Test Teacher',
      password: userPassword,
      role: 'teacher',
    },
  });
  console.log('✅ Created test user:', user.email);
  
  // Test admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await db.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Created admin user:', admin.email);
  
  // Create subscriptions for both users
  const freePlan = await db.subscriptionPlan.findUnique({
    where: { slug: 'free' },
  });
  
  if (freePlan) {
    await db.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        planId: freePlan.id,
        status: 'active',
        billingCycle: 'monthly',
        examsThisMonth: 0,
      },
    });
    console.log('✅ Created subscription for test user');
    
    // Give admin a Pro plan
    const proPlan = await db.subscriptionPlan.findUnique({
      where: { slug: 'pro' },
    });
    
    if (proPlan) {
      await db.subscription.upsert({
        where: { userId: admin.id },
        update: {},
        create: {
          userId: admin.id,
          planId: proPlan.id,
          status: 'active',
          billingCycle: 'yearly',
          examsThisMonth: 0,
        },
      });
      console.log('✅ Created Pro subscription for admin user');
    }
  }
  
  console.log('\n🎉 Test users created successfully!\n');
  console.log('========================================');
  console.log('TEST USER (Teacher):');
  console.log('  Email: user@test.com');
  console.log('  Password: password123');
  console.log('========================================');
  console.log('ADMIN USER:');
  console.log('  Email: admin@test.com');
  console.log('  Password: admin123');
  console.log('========================================\n');
}

createTestUsers()
  .then(async () => {
    await db.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Error:', e);
    await db.$disconnect();
    process.exit(1);
  });
