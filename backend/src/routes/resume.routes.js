import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { processResumes, listCandidates, clearCandidates } from '../services/resume.service.js';
import fs from 'fs';

const router = Router();

const uploadDir = path.join(os.tmpdir(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only PDF and TXT files are allowed'));
  },
});

router.post('/upload', upload.array('resumes', 10), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription || '';
    const files = req.files || [];
    const results = await processResumes(files, jobDescription);
    res.json({ ok: true, count: results.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || 'Upload failed' });
  }
});

router.get('/candidates', async (_req, res) => {
  try {
    const candidates = await listCandidates();
    res.json({ ok: true, candidates });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Failed to list candidates' });
  }
});

router.delete('/candidates', async (_req, res) => {
  try {
    await clearCandidates();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Failed to clear candidates' });
  }
});

export default router;


