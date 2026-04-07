import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, newPassword } = await req.json();

  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_ACCESS_TOKEN;

  // token আছে কিনা দেখো
  console.log('SiteID:', siteId);
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length);

  const searchRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/identity/users?per_page=50&page=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const rawData = await searchRes.json();
  console.log('API Status:', searchRes.status);
  console.log('API Response:', JSON.stringify(rawData));

  return Response.json({ 
    debug: true,
    tokenExists: !!token,
    tokenLength: token?.length,
    status: searchRes.status,
    data: rawData 
  });
};

export const config = {
  path: '/api/reset-password',
};