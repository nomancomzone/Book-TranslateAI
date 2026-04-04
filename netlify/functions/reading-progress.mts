import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const store = getStore({ name: 'users', consistency: 'strong' });
  const method = req.method;

  if (method === 'POST') {
    const { bookId, progress, lastPosition } = await req.json();
    if (!bookId) return new Response('Book ID required', { status: 400 });

    const userData = await store.get(user.id, { type: 'json' }) as any;
    if (!userData) return new Response('User not found', { status: 404 });

    if (!userData.purchasedBooks?.includes(bookId)) {
      return new Response('Book not purchased', { status: 403 });
    }

    userData.readingProgress = userData.readingProgress || {};
    userData.readingProgress[bookId] = {
      progress: progress || 0,
      lastPosition: lastPosition || 0,
      lastRead: new Date().toISOString(),
    };
    await store.setJSON(user.id, userData);
    return Response.json({ success: true });
  }

  if (method === 'GET') {
    const url = new URL(req.url);
    const bookId = url.searchParams.get('bookId');
    const userData = await store.get(user.id, { type: 'json' }) as any;
    if (!userData) return Response.json({});
    if (bookId) {
      return Response.json(userData.readingProgress?.[bookId] || {});
    }
    return Response.json(userData.readingProgress || {});
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/reading-progress',
  method: ['GET', 'POST'],
};
