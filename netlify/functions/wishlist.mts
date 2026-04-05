import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const store = getStore({ name: 'users', consistency: 'strong' });

  // Auth token থেকে user বের করা
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Token দিয়ে user খোঁজা
  let userId = '';
  let userData: any = null;

  const { blobs } = await store.list();
  for (const blob of blobs) {
    const u = await store.get(blob.key, { type: 'json' }) as any;
    if (u?.token === token || u?.email) {
      userId = blob.key;
      userData = u;
      break;
    }
  }

  // যদি user না পাওয়া যায় তাহলে নতুন entry বানাও
  if (!userData) {
    // Cookie বা header থেকে email নাও
    const email = req.headers.get('x-user-email') || '';
    if (!email) return new Response('Unauthorized', { status: 401 });

    userId = email.replace(/[^a-z0-9]/gi, '-');
    userData = { email, wishlist: [] };
  }

  if (req.method === 'GET') {
    return Response.json(userData.wishlist || []);
  }

  if (req.method === 'POST') {
    const { bookName, authorName, note } = await req.json();
    if (!bookName) return new Response('Book name required', { status: 400 });

    const wishlist = userData.wishlist || [];
    wishlist.push({
      id: crypto.randomUUID(),
      bookName,
      authorName: authorName || '',
      note: note || '',
      createdAt: new Date().toISOString(),
    });
    userData.wishlist = wishlist;
    await store.setJSON(userId, userData);
    return Response.json(wishlist);
  }

  if (req.method === 'DELETE') {
    const { id } = await req.json();
    userData.wishlist = (userData.wishlist || []).filter((item: any) => item.id !== id);
    await store.setJSON(userId, userData);
    return Response.json(userData.wishlist);
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/wishlist',
  method: ['GET', 'POST', 'DELETE'],
};