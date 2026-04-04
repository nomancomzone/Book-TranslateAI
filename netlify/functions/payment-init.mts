import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { items, totalAmount } = await req.json();
  if (!items?.length || !totalAmount) return new Response('Invalid order', { status: 400 });

  const orderId = `ORD-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const orderStore = getStore({ name: 'orders', consistency: 'strong' });

  const order = {
    id: orderId,
    userId: user.id,
    userEmail: user.email,
    items,
    totalAmount,
    paymentStatus: 'pending' as const,
    paymentMethod: '',
    transactionId: '',
    createdAt: new Date().toISOString(),
  };
  await orderStore.setJSON(orderId, order);

  const storeId = Netlify.env.get('SSLCOMMERZ_STORE_ID') || 'testbox';
  const storePass = Netlify.env.get('SSLCOMMERZ_STORE_PASSWORD') || 'qwerty';
  const isLive = Netlify.env.get('SSLCOMMERZ_IS_LIVE') === 'true';
  const baseUrl = isLive ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';
  const siteUrl = Netlify.env.get('URL') || 'http://localhost:8888';

  const params = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePass,
    total_amount: totalAmount.toString(),
    currency: 'BDT',
    tran_id: orderId,
    success_url: `${siteUrl}/api/payment-callback`,
    fail_url: `${siteUrl}/api/payment-callback`,
    cancel_url: `${siteUrl}/api/payment-callback`,
    cus_name: (user as any).user_metadata?.full_name || 'Customer',
    cus_email: user.email || '',
    cus_phone: '01700000000',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: 'eBooks',
    product_category: 'Digital',
    product_profile: 'non-physical-goods',
  });

  try {
    const response = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await response.json();

    if (data.status === 'SUCCESS') {
      return Response.json({ paymentUrl: data.GatewayPageURL, orderId });
    }
    return Response.json({ error: 'Payment initialization failed', details: data }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'Payment service unavailable' }, { status: 503 });
  }
};

export const config = {
  path: '/api/payment-init',
};
