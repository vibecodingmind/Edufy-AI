import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding subscription plans...');

  // Create subscription plans
  const plans = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Perfect for individual teachers getting started with AI-powered exam generation',
      priceMonthly: 0,
      priceYearly: 0,
      maxExamsPerMonth: 5,
      maxQuestionsPerExam: 30,
      maxPastPapers: 3,
      maxTextbooks: 2,
      maxSyllabusDocs: 2,
      aiGeneration: true,
      pdfExport: true,
      markingScheme: true,
      customFormats: false,
      schoolBranding: false,
      multiUser: false,
      analytics: false,
      prioritySupport: false,
      apiAccess: false,
      whiteLabel: false,
      storageLimit: 50,
      sortOrder: 1,
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'For dedicated teachers who need unlimited exam generation and advanced features',
      priceMonthly: 9.99,
      priceYearly: 99.99,
      maxExamsPerMonth: 50,
      maxQuestionsPerExam: 100,
      maxPastPapers: 20,
      maxTextbooks: 15,
      maxSyllabusDocs: 15,
      aiGeneration: true,
      pdfExport: true,
      markingScheme: true,
      customFormats: true,
      schoolBranding: false,
      multiUser: false,
      analytics: true,
      prioritySupport: true,
      apiAccess: false,
      whiteLabel: false,
      storageLimit: 500,
      sortOrder: 2,
    },
    {
      name: 'School',
      slug: 'school',
      description: 'Complete solution for schools with multiple teachers and custom branding',
      priceMonthly: 49.99,
      priceYearly: 499.99,
      maxExamsPerMonth: 500,
      maxQuestionsPerExam: 150,
      maxPastPapers: 100,
      maxTextbooks: 50,
      maxSyllabusDocs: 50,
      aiGeneration: true,
      pdfExport: true,
      markingScheme: true,
      customFormats: true,
      schoolBranding: true,
      multiUser: true,
      analytics: true,
      prioritySupport: true,
      apiAccess: true,
      whiteLabel: false,
      storageLimit: 5000,
      sortOrder: 3,
    },
    {
      name: 'District',
      slug: 'district',
      description: 'Enterprise solution for districts and large organizations with full customization',
      priceMonthly: 199.99,
      priceYearly: 1999.99,
      maxExamsPerMonth: -1, // Unlimited
      maxQuestionsPerExam: -1,
      maxPastPapers: -1,
      maxTextbooks: -1,
      maxSyllabusDocs: -1,
      aiGeneration: true,
      pdfExport: true,
      markingScheme: true,
      customFormats: true,
      schoolBranding: true,
      multiUser: true,
      analytics: true,
      prioritySupport: true,
      apiAccess: true,
      whiteLabel: true,
      storageLimit: -1, // Unlimited
      sortOrder: 4,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log(`✅ Created/Updated plan: ${plan.name}`);
  }

  // Assign free plan to existing users without a subscription
  const freePlan = await prisma.subscriptionPlan.findUnique({
    where: { slug: 'free' },
  });

  if (freePlan) {
    const usersWithoutSubscription = await prisma.user.findMany({
      where: {
        subscription: null,
      },
    });

    for (const user of usersWithoutSubscription) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: 'active',
          billingCycle: 'monthly',
        },
      });
      console.log(`✅ Assigned free plan to user: ${user.email}`);
    }
  }

  console.log('🎉 Subscription plans seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
