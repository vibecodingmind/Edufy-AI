import { db } from './src/lib/db';

async function main() {
  // Create a super admin account
  const hashedPassword = Buffer.from('admin123').toString('base64');
  
  const user = await db.user.upsert({
    where: { email: 'admin@educ.ai' },
    update: { role: 'admin' },
    create: {
      email: 'admin@educ.ai',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });
  
  console.log('Super Admin account:');
  console.log('Email: admin@educ.ai');
  console.log('Password: admin123');
  console.log('Role: admin');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
