import { db } from './src/lib/db';

async function main() {
  // Create a test teacher account
  const hashedPassword = Buffer.from('password123').toString('base64');
  
  const user = await db.user.upsert({
    where: { email: 'teacher@educ.ai' },
    update: {},
    create: {
      email: 'teacher@educ.ai',
      name: 'Test Teacher',
      password: hashedPassword,
      role: 'teacher',
    },
  });
  
  console.log('Test user created:');
  console.log('Email: teacher@educ.ai');
  console.log('Password: password123');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
