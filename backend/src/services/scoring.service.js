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
  } catch (_) {
    // ignore
  }
  return { score: 0, justification: 'Model did not return valid JSON.' };
}

export async function scoreWithGroq(resumeText, jobDescription) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { score: 0, justification: 'GROQ_API_KEY not configured.' };
  }

  const prompt = buildPrompt(resumeText.slice(0, 6000), jobDescription.slice(0, 4000));

  try {
    // Groq API: using chat.completions compatible endpoint
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


