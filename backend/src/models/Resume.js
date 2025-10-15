import mongoose from 'mongoose';

const CandidateScoreSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 10 },
    justification: { type: String },
  },
  { _id: false }
);

const ResumeSchema = new mongoose.Schema(
  {
    name: { type: String, index: true },
    email: { type: String, index: true },
    skills: [{ type: String, index: true }],
    education: { type: String },
    experienceYears: { type: Number },
    rawText: { type: String, required: true },
    sourceFilename: { type: String },
    jobDescription: { type: String },
    match: CandidateScoreSchema,
  },
  { timestamps: true }
);

export default mongoose.model('Resume', ResumeSchema);



