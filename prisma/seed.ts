import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding database...');

  // Create Class Levels (Standard 1-7, Form 1-4)
  const classLevels = await Promise.all([
    db.classLevel.upsert({
      where: { name: 'Standard 1' },
      update: {},
      create: { name: 'Standard 1', sortOrder: 1 },
    }),
    db.classLevel.upsert({
      where: { name: 'Standard 2' },
      update: {},
      create: { name: 'Standard 2', sortOrder: 2 },
    }),
    db.classLevel.upsert({
      where: { name: 'Standard 3' },
      update: {},
      create: { name: 'Standard 3', sortOrder: 3 },
    }),
    db.classLevel.upsert({
      where: { name: 'Standard 4' },
      update: {},
      create: { name: 'Standard 4', sortOrder: 4 },
    }),
    db.classLevel.upsert({
      where: { name: 'Standard 5' },
      update: {},
      create: { name: 'Standard 5', sortOrder: 5 },
    }),
    db.classLevel.upsert({
      where: { name: 'Standard 6' },
      update: {},
      create: { name: 'Standard 6', sortOrder: 6 },
    }),
    db.classLevel.upsert({
      where: { name: 'Standard 7' },
      update: {},
      create: { name: 'Standard 7', sortOrder: 7 },
    }),
    db.classLevel.upsert({
      where: { name: 'Form 1' },
      update: {},
      create: { name: 'Form 1', sortOrder: 8 },
    }),
    db.classLevel.upsert({
      where: { name: 'Form 2' },
      update: {},
      create: { name: 'Form 2', sortOrder: 9 },
    }),
    db.classLevel.upsert({
      where: { name: 'Form 3' },
      update: {},
      create: { name: 'Form 3', sortOrder: 10 },
    }),
    db.classLevel.upsert({
      where: { name: 'Form 4' },
      update: {},
      create: { name: 'Form 4', sortOrder: 11 },
    }),
  ]);

  console.log(`Created ${classLevels.length} class levels`);

  // Create Subjects
  const subjects = await Promise.all([
    db.subject.upsert({
      where: { name: 'Geography' },
      update: {},
      create: { name: 'Geography', description: 'Study of Earth, its features, and human activity' },
    }),
    db.subject.upsert({
      where: { name: 'Mathematics' },
      update: {},
      create: { name: 'Mathematics', description: 'Study of numbers, quantities, and shapes' },
    }),
    db.subject.upsert({
      where: { name: 'Science' },
      update: {},
      create: { name: 'Science', description: 'Study of natural world and phenomena' },
    }),
    db.subject.upsert({
      where: { name: 'English' },
      update: {},
      create: { name: 'English', description: 'Study of English language and literature' },
    }),
    db.subject.upsert({
      where: { name: 'History' },
      update: {},
      create: { name: 'History', description: 'Study of past events and civilizations' },
    }),
    db.subject.upsert({
      where: { name: 'Civics' },
      update: {},
      create: { name: 'Civics', description: 'Study of citizenship and government' },
    }),
    db.subject.upsert({
      where: { name: 'Kiswahili' },
      update: {},
      create: { name: 'Kiswahili', description: 'Study of Kiswahili language' },
    }),
  ]);

  console.log(`Created ${subjects.length} subjects`);

  // Helper function to find IDs
  const getClassLevelId = (name: string) => classLevels.find(c => c.name === name)?.id;
  const getSubjectId = (name: string) => subjects.find(s => s.name === name)?.id;

  // Create Topics for Geography - Standard 7
  const std7 = getClassLevelId('Standard 7');
  const geoId = getSubjectId('Geography');
  const mathId = getSubjectId('Mathematics');
  const sciId = getSubjectId('Science');

  if (std7 && geoId) {
    const climateTopic = await db.topic.upsert({
      where: { name_subjectId_classLevelId: { name: 'Climate', subjectId: geoId, classLevelId: std7 } },
      update: {},
      create: {
        name: 'Climate',
        subjectId: geoId,
        classLevelId: std7,
        description: 'Study of weather patterns and climate zones',
      },
    });

    const landformsTopic = await db.topic.upsert({
      where: { name_subjectId_classLevelId: { name: 'Landforms', subjectId: geoId, classLevelId: std7 } },
      update: {},
      create: {
        name: 'Landforms',
        subjectId: geoId,
        classLevelId: std7,
        description: 'Study of natural features on Earths surface',
      },
    });

    const mapTopic = await db.topic.upsert({
      where: { name_subjectId_classLevelId: { name: 'Map Reading', subjectId: geoId, classLevelId: std7 } },
      update: {},
      create: {
        name: 'Map Reading',
        subjectId: geoId,
        classLevelId: std7,
        description: 'Skills for interpreting maps and geographic data',
      },
    });

    // Create Subtopics for Climate
    await Promise.all([
      db.subtopic.upsert({
        where: { name_topicId: { name: 'Types of Rainfall', topicId: climateTopic.id } },
        update: {},
        create: { name: 'Types of Rainfall', topicId: climateTopic.id },
      }),
      db.subtopic.upsert({
        where: { name_topicId: { name: 'Climate Zones', topicId: climateTopic.id } },
        update: {},
        create: { name: 'Climate Zones', topicId: climateTopic.id },
      }),
      db.subtopic.upsert({
        where: { name_topicId: { name: 'Factors Affecting Climate', topicId: climateTopic.id } },
        update: {},
        create: { name: 'Factors Affecting Climate', topicId: climateTopic.id },
      }),
      db.subtopic.upsert({
        where: { name_topicId: { name: 'Weather Instruments', topicId: climateTopic.id } },
        update: {},
        create: { name: 'Weather Instruments', topicId: climateTopic.id },
      }),
    ]);

    // Create Subtopics for Landforms
    await Promise.all([
      db.subtopic.upsert({
        where: { name_topicId: { name: 'Mountains', topicId: landformsTopic.id } },
        update: {},
        create: { name: 'Mountains', topicId: landformsTopic.id },
      }),
      db.subtopic.upsert({
        where: { name_topicId: { name: 'Plateaus', topicId: landformsTopic.id } },
        update: {},
        create: { name: 'Plateaus', topicId: landformsTopic.id },
      }),
      db.subtopic.upsert({
        where: { name_topicId: { name: 'Plains', topicId: landformsTopic.id } },
        update: {},
        create: { name: 'Plains', topicId: landformsTopic.id },
      }),
      db.subtopic.upsert({
        where: { name_topicId: { name: 'Valleys', topicId: landformsTopic.id } },
        update: {},
        create: { name: 'Valleys', topicId: landformsTopic.id },
      }),
    ]);
  }

  // Create Topics for Mathematics - Standard 7
  if (std7 && mathId) {
    await Promise.all([
      db.topic.upsert({
        where: { name_subjectId_classLevelId: { name: 'Algebra', subjectId: mathId, classLevelId: std7 } },
        update: {},
        create: {
          name: 'Algebra',
          subjectId: mathId,
          classLevelId: std7,
          description: 'Study of mathematical symbols and rules',
        },
      }),
      db.topic.upsert({
        where: { name_subjectId_classLevelId: { name: 'Geometry', subjectId: mathId, classLevelId: std7 } },
        update: {},
        create: {
          name: 'Geometry',
          subjectId: mathId,
          classLevelId: std7,
          description: 'Study of shapes, sizes, and positions',
        },
      }),
      db.topic.upsert({
        where: { name_subjectId_classLevelId: { name: 'Fractions', subjectId: mathId, classLevelId: std7 } },
        update: {},
        create: {
          name: 'Fractions',
          subjectId: mathId,
          classLevelId: std7,
          description: 'Study of parts of a whole',
        },
      }),
      db.topic.upsert({
        where: { name_subjectId_classLevelId: { name: 'Percentages', subjectId: mathId, classLevelId: std7 } },
        update: {},
        create: {
          name: 'Percentages',
          subjectId: mathId,
          classLevelId: std7,
          description: 'Study of parts per hundred',
        },
      }),
    ]);
  }

  // Create Topics for Science - Standard 7
  if (std7 && sciId) {
    await Promise.all([
      db.topic.upsert({
        where: { name_subjectId_classLevelId: { name: 'Living Things', subjectId: sciId, classLevelId: std7 } },
        update: {},
        create: {
          name: 'Living Things',
          subjectId: sciId,
          classLevelId: std7,
          description: 'Study of plants, animals, and microorganisms',
        },
      }),
      db.topic.upsert({
        where: { name_subjectId_classLevelId: { name: 'Matter', subjectId: sciId, classLevelId: std7 } },
        update: {},
        create: {
          name: 'Matter',
          subjectId: sciId,
          classLevelId: std7,
          description: 'Study of properties and states of matter',
        },
      }),
      db.topic.upsert({
        where: { name_subjectId_classLevelId: { name: 'Energy', subjectId: sciId, classLevelId: std7 } },
        update: {},
        create: {
          name: 'Energy',
          subjectId: sciId,
          classLevelId: std7,
          description: 'Study of different forms of energy',
        },
      }),
      db.topic.upsert({
        where: { name_subjectId_classLevelId: { name: 'Human Body', subjectId: sciId, classLevelId: std7 } },
        update: {},
        create: {
          name: 'Human Body',
          subjectId: sciId,
          classLevelId: std7,
          description: 'Study of human anatomy and physiology',
        },
      }),
    ]);
  }

  // Create sample questions for Geography - Climate
  if (std7 && geoId) {
    const climateTopic = await db.topic.findFirst({
      where: { name: 'Climate', subjectId: geoId, classLevelId: std7 }
    });

    if (climateTopic) {
      const rainfallSubtopic = await db.subtopic.findFirst({
        where: { name: 'Types of Rainfall', topicId: climateTopic.id }
      });

      await Promise.all([
        // MCQ Questions
        db.question.create({
          data: {
            questionText: 'What is climate?',
            questionType: 'MCQ',
            difficulty: 'easy',
            marks: 1,
            options: JSON.stringify([
              'The daily weather condition of a place',
              'The average weather condition of a place over a long period',
              'The temperature of a place on a given day',
              'The amount of rainfall in a year'
            ]),
            correctAnswer: 'The average weather condition of a place over a long period',
            explanation: 'Climate refers to the average weather conditions over a long period, usually 30 years or more.',
            subjectId: geoId,
            classLevelId: std7,
            topicId: climateTopic.id,
            subtopicId: rainfallSubtopic?.id,
          },
        }),
        db.question.create({
          data: {
            questionText: 'Which type of rainfall is common in mountainous regions?',
            questionType: 'MCQ',
            difficulty: 'medium',
            marks: 1,
            options: JSON.stringify([
              'Convectional rainfall',
              'Relief rainfall',
              'Frontal rainfall',
              'Cyclonic rainfall'
            ]),
            correctAnswer: 'Relief rainfall',
            explanation: 'Relief rainfall (or orographic rainfall) occurs when moist air is forced to rise over mountains.',
            subjectId: geoId,
            classLevelId: std7,
            topicId: climateTopic.id,
            subtopicId: rainfallSubtopic?.id,
          },
        }),
        db.question.create({
          data: {
            questionText: 'Which instrument is used to measure rainfall?',
            questionType: 'MCQ',
            difficulty: 'easy',
            marks: 1,
            options: JSON.stringify([
              'Thermometer',
              'Barometer',
              'Rain gauge',
              'Hygrometer'
            ]),
            correctAnswer: 'Rain gauge',
            explanation: 'A rain gauge is specifically designed to measure the amount of precipitation.',
            subjectId: geoId,
            classLevelId: std7,
            topicId: climateTopic.id,
          },
        }),
        // Short Answer Questions
        db.question.create({
          data: {
            questionText: 'Define the term climate.',
            questionType: 'short_answer',
            difficulty: 'easy',
            marks: 2,
            correctAnswer: 'Climate is the average weather condition of a place over a long period of time, usually 30-35 years or more.',
            explanation: 'Climate includes patterns of temperature, humidity, atmospheric pressure, wind, precipitation, and other meteorological variables.',
            subjectId: geoId,
            classLevelId: std7,
            topicId: climateTopic.id,
          },
        }),
        db.question.create({
          data: {
            questionText: 'Name three types of rainfall.',
            questionType: 'short_answer',
            difficulty: 'medium',
            marks: 3,
            correctAnswer: '1. Convectional rainfall\n2. Relief/Orographic rainfall\n3. Frontal/Cyclonic rainfall',
            explanation: 'These are the three main types of rainfall, each formed by different atmospheric processes.',
            subjectId: geoId,
            classLevelId: std7,
            topicId: climateTopic.id,
            subtopicId: rainfallSubtopic?.id,
          },
        }),
        // Structured Questions
        db.question.create({
          data: {
            questionText: 'Explain how convectional rainfall is formed.',
            questionType: 'structured',
            difficulty: 'medium',
            marks: 5,
            correctAnswer: 'Convectional rainfall is formed through the following process:\n1. The sun heats the ground, warming the air above it.\n2. Warm air rises (convection currents) because it is less dense.\n3. As the air rises, it cools and expands.\n4. When it reaches dew point, water vapor condenses to form clouds.\n5. When the water droplets become too heavy, they fall as rain.',
            explanation: 'Convectional rainfall is common in tropical regions and usually occurs in the afternoon.',
            subjectId: geoId,
            classLevelId: std7,
            topicId: climateTopic.id,
            subtopicId: rainfallSubtopic?.id,
          },
        }),
        // Essay Question
        db.question.create({
          data: {
            questionText: 'Discuss the factors that influence the climate of a region.',
            questionType: 'essay',
            difficulty: 'hard',
            marks: 10,
            correctAnswer: 'Key factors influencing climate include:\n\n1. Latitude: Determines the angle of sunlight and temperature patterns.\n\n2. Altitude: Higher elevations have cooler temperatures.\n\n3. Distance from the sea: Coastal areas have moderate temperatures; inland areas have extreme temperatures.\n\n4. Ocean currents: Warm currents warm the coast; cold currents cool it.\n\n5. Prevailing winds: Carry moisture and affect precipitation patterns.\n\n6. Relief/Mountains: Create rain shadows and affect rainfall distribution.\n\n7. Aspect: The direction a slope faces affects its exposure to sun and wind.',
            explanation: 'These factors interact to create the unique climate of each region.',
            subjectId: geoId,
            classLevelId: std7,
            topicId: climateTopic.id,
          },
        }),
      ]);
    }
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
