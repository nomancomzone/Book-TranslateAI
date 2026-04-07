import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email } = await req.json();
  if (!email) return new Response('Missing email', { status: 400 });

  const res = await fetch(
    `https://translatedbook.com/.netlify/identity/recover`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }
  );

  if (!res.ok) {
    return Response.json({ success: false, message: 'সমস্যা হয়েছে' }, { status: 500 });
  }

  return Response.json({ success: true, message: 'পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!' });
};

export const config = {
  path: '/api/reset-password',
};