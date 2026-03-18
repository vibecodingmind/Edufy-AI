import { db } from '../src/lib/db';

async function seedTemplates() {
  console.log('🌱 Seeding exam templates...');

  const templates = [
    {
      name: 'Standard Multiple Choice Quiz',
      description: 'Quick assessment with multiple choice questions',
      category: 'quiz',
      totalMarks: 20,
      duration: 30,
      instructions: 'Choose the correct answer for each question. Each question carries equal marks.',
      sections: JSON.stringify([
        { label: 'A', count: 20, totalMarks: 20, questionTypes: ['MCQ'] }
      ]),
      isPublic: true,
    },
    {
      name: 'Midterm Examination',
      description: 'Comprehensive midterm exam with mixed question types',
      category: 'midterm',
      totalMarks: 100,
      duration: 120,
      instructions: 'Answer ALL questions in Sections A, B, and C. Write clearly and show all working where necessary.',
      sections: JSON.stringify([
        { label: 'A', count: 20, totalMarks: 20, questionTypes: ['MCQ'] },
        { label: 'B', count: 5, totalMarks: 40, questionTypes: ['short_answer'] },
        { label: 'C', count: 2, totalMarks: 40, questionTypes: ['essay'] }
      ]),
      isPublic: true,
    },
    {
      name: 'Final Examination',
      description: 'End of term comprehensive examination',
      category: 'final',
      totalMarks: 100,
      duration: 180,
      instructions: 'This paper consists of THREE sections. Answer ALL questions in Section A, ANY FOUR questions from Section B, and ANY TWO questions from Section C.',
      sections: JSON.stringify([
        { label: 'A', count: 25, totalMarks: 25, questionTypes: ['MCQ'] },
        { label: 'B', count: 6, totalMarks: 45, questionTypes: ['short_answer', 'structured'] },
        { label: 'C', count: 3, totalMarks: 30, questionTypes: ['essay'] }
      ]),
      isPublic: true,
    },
    {
      name: 'Quick Assessment',
      description: 'Short formative assessment for quick feedback',
      category: 'quiz',
      totalMarks: 10,
      duration: 15,
      instructions: 'Answer all questions. This is a quick check of your understanding.',
      sections: JSON.stringify([
        { label: 'A', count: 10, totalMarks: 10, questionTypes: ['MCQ', 'short_answer'] }
      ]),
      isPublic: true,
    },
    {
      name: 'Structured Questions Only',
      description: 'Exam with only structured questions',
      category: 'assignment',
      totalMarks: 60,
      duration: 90,
      instructions: 'Answer ALL questions. Show all working and calculations.',
      sections: JSON.stringify([
        { label: 'A', count: 6, totalMarks: 60, questionTypes: ['structured'] }
      ]),
      isPublic: true,
    },
    {
      name: 'Essay Examination',
      description: 'Long-form essay questions for in-depth analysis',
      category: 'final',
      totalMarks: 100,
      duration: 180,
      instructions: 'Write comprehensive essays for each question. Support your answers with relevant examples and explanations.',
      sections: JSON.stringify([
        { label: 'A', count: 5, totalMarks: 100, questionTypes: ['essay'] }
      ]),
      isPublic: true,
    },
    {
      name: 'NECTA Style Form 4',
      description: 'Tanzania National Examination style for Form 4',
      category: 'national',
      totalMarks: 100,
      duration: 150,
      instructions: 'This paper consists of sections A, B and C with a total of 12 questions. Answer ALL questions in section A, THREE questions from section B and TWO questions from section C.',
      sections: JSON.stringify([
        { label: 'A', count: 5, totalMarks: 20, questionTypes: ['short_answer'] },
        { label: 'B', count: 5, totalMarks: 50, questionTypes: ['structured'] },
        { label: 'C', count: 2, totalMarks: 30, questionTypes: ['essay'] }
      ]),
      isPublic: true,
    },
    {
      name: 'Practical Assessment',
      description: 'Practical skills assessment template',
      category: 'quiz',
      totalMarks: 50,
      duration: 60,
      instructions: 'Complete all practical tasks. Record your observations and conclusions clearly.',
      sections: JSON.stringify([
        { label: 'A', count: 3, totalMarks: 30, questionTypes: ['structured'] },
        { label: 'B', count: 2, totalMarks: 20, questionTypes: ['essay'] }
      ]),
      isPublic: true,
    },
  ];

  for (const template of templates) {
    const created = await db.examTemplate.create({
      data: template,
    });
    console.log(`✅ Created template: ${created.name}`);
  }

  console.log('\n🎉 Exam templates seeded successfully!');
}

seedTemplates()
  .then(async () => {
    await db.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Error:', e);
    await db.$disconnect();
    process.exit(1);
  });
