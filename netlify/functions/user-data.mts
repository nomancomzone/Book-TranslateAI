import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const store = getStore({ name: 'users', consistency: 'strong' });
  const method = req.method;

  if (method === 'GET') {
    const userData = await store.get(user.id, { type: 'json' });
    if (!userData) {
      const newUser = {
        id: user.id,
        email: user.email,
        name: (user as any).user_metadata?.full_name || user.email,
        purchasedBooks: [],
        readingProgress: {},
        bookmarks: {},
        wishlist: [],
        cart: [],
        orders: [],
        createdAt: new Date().toISOString(),
      };
      await store.setJSON(user.id, newUser);
      return Response.json(newUser);
    }
    return Response.json(userData);
  }

  if (method === 'PUT') {
    const body = await req.json();
    const existing = await store.get(user.id, { type: 'json' }) as any || {};
    const updated = { ...existing, ...body, id: user.id, email: user.email };
    await store.setJSON(user.id, updated);
    return Response.json(updated);
  }

  // বই লাইব্রেরিতে যোগ করা
  if (method === 'POST') {
    const { action, bookId } = await req.json();
    const existing = await store.get(user.id, { type: 'json' }) as any || {
      id: user.id,
      email: user.email,
      name: (user as any).user_metadata?.full_name || user.email,
      purchasedBooks: [],
      wishlist: [],
    };

    if (action === 'add-to-library') {
      const purchasedBooks = existing.purchasedBooks || [];
      if (!purchasedBooks.includes(bookId)) {
        purchasedBooks.push(bookId);
      }
      existing.purchasedBooks = purchasedBooks;
      await store.setJSON(user.id, existing);
      return Response.json({ success: true, purchasedBooks });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/user-data',
  method: ['GET', 'PUT', 'POST'],
};