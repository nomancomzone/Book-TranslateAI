import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const userEmail = req.headers.get('x-user-email');

  if (!userEmail) {
    return new Response('Unauthorized', { status: 401 });
  }

  const storeKey = userEmail.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const store = getStore({ name: 'wishlists', consistency: 'strong' });

  if (req.method === 'GET') {
    try {
      const data = await store.get(storeKey, { type: 'json' }) as any[] || []
      return Response.json(data)
    } catch {
      return Response.json([])
    }
  }

  if (req.method === 'POST') {
    const { bookName, authorName, note } = await req.json();
    if (!bookName) return new Response('Book name required', { status: 400 });

    let wishlist: any[] = []
    try {
      wishlist = await store.get(storeKey, { type: 'json' }) as any[] || []
    } catch {}

    wishlist.push({
      id: crypto.randomUUID(),
      bookName,
      authorName: authorName || '',
      note: note || '',
      userEmail,
      createdAt: new Date().toISOString(),
    });

    await store.setJSON(storeKey, wishlist);
    return Response.json(wishlist);
  }

  if (req.method === 'DELETE') {
    const { id } = await req.json();
    let wishlist: any[] = []
    try {
      wishlist = await store.get(storeKey, { type: 'json' }) as any[] || []
    } catch {}
    wishlist = wishlist.filter((item: any) => item.id !== id)
    await store.setJSON(storeKey, wishlist);
    return Response.json(wishlist);
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/wishlist',
  method: ['GET', 'POST', 'DELETE'],
};