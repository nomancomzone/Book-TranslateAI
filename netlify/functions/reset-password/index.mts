import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, newPassword, otp } = await req.json();
  if (!email || !newPassword || !otp) return new Response('Missing fields', { status: 400 });

  // OTP verify করো
  const otpStore = getStore('otps');
  let stored: any = null;
  try {
    stored = await otpStore.get(`reset_${email}`, { type: 'json' });
  } catch {
    return Response.json({ success: false, message: 'OTP পাওয়া যায়নি' }, { status: 400 });
  }

  if (!stored) return Response.json({ success: false, message: 'OTP পাওয়া যায়নি বা মেয়াদ শেষ' }, { status: 400 });
  if (Date.now() > stored.expiresAt) {
    await otpStore.delete(`reset_${email}`);
    return Response.json({ success: false, message: 'OTP এর মেয়াদ শেষ হয়ে গেছে' }, { status: 400 });
  }
  if (stored.otp !== otp.toString()) {
    return Response.json({ success: false, message: 'ভুল OTP' }, { status: 400 });
  }

  // OTP সঠিক — Netlify Identity তে password update করো
  const siteId = Netlify.env.get('SITE_ID') || '';
  const adminToken = Netlify.env.get('NETLIFY_ACCESS_TOKEN') || '';

  if (!siteId || !adminToken) {
    return Response.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  // User খুঁজো
  const searchRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/identity/users?q=${encodeURIComponent(email)}`,
    { headers: { 'Authorization': `Bearer ${adminToken}` } }
  );

  if (!searchRes.ok) return Response.json({ success: false, message: 'User খুঁজে পাওয়া যায়নি' }, { status: 400 });

  const data = await searchRes.json();
  if (!data?.users?.length) return Response.json({ success: false, message: 'এই email দিয়ে কোনো account নেই' }, { status: 400 });

  const userId = data.users[0].id;

  // Password update করো
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

  if (!updateRes.ok) return Response.json({ success: false, message: 'Password update করতে সমস্যা হয়েছে' }, { status: 500 });

  // OTP delete করো
  await otpStore.delete(`reset_${email}`);

  return Response.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
};

export const config = {
  path: '/api/reset-password',
};