import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, newPassword } = await req.json();
  if (!email || !newPassword) return new Response('Missing fields', { status: 400 });

  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_ACCESS_TOKEN;

  let found: any = null;
  let page = 1;

  while (!found) {
    const searchRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/identity/users?per_page=50&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!searchRes.ok) break;

    const data = await searchRes.json();
    const users = data.users || [];

    found = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (users.length < 50) break;
    page++;
  }

  if (!found) {
    return Response.json({ success: false, message: 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই' }, { status: 404 });
  }

  const updateRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/identity/users/${found.id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.error('Update error:', errText);
    return Response.json({ success: false, message: 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে' }, { status: 500 });
  }

  return Response.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
};

export const config = {
  path: '/api/reset-password',
};