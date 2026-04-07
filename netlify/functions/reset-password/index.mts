import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, newPassword } = await req.json();
  if (!email || !newPassword) return new Response('Missing fields', { status: 400 });

  const token = process.env.NETLIFY_ACCESS_TOKEN;

  // সব user list করো
  const searchRes = await fetch(
    `https://translatedbook.com/.netlify/identity/admin/users`,
    { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.text();
    console.log('Search error:', err);
    return Response.json({ success: false, message: 'ব্যবহারকারী খুঁজতে সমস্যা হয়েছে' }, { status: 500 });
  }

  const data = await searchRes.json();
  const users = data.users || [];
  const found = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

  if (!found) {
    return Response.json({ success: false, message: 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই' }, { status: 404 });
  }

  // password update করো
  const updateRes = await fetch(
    `https://translatedbook.com/.netlify/identity/admin/users/${found.id}`,
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