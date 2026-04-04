import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const adminPassword = Netlify.env.get('ADMIN_PASSWORD') || 'admin123';
  const authHeader = req.headers.get('x-admin-password');
  if (authHeader !== adminPassword) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { title, author, content } = await req.json();
  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 503 });

  const prompt = `You are a Bengali book metadata generator. Given the following book information, generate detailed metadata in JSON format.

Book Title: ${title}
Author: ${author}
Content Preview: ${content?.substring(0, 3000) || 'Not provided'}

Generate a JSON object with these fields (all Bengali text should be in proper Bengali script):
{
  "titleBn": "Bengali title",
  "authorBn": "Author name in Bengali",
  "summaryBn": "Detailed summary in Bengali (200-300 words)",
  "mainMessageBn": "One-line main message in Bengali",
  "keyPointsBn": ["3-5 key points in Bengali"],
  "targetAudienceBn": "Target audience in Bengali",
  "readingTime": "Estimated reading time like '৩ ঘণ্টা'",
  "mood": "One of: motivational, sad, funny, informative, thriller, romantic",
  "moodBn": "Mood in Bengali",
  "quotes": [{"text": "English quote", "textBn": "Bengali quote"}],
  "aboutAuthorBn": "About the author in Bengali (100 words)",
  "tags": ["3-5 English tags"],
  "tagsBn": ["3-5 Bengali tags"],
  "category": "One of: islamic, novel, science, history, children, biography, selfhelp, poetry, thriller, religion, technology, travel",
  "categoryBn": "Category in Bengali"
}

Return ONLY valid JSON, no other text.`;

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
        max_tokens: 2000,
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
