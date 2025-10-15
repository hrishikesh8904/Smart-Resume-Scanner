##🧠 Smart Resume Screener
AI-powered Resume Parsing and Candidate Ranking System
##📋 Objective

The Smart Resume Screener intelligently parses resumes, extracts structured information (skills, experience, education), and compares them against a provided job description.
Using Groq LLM, it computes a match score and generates justifications for each candidate, allowing recruiters to shortlist top candidates quickly.

##🚀 Features

✅ Upload multiple resumes (PDF/Text)
✅ Parse and extract candidate details:

Name

Email

Skills

Education

Experience
✅ Compare each resume to a job description
✅ Use Groq LLM for semantic matching and scoring
✅ Display candidates ranked by match score
✅ Store results in MongoDB
✅ Modern React + Tailwind dashboard

##🏗️ Tech Stack
Component Technology
Frontend React.js, Tailwind CSS
Backend Node.js, Express.js
Database MongoDB (Mongoose)
LLM Integration Groq API
Resume Parsing pdf-parse, text parsing
File Upload Multer
##🧩 Architecture
smart-resume-screener/
│
├── backend/
│ ├── server.js
│ ├── routes/
│ │ └── resumeRoutes.js
│ ├── controllers/
│ │ └── resumeController.js
│ ├── models/
│ │ └── Candidate.js
│ ├── services/
│ │ ├── parser.js # PDF/Text extraction
│ │ └── llm.js (Groq integration)
│ ├── uploads/
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── App.jsx
│ │ ├── components/
│ │ │ ├── UploadForm.jsx
│ │ │ └── CandidateList.jsx
│ │ └── utils/api.js
│ ├── tailwind.config.js
│ ├── index.css
│ └── package.json
│
├── .gitignore
├── .env.example
└── README.md

##⚙️ Environment Setup

1️⃣ Create a .env file in the backend/ directory
(based on .env.example)

PORT=5000
MONGO_URI=mongodb+srv://<your-username>:<your-password>@cluster.mongodb.net/resumeScreener
GROQ_API_KEY=your_groq_api_key_here

2️⃣ For frontend (optional), add:

VITE_BACKEND_URL=http://localhost:5000

🧭 Installation & Setup
🧱 Clone the Repository
git clone https://github.com/hrishikesh8904/Smart-Resume-Screener.git
cd Smart-Resume-Screener

⚙️ Backend Setup
cd backend
npm install
npm run dev

🎨 Frontend Setup

Open a new terminal:

cd frontend
npm install
npm run dev

Frontend: http://localhost:5173

Backend: http://localhost:5000

##📤 Usage Workflow

1️⃣ Upload multiple resumes (PDF/Text)
2️⃣ Paste a job description in the textarea
3️⃣ Click Analyze
4️⃣ Backend:

Extracts resume text

Sends to Groq API for scoring

Stores results in MongoDB
5️⃣ Frontend:

Displays ranked candidates with score + justification

##🧩 LLM Prompting & Scoring Logic

This project uses the Groq API (OpenAI-compatible endpoint) for semantic comparison between a resume and a job description.

📜 services/llm.js
import axios from 'axios';

function buildPrompt(resumeText, jobDescription) {
return `Compare the following resume and job description, and rate fit on a scale of 1–10.
Also provide a short justification (2–3 sentences).

Resume:
${resumeText}

Job Description:
${jobDescription}

Return JSON:
{
"score": <number>,
"justification": "<text>"
}`;
}

function safeParseScoreJson(text) {
try {
const start = text.indexOf('{');
const end = text.lastIndexOf('}');
if (start !== -1 && end !== -1) {
const jsonStr = text.slice(start, end + 1);
const parsed = JSON.parse(jsonStr);
const score = Number(parsed.score);
const justification = String(parsed.justification || '');
if (!Number.isNaN(score) && justification) {
return {
score: Math.max(0, Math.min(10, score)),
justification,
};
}
}
} catch (\_) {}
return { score: 0, justification: 'Model did not return valid JSON.' };
}

export async function scoreWithGroq(resumeText, jobDescription) {
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
return { score: 0, justification: 'GROQ_API_KEY not configured.' };
}

const prompt = buildPrompt(resumeText.slice(0, 6000), jobDescription.slice(0, 4000));

try {
const response = await axios.post(
'https://api.groq.com/openai/v1/chat/completions',
{
model: 'openai/gpt-oss-20b',
messages: [
{ role: 'system', content: 'You are a helpful AI assistant that returns strict JSON when asked.' },
{ role: 'user', content: prompt },
],
temperature: 0.2,
response_format: { type: 'json_object' },
},
{
headers: {
Authorization: `Bearer ${apiKey}`,
'Content-Type': 'application/json',
},
timeout: 60000,
}
);

    const content = response.data?.choices?.[0]?.message?.content || '';
    return safeParseScoreJson(content);

} catch (err) {
const msg = err.response?.data?.error?.message || err.message || 'Groq request failed';
return { score: 0, justification: `Scoring failed: ${msg}` };
}
}

🧠 Prompt Explanation:

The prompt instructs the model to:

Compare resume and job description

Assign a score (1–10)

Provide a short justification

The LLM response is expected to be in strict JSON, e.g.:

{
"score": 8.5,
"justification": "The candidate has strong backend skills and relevant Node.js experience but limited exposure to ML."
}

⚙️ API Call:

Endpoint: https://api.groq.com/openai/v1/chat/completions

Model: openai/gpt-oss-20b

Headers: Authorization (Bearer token from .env)

Response timeout: 60s

Format: JSON

🧩 JSON Parsing:

The safeParseScoreJson() ensures:

Only valid JSON is parsed

Score is clamped between 0–10

Returns fallback justification on malformed responses

##🌐 API Endpoints
Method Endpoint Description
POST /api/resumes/upload Uploads resumes & job description
GET /api/resumes Returns all candidates sorted by match score
💾 Database Schema (Candidate.js)
import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
name: String,
email: String,
skills: [String],
education: String,
experience: String,
matchScore: Number,
justification: String,
});

export default mongoose.model("Candidate", candidateSchema);

##🎨 Frontend UI Overview
Component Purpose
UploadForm.jsx Upload files + job description
CandidateList.jsx Display ranked candidates
App.jsx Manage state & API calls

##🎬 Demo Steps

Run backend and frontend

Upload resumes and job description

Click Analyze

View ranked candidates

##🧑‍💻 Author

Hrishikesh Sane (Kesh)
📧 hrishikesh.sane202289@gmail.com

💼 MERN + AI Developer
