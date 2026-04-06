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

  // সব user list করো তারপর filter করো
  const searchRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/identity/users`,
    { headers: { 'Authorization': `Bearer ${adminToken}` } }
  );

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    return Response.json({ success: false, message: `API error: ${searchRes.status} - ${errText}` }, { status: 400 });
  }

  const data = await searchRes.json();
  const users = data?.users || [];
  
  // Email দিয়ে filter করো
  const foundUser = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
  
  if (!foundUser) {
    return Response.json({ 
      success: false, 
      message: `এই email দিয়ে কোনো account নেই (${users.length} users found)` 
    }, { status: 400 });
  }

  const userId = foundUser.id;

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
    const errText = await updateRes.text();
    return Response.json({ success: false, message: `Update error: ${errText}` }, { status: 500 });
  }

  return Response.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
};

export const config = {
  path: '/api/reset-password',
};