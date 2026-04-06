import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, otp } = await req.json();
  if (!email || !otp) return new Response('Email and OTP required', { status: 400 });

  const store = getStore('otps');

  let stored: any = null;
  try {
    stored = await store.get(email, { type: 'json' });
  } catch {
    return Response.json({ success: false, message: 'OTP পাওয়া যায়নি' }, { status: 400 });
  }

  if (!stored) {
    return Response.json({ success: false, message: 'OTP পাওয়া যায়নি বা মেয়াদ শেষ' }, { status: 400 });
  }

  if (Date.now() > stored.expiresAt) {
    await store.delete(email);
    return Response.json({ success: false, message: 'OTP এর মেয়াদ শেষ হয়ে গেছে' }, { status: 400 });
  }

  if (stored.otp !== otp.toString()) {
    return Response.json({ success: false, message: 'ভুল OTP' }, { status: 400 });
  }

  // OTP সঠিক — delete করো
  await store.delete(email);

  return Response.json({ success: true, message: 'OTP যাচাই সফল' });
};

export const config = {
  path: '/api/verify-otp',
};