import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { email, type } = await req.json();
  if (!email) return new Response('Email required', { status: 400 });

  const apiKey = Netlify.env.get('RESEND_API_KEY');
  if (!apiKey) return new Response('Email service not configured', { status: 503 });

  // Signup হলে existing user check করো
  if (type !== 'reset') {
    const siteId = Netlify.env.get('NETLIFY_SITE_ID') || '';
    const adminToken = Netlify.env.get('NETLIFY_ACCESS_TOKEN') || '';
    if (siteId && adminToken) {
      try {
        const checkRes = await fetch(
          `https://api.netlify.com/api/v1/sites/${siteId}/identity/users?q=${encodeURIComponent(email)}`,
          { headers: { 'Authorization': `Bearer ${adminToken}` } }
        );
        if (checkRes.ok) {
          const data = await checkRes.json();
          if (data?.users?.length > 0) {
            return Response.json({
              success: false,
              exists: true,
              message: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে! লগইন করুন।'
            }, { status: 400 });
          }
        }
      } catch {}
    }
  }

  // Reset হলে user exist করতে হবে
  if (type === 'reset') {
    const siteId = Netlify.env.get('SITE_ID') || '';
    const adminToken = Netlify.env.get('NETLIFY_ACCESS_TOKEN') || '';
    if (siteId && adminToken) {
      try {
        const checkRes = await fetch(
          `https://api.netlify.com/api/v1/sites/${siteId}/identity/users?q=${encodeURIComponent(email)}`,
          { headers: { 'Authorization': `Bearer ${adminToken}` } }
        );
        if (checkRes.ok) {
          const data = await checkRes.json();
          if (!data?.users?.length) {
            return Response.json({
              success: false,
              message: 'এই email দিয়ে কোনো account নেই!'
            }, { status: 400 });
          }
        }
      } catch {}
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  const store = getStore('otps');
  const storeKey = type === 'reset' ? `reset_${email}` : email;
  await store.setJSON(storeKey, { otp, expiresAt });

  const subject = type === 'reset' ? 'TranslatedBook - পাসওয়ার্ড রিসেট OTP' : 'TranslatedBook - আপনার OTP কোড';
  const title = type === 'reset' ? '🔐 পাসওয়ার্ড রিসেট' : '✅ অ্যাকাউন্ট যাচাইকরণ';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'TranslatedBook <noreply@translatedbook.com>',
      to: [email],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <div style="background: #1877F2; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 TranslatedBook</h1>
            <p style="color: #e0e0e0; margin: 5px 0 0 0; font-size: 14px;">Bengali eBook Store</p>
          </div>
          <div style="background: #f8f9fa; padding: 24px; border-radius: 12px; text-align: center;">
            <p style="color: #333; font-size: 18px; font-weight: bold; margin-bottom: 8px;">${title}</p>
            <p style="color: #333; font-size: 16px; margin-bottom: 16px;">আপনার OTP কোড:</p>
            <div style="background: white; border: 2px solid #1877F2; border-radius: 8px; padding: 16px; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; color: #1877F2; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 16px;">এই কোড <strong>১০ মিনিট</strong> পর্যন্ত valid।</p>
            <p style="color: #999; font-size: 12px;">আপনি এই email request করেননি? এটি ignore করুন।</p>
          </div>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Resend error:', err);
    return new Response('Failed to send email', { status: 500 });
  }

  return Response.json({ success: true, message: 'OTP পাঠানো হয়েছে' });
};

export const config = {
  path: '/api/send-otp',
};