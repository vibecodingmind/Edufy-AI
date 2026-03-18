import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding exam format templates...');

  // Create default exam formats
  const formats = [
    {
      name: 'NECTA Primary School Format',
      description: 'National Examination Council of Tanzania - Primary School Leaving Examination Format',
      country: 'Tanzania',
      examType: 'national',
      isDefault: true,
      sections: [
        { sectionLabel: 'A', sectionName: 'Multiple Choice Questions', questionType: 'MCQ', marksPerQuestion: 1, totalMarks: 10, instructions: 'Choose the correct answer from the options given.', sortOrder: 0 },
        { sectionLabel: 'B', sectionName: 'Matching Questions', questionType: 'short_answer', marksPerQuestion: 2, totalMarks: 10, instructions: 'Match the items in Column A with those in Column B.', sortOrder: 1 },
        { sectionLabel: 'C', sectionName: 'Short Answer Questions', questionType: 'short_answer', marksPerQuestion: 3, totalMarks: 15, instructions: 'Answer all questions in this section.', sortOrder: 2 },
        { sectionLabel: 'D', sectionName: 'Structured Questions', questionType: 'structured', marksPerQuestion: 5, totalMarks: 15, instructions: 'Answer the questions based on the given information.', sortOrder: 3 },
      ],
    },
    {
      name: 'NECTA Secondary School Format',
      description: 'National Examination Council of Tanzania - Secondary School Leaving Examination Format',
      country: 'Tanzania',
      examType: 'national',
      isDefault: false,
      sections: [
        { sectionLabel: 'A', sectionName: 'Multiple Choice Questions', questionType: 'MCQ', marksPerQuestion: 1, totalMarks: 15, instructions: 'Choose the correct answer from the options given.', sortOrder: 0 },
        { sectionLabel: 'B', sectionName: 'Short Answer Questions', questionType: 'short_answer', marksPerQuestion: 5, totalMarks: 20, instructions: 'Answer all questions briefly.', sortOrder: 1 },
        { sectionLabel: 'C', sectionName: 'Structured Questions', questionType: 'structured', marksPerQuestion: 10, totalMarks: 30, instructions: 'Answer all questions based on the given information.', sortOrder: 2 },
        { sectionLabel: 'D', sectionName: 'Essay Questions', questionType: 'essay', marksPerQuestion: 15, totalMarks: 35, instructions: 'Write comprehensive answers with proper structure.', sortOrder: 3 },
      ],
    },
    {
      name: 'School Midterm Format',
      description: 'Standard school midterm examination format',
      country: 'General',
      examType: 'school',
      isDefault: false,
      sections: [
        { sectionLabel: 'A', sectionName: 'Objective Questions', questionType: 'MCQ', marksPerQuestion: 1, totalMarks: 20, instructions: 'Select the best answer for each question.', sortOrder: 0 },
        { sectionLabel: 'B', sectionName: 'Short Answer Questions', questionType: 'short_answer', marksPerQuestion: 5, totalMarks: 30, instructions: 'Answer briefly.', sortOrder: 1 },
      ],
    },
    {
      name: 'School Final Exam Format',
      description: 'Standard school final examination format',
      country: 'General',
      examType: 'school',
      isDefault: false,
      sections: [
        { sectionLabel: 'A', sectionName: 'Multiple Choice', questionType: 'MCQ', marksPerQuestion: 1, totalMarks: 15, instructions: 'Choose the correct option.', sortOrder: 0 },
        { sectionLabel: 'B', sectionName: 'True/False', questionType: 'MCQ', marksPerQuestion: 1, totalMarks: 10, instructions: 'State whether the statement is True or False.', sortOrder: 1 },
        { sectionLabel: 'C', sectionName: 'Short Answer', questionType: 'short_answer', marksPerQuestion: 5, totalMarks: 25, instructions: 'Answer all questions.', sortOrder: 2 },
        { sectionLabel: 'D', sectionName: 'Essay Questions', questionType: 'essay', marksPerQuestion: 10, totalMarks: 50, instructions: 'Write detailed answers with examples.', sortOrder: 3 },
      ],
    },
  ];

  for (const formatData of formats) {
    const existing = await db.examFormat.findFirst({
      where: { name: formatData.name },
    });

    if (existing) {
      console.log(`Format "${formatData.name}" already exists, updating...`);
      await db.examFormat.update({
        where: { id: existing.id },
        data: {
          description: formatData.description,
          country: formatData.country,
          examType: formatData.examType,
          isDefault: formatData.isDefault,
        },
      });
      // Delete existing sections and recreate
      await db.examSection.deleteMany({
        where: { formatId: existing.id },
      });

      // Create new sections
      for (const section of formatData.sections) {
        await db.examSection.create({
          data: {
            formatId: existing.id,
            sectionLabel: section.sectionLabel,
            sectionName: section.sectionName,
            questionType: section.questionType,
            marksPerQuestion: section.marksPerQuestion,
            totalMarks: section.totalMarks,
            instructions: section.instructions,
            sortOrder: section.sortOrder,
          },
        });
      }
      continue;
    }

    const format = await db.examFormat.create({
      data: {
        name: formatData.name,
        description: formatData.description,
        country: formatData.country,
        examType: formatData.examType,
        isDefault: formatData.isDefault,
      },
    });

    // Create sections
    for (const section of formatData.sections) {
      await db.examSection.create({
        data: {
          formatId: format.id,
          sectionLabel: section.sectionLabel,
          sectionName: section.sectionName,
          questionType: section.questionType,
          marksPerQuestion: section.marksPerQuestion,
          totalMarks: section.totalMarks,
          instructions: section.instructions,
          sortOrder: section.sortOrder,
        },
      });
    }
  }

  console.log('Exam format templates seeded successfully!');

  // Create default school
  const existingSchool = await db.school.findFirst({
    where: { code: 'DEMO-SCHOOL' },
  });

  if (!existingSchool) {
    await db.school.create({
      data: {
        name: 'Demo Academy',
        code: 'DEMO-SCHOOL',
        primaryColor: '#059669',
        secondaryColor: '#0D9488',
        motto: 'Education for Excellence',
        country: 'Tanzania',
      },
    });
    console.log('Default school created!');
  }
}

main()
  .catch((error: any) => {
    console.error('Error seeding:', error);
  })
  .finally(async () => {
    await db.$disconnect();
  });
