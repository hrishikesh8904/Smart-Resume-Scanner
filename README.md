Smart Resume Screener

AI-powered MERN app to parse resumes, compare to a job description using Groq LLM, and rank candidates.

Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB (Mongoose)
- LLM: Groq API (GROQ_API_KEY)
- Parsing: pdf-parse for PDFs, plain text for .txt
- Uploads: multer

Setup

Prerequisites
- Node.js 18+
- MongoDB running (local or Atlas)
- Groq API key

Backend
1. cd smart-resume-screener/backend
2. Create .env with:
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/smart-resume-screener
   GROQ_API_KEY=your_key_here
3. npm install
4. npm run dev

Frontend
1. cd smart-resume-screener/frontend
2. npm install
3. npm run dev

Usage
1. Open http://localhost:5173
2. Upload multiple resumes (PDF or TXT) and paste a job description
3. Process and view ranked candidates with justifications

API
- POST /api/resumes/upload (multipart): resumes[] files, jobDescription string
- GET /api/resumes/candidates: returns ranked candidates
- GET /health: health check

Production
- Build frontend (npm run build), host statics, run backend with npm start and environment variables; configure CORS as needed.


