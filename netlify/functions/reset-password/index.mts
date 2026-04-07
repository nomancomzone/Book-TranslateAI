import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, newPassword } = await req.json();
  if (!email || !newPassword) return new Response('Missing fields', { status: 400 });

  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_ACCESS_TOKEN;

  // ১. আগে user খুঁজো email দিয়ে
  const searchRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/identity/users?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!searchRes.ok) {
    return Response.json({ success: false, message: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }

  const searchData = await searchRes.json();
  const users = searchData.users || [];
  const found = users.find((u: any) => u.email === email);

  if (!found) {
    return Response.json({ success: false, message: 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই' }, { status: 404 });
  }

  // ২. সেই user-এর password update করো
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
    return Response.json({ success: false, message: 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে' }, { status: 500 });
  }

  return Response.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
};

export const config = {
  path: '/api/reset-password',
};