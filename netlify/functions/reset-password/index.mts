import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, newPassword } = await req.json();
  if (!email || !newPassword) return new Response('Missing fields', { status: 400 });

  const siteId = Netlify.env.get('NETLIFY_SITE_ID') || '';
  const adminToken = Netlify.env.get('NETLIFY_ACCESS_TOKEN') || '';

  if (!siteId || !adminToken) {
    return Response.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  const searchRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/identity/users?q=${encodeURIComponent(email)}`,
    { headers: { 'Authorization': `Bearer ${adminToken}` } }
  );

  if (!searchRes.ok) {
    return Response.json({ success: false, message: 'User খুঁজে পাওয়া যায়নি' }, { status: 400 });
  }

  const data = await searchRes.json();
  if (!data?.users?.length) {
    return Response.json({ success: false, message: 'এই email দিয়ে কোনো account নেই' }, { status: 400 });
  }

  const userId = data.users[0].id;

  const updateRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/identity/users/${userId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    }
  );

  if (!updateRes.ok) {
    return Response.json({ success: false, message: 'Password update করতে সমস্যা হয়েছে' }, { status: 500 });
  }

  return Response.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
};

export const config = {
  path: '/api/reset-password',
};