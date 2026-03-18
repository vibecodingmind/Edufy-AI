import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { examId, includeMarkingScheme } = body;
    
    if (!examId) {
      return NextResponse.json({ error: 'Exam ID required' }, { status: 400 });
    }
    
    // Get the exam with all related data
    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: {
        examQuestions: {
          include: {
            question: {
              include: {
                subject: true,
                classLevel: true,
                topic: true,
              },
            },
          },
          orderBy: [{ section: 'asc' }, { questionNum: 'asc' }],
        },
      },
    });
    
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    
    // Generate PDF using Python
    const pdfBuffer = await generateExamPDF(exam, includeMarkingScheme);
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}

async function generateExamPDF(exam: any, includeMarkingScheme: boolean): Promise<Buffer> {
  const tmpDir = tmpdir();
  const timestamp = Date.now();
  const pythonFile = join(tmpDir, `generate_exam_${timestamp}.py`);
  const outputFile = join(tmpDir, `exam_${timestamp}.pdf`);
  
  // Group questions by section
  const sections: Record<string, typeof exam.examQuestions> = {};
  for (const eq of exam.examQuestions) {
    if (!sections[eq.section]) {
      sections[eq.section] = [];
    }
    sections[eq.section].push(eq);
  }
  
  const sectionNames: Record<string, string> = {
    A: 'Multiple Choice Questions',
    B: 'Short Answer Questions',
    C: 'Structured Questions',
    D: 'Essay Questions',
  };
  
  // Generate Python code for PDF creation
  const pythonCode = `
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import json

# Register fonts
try:
    pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
except:
    pass

pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Create document
doc = SimpleDocTemplate(
    "${outputFile}",
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm
)

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'Title',
    parent=styles['Heading1'],
    fontName='Times New Roman',
    fontSize=18,
    alignment=TA_CENTER,
    spaceAfter=12
)

header_style = ParagraphStyle(
    'Header',
    parent=styles['Normal'],
    fontName='Times New Roman',
    fontSize=12,
    alignment=TA_CENTER,
    spaceAfter=6
)

section_style = ParagraphStyle(
    'Section',
    parent=styles['Heading2'],
    fontName='Times New Roman',
    fontSize=14,
    spaceBefore=18,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

question_style = ParagraphStyle(
    'Question',
    parent=styles['Normal'],
    fontName='Times New Roman',
    fontSize=11,
    spaceBefore=8,
    spaceAfter=4,
    leftIndent=0
)

option_style = ParagraphStyle(
    'Option',
    parent=styles['Normal'],
    fontName='Times New Roman',
    fontSize=10,
    leftIndent=20,
    spaceBefore=2,
    spaceAfter=2
)

instruction_style = ParagraphStyle(
    'Instruction',
    parent=styles['Normal'],
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    spaceAfter=12,
    textColor=colors.HexColor('#555555')
)

answer_style = ParagraphStyle(
    'Answer',
    parent=styles['Normal'],
    fontName='Times New Roman',
    fontSize=10,
    leftIndent=20,
    spaceBefore=4,
    spaceAfter=4,
    textColor=colors.HexColor('#2E7D32')
)

marks_style = ParagraphStyle(
    'Marks',
    fontName='Times New Roman',
    fontSize=10,
    textColor=colors.HexColor('#666666')
)

story = []

# Title
story.append(Paragraph("EDUC.AI", title_style))
story.append(Spacer(1, 6))
story.append(Paragraph("${exam.title?.replace(/"/g, '\\"') || 'Exam'}", header_style))
story.append(Spacer(1, 6))

# Exam info
exam_info = [
    ["Subject:", "${exam.examQuestions[0]?.question?.subject?.name || 'N/A'}"],
    ["Class:", "${exam.examQuestions[0]?.question?.classLevel?.name || 'N/A'}"],
    ["Total Marks:", "${exam.totalMarks}"],
    ["Duration:", "${exam.duration} minutes"],
]

info_table = Table(exam_info, colWidths=[3*cm, 8*cm])
info_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 11),
    ('FONTNAME', (0, 0), (0, -1), 'Times New Roman'),
    ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
]))
story.append(info_table)
story.append(Spacer(1, 12))

# Instructions
story.append(Paragraph("INSTRUCTIONS", section_style))
story.append(Paragraph("${(exam.instructions || 'Answer all questions. Write clearly and legibly.').replace(/"/g, '\\"')}", instruction_style))
story.append(Spacer(1, 12))

# Questions by section
sections = ${JSON.stringify(sections)}
section_names = ${JSON.stringify(sectionNames)}
questions_data = ${JSON.stringify(exam.examQuestions.map((eq: any) => ({
  section: eq.section,
  questionNum: eq.questionNum,
  marks: eq.marks,
  ...eq.question
})))}

# Group by section
from collections import defaultdict
by_section = defaultdict(list)
for q in questions_data:
    by_section[q['section']].append(q)

for section_letter in sorted(by_section.keys()):
    section_questions = by_section[section_letter]
    section_total = sum(q['marks'] for q in section_questions)
    section_name = section_names.get(section_letter, 'Questions')
    
    story.append(Paragraph(f"SECTION {section_letter}: {section_name}", section_style))
    story.append(Paragraph(f"(Total: {section_total} marks)", instruction_style))
    story.append(Spacer(1, 8))
    
    for i, q in enumerate(section_questions):
        question_text = q['questionText'].replace('\\n', '<br/>')
        story.append(Paragraph(f"<b>{i+1}.</b> {question_text} <font color='#666666'>({q['marks']} marks)</font>", question_style))
        
        # Add MCQ options
        if q['questionType'] == 'MCQ' and q['options']:
            options = json.loads(q['options']) if isinstance(q['options'], str) else q['options']
            for j, opt in enumerate(options):
                letter = chr(65 + j)
                story.append(Paragraph(f"{letter}. {opt}", option_style))
        
        story.append(Spacer(1, 6))
    
    story.append(Spacer(1, 12))

# Marking Scheme
${includeMarkingScheme ? `
story.append(PageBreak())
story.append(Paragraph("MARKING SCHEME", title_style))
story.append(Spacer(1, 12))

for section_letter in sorted(by_section.keys()):
    section_questions = by_section[section_letter]
    section_name = section_names.get(section_letter, 'Questions')
    
    story.append(Paragraph(f"Section {section_letter}: {section_name}", section_style))
    story.append(Spacer(1, 8))
    
    for i, q in enumerate(section_questions):
        story.append(Paragraph(f"<b>{i+1}.</b> ({q['marks']} marks)", question_style))
        answer_text = q['correctAnswer'].replace('\\n', '<br/>')
        story.append(Paragraph(f"<font color='#2E7D32'>Answer: {answer_text}</font>", answer_style))
        if q.get('explanation'):
            story.append(Paragraph(f"<i>Note: {q['explanation']}</i>", answer_style))
        story.append(Spacer(1, 8))
` : ''}

# Build PDF
doc.build(story)
print("PDF generated successfully")
`;

  // Write Python file
  await writeFile(pythonFile, pythonCode);
  
  try {
    // Run Python script
    await execAsync(`python3 "${pythonFile}"`);
    
    // Read the generated PDF
    const pdfBuffer = await readFile(outputFile);
    
    // Cleanup
    await unlink(pythonFile).catch(() => {});
    await unlink(outputFile).catch(() => {});
    
    return pdfBuffer;
  } catch (error) {
    // Cleanup on error
    await unlink(pythonFile).catch(() => {});
    await unlink(outputFile).catch(() => {});
    throw error;
  }
}
