/**
 * Groq AI for notes:
 * - summarize notes content
 * - generate quiz (MCQs)
 */
async function callGroq({ system, prompt, temperature=0.35, max_tokens=360 }){
  const apiKey = process.env.GROQ_API_KEY;
  if(!apiKey) throw new Error("GROQ_API_KEY missing in .env");

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      temperature,
      max_tokens
    })
  });

  const data = await response.json();
  if(!response.ok){
    const msg = data?.error?.message || "Groq API error";
    throw new Error(msg);
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

export async function summarizeNotes({ title, subject, keywords, text }){
  const system = "You summarize student notes in simple clear format with bullet points.";
  const prompt = `Title: ${title}
Subject: ${subject}
Keywords: ${keywords}

Notes content:
${text}

Write a summary with:
- 6 bullet points
- 1 short example
- 1 viva question`;

  return callGroq({ system, prompt, temperature: 0.35, max_tokens: 300 });
}

export async function generateQuiz({ title, subject, keywords, text }){
  const system = "You generate MCQ quizzes for students.";
  const prompt = `Title: ${title}
Subject: ${subject}
Keywords: ${keywords}

Notes content:
${text}

Generate 10 MCQ questions.
Format:
Q1) ...
A) ...
B) ...
C) ...
D) ...
Ans: ...`;

  return callGroq({ system, prompt, temperature: 0.3, max_tokens: 420 });
}
