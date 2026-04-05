import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const adminPassword = Netlify.env.get('ADMIN_PASSWORD') || 'admin123';
  const authHeader = req.headers.get('x-admin-password');
  if (authHeader !== adminPassword) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { title, author } = await req.json();
  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 503 });

  const prompt = `You are an expert Bengali book editor and literary writer. Given a book's title and author, generate rich metadata in JSON format.

Book Title: ${title}
Author: ${author}

IMPORTANT INSTRUCTIONS:
- Bengali text must be natural, flowing, and literary — as if written by a human Bengali writer, NOT machine translated
- Use conversational, warm Bengali that readers enjoy
- Avoid overly formal or bureaucratic Bengali words
- English fields should be concise and professional
- Summary should feel like a knowledgeable friend recommending the book

Generate this exact JSON structure:
{
  "titleBn": "Bengali title (natural transliteration)",
  "authorBn": "Author name in Bengali script",
  "summary": "English summary in 3-4 engaging sentences",
  "summaryBn": "Bengali summary in 150-200 words — warm, literary, engaging tone. Start with something that hooks the reader.",
  "mainMessage": "One powerful sentence in English capturing the book's core message",
  "mainMessageBn": "Same but in natural Bengali — poetic if possible",
  "keyPoints": ["3-5 key insights in English", "each as a complete thought"],
  "keyPointsBn": ["Same 3-5 points in natural Bengali", "avoid literal translation"],
  "targetAudience": "Who should read this in English",
  "targetAudienceBn": "Same in warm Bengali — like you're telling a friend",
  "readingTime": "Estimated time like '৪ ঘণ্টা' or '৬-৮ ঘণ্টা'",
  "mood": "One of: motivational, sad, funny, informative, thriller, romantic",
  "moodBn": "Mood in Bengali",
  "quotes": [{"text": "Powerful English quote from or about the book", "textBn": "Natural Bengali version"}],
  "aboutAuthor": "2-3 sentences about the author in English",
  "aboutAuthorBn": "Same in natural Bengali — respectful but not stiff",
  "tags": ["3-5 English tags"],
  "tagsBn": ["3-5 Bengali tags"],
  "category": "One of: islamic, novel, science, history, children, biography, selfhelp, poetry, thriller, religion, technology, travel",
  "categoryBn": "Category in Bengali"
}

Return ONLY valid JSON. No markdown, no explanation.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    try {
      const metadata = JSON.parse(text);
      return Response.json(metadata);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(JSON.parse(jsonMatch[0]));
      }
      return Response.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: 'AI service error' }, { status: 500 });
  }
};

export const config = {
  path: '/api/ai-generate',
};