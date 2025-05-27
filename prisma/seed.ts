import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  { text: 'What is your approach to content planning for a new brand?' },
  { text: 'How do you measure content performance over time?' },
  { text: 'Describe a successful content campaign you led.' },
  { text: 'How do you perform content audits?' },
];

async function main() {
  for (const q of questions) {
    await prisma.question.create({ data: q });
  }
  console.log(' Questions seeded successfully!');
}

main()
  .catch((e) => {
    console.error(' Error seeding questions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
