import fs from 'fs/promises';
import path from 'path';
// Import the library implementation directly to avoid test harness side-effects on import
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import Resume from '../models/Resume.js';
import { scoreWithGroq } from './scoring.service.js';

async function parseTxt(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return content;
}

async function parsePdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  return data.text || '';
}

function extractStructuredData(text) {
  const emailMatch = text.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  const email = emailMatch ? emailMatch[0] : undefined;

  const nameLine = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)[0] || '';
  const name = nameLine.length <= 80 ? nameLine : undefined;

  const skillsSectionMatch = text.match(/skills[:\-]?([\s\S]{0,500})/i);
  let skills = [];
  if (skillsSectionMatch) {
    const section = skillsSectionMatch[1];
    skills = section
      .split(/[\n,•]/)
      .map((s) => s.trim())
      .filter((s) => s && s.length <= 40)
      .slice(0, 50);
  }

  const educationMatch = text.match(/education[\s\-:]*([\s\S]{0,300})/i);
  const education = educationMatch ? educationMatch[0] : undefined;

  const expYearsMatch = text.match(/(\d{1,2})\+?\s*(years|yrs)\s*(of)?\s*(experience)?/i);
  const experienceYears = expYearsMatch ? Number(expYearsMatch[1]) : undefined;

  return { name, email, skills, education, experienceYears };
}

export async function processResumes(files, jobDescription) {
  const processed = [];
  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    let text = '';
    if (ext === '.pdf') {
      text = await parsePdf(file.path);
    } else if (ext === '.txt') {
      text = await parseTxt(file.path);
    } else {
      continue;
    }

    const structured = extractStructuredData(text);
    const resumeDoc = new Resume({
      ...structured,
      rawText: text,
      sourceFilename: file.originalname,
      jobDescription,
    });
    await resumeDoc.save();

    const match = await scoreWithGroq(text, jobDescription);
    resumeDoc.match = match;
    await resumeDoc.save();

    processed.push(resumeDoc.toObject());
  }
  return processed;
}

export async function listCandidates() {
  const docs = await Resume.find({ 'match.score': { $exists: true } })
    .sort({ 'match.score': -1, createdAt: -1 })
    .lean();
  return docs.map((d) => ({
    id: d._id,
    name: d.name || d.email || d.sourceFilename,
    score: d.match?.score ?? 0,
    justification: d.match?.justification || '',
  }));
}


