import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const bookId = url.searchParams.get('bookId');
    if (!bookId) return new Response('Book ID required', { status: 400 });
    const store = getStore('reviews');
    const reviews = await store.get(bookId, { type: 'json' }) as any[] || [];
    const approved = reviews.filter((r: any) => r.approved);
    return Response.json(approved);
  }

  if (req.method === 'POST') {
    const user = await getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { bookId, rating, comment } = await req.json();
    if (!bookId || !rating) return new Response('Missing fields', { status: 400 });

    const store = getStore('reviews');
    const existing = await store.get(bookId, { type: 'json' }) as any[] || [];
    const review = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: (user as any).user_metadata?.full_name || user.email || 'Anonymous',
      rating,
      comment: comment || '',
      approved: false,
      createdAt: new Date().toISOString(),
    };
    existing.push(review);
    await store.setJSON(bookId, existing);
    return Response.json(review);
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/reviews',
  method: ['GET', 'POST'],
};
