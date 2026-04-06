import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, newPassword } = await req.json();
  if (!email || !newPassword) return new Response('Missing fields', { status: 400 });

  const siteId = Netlify.env.get('NETLIFY_SITE_ID') || '';
  const adminToken = Netlify.env.get('NETLIFY_ACCESS_TOKEN') || '';

  if (!siteId || !adminToken) {
    return Response.json({ success: false, message: `Config missing: siteId=${!!siteId}, token=${!!adminToken}` }, { status: 500 });
  }

  // Identity users endpoint
  const url = `https://api.netlify.com/api/v1/sites/${siteId}/identity/users`;
  console.log('Fetching:', url);

  const searchRes = await fetch(url, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  const rawText = await searchRes.text();
  console.log('Response status:', searchRes.status);
  console.log('Response body:', rawText.slice(0, 500));

  if (!searchRes.ok) {
    return Response.json({ success: false, message: `API ${searchRes.status}: ${rawText.slice(0, 200)}` }, { status: 400 });
  }

  let data: any;
  try { data = JSON.parse(rawText); } catch { return Response.json({ success: false, message: 'Parse error' }, { status: 500 }); }

  const users = data?.users || [];
  const foundUser = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

  if (!foundUser) {
    return Response.json({ success: false, message: `Account নেই। মোট ${users.length} user আছে।` }, { status: 400 });
  }

  const updateRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/identity/users/${foundUser.id}`,
    {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    return Response.json({ success: false, message: `Update error: ${errText.slice(0, 200)}` }, { status: 500 });
  }

  return Response.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
};

export const config = {
  path: '/api/reset-password',
};