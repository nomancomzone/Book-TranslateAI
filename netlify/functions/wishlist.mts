import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const store = getStore({ name: 'users', consistency: 'strong' });
  const userData = await store.get(user.id, { type: 'json' }) as any;
  if (!userData) return new Response('User not found', { status: 404 });

  if (req.method === 'GET') {
    return Response.json(userData.wishlist || []);
  }

  if (req.method === 'POST') {
    const { bookName, authorName, note } = await req.json();
    const wishlist = userData.wishlist || [];
    wishlist.push({
      id: crypto.randomUUID(),
      bookName,
      authorName,
      note: note || '',
      createdAt: new Date().toISOString(),
    });
    userData.wishlist = wishlist;
    await store.setJSON(user.id, userData);
    return Response.json(wishlist);
  }

  if (req.method === 'DELETE') {
    const { id } = await req.json();
    userData.wishlist = (userData.wishlist || []).filter((item: any) => item.id !== id);
    await store.setJSON(user.id, userData);
    return Response.json(userData.wishlist);
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/wishlist',
  method: ['GET', 'POST', 'DELETE'],
};
