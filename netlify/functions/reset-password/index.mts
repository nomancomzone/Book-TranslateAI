import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, newPassword } = await req.json();
  if (!email || !newPassword) return new Response('Missing fields', { status: 400 });

  const siteId = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_ACCESS_TOKEN;

  // প্রথমে দেখি API থেকে কী আসে
  const searchRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/identity/users?per_page=50&page=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const rawData = await searchRes.json();
  
  // সম্পূর্ণ response log করো
  console.log('API Status:', searchRes.status);
  console.log('API Response:', JSON.stringify(rawData));

  // debug হিসেবে response টা পাঠিয়ে দাও
  return Response.json({ 
    debug: true,
    status: searchRes.status,
    data: rawData 
  });
};

export const config = {
  path: '/api/reset-password',
};