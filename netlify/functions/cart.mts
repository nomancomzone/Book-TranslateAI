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
    return Response.json(userData.cart || []);
  }

  if (req.method === 'POST') {
    const { bookId, action } = await req.json();
    if (!bookId) return new Response('Book ID required', { status: 400 });

    let cart = userData.cart || [];
    if (action === 'add') {
      if (!cart.some((item: any) => item.bookId === bookId)) {
        cart.push({ bookId, quantity: 1 });
      }
    } else if (action === 'remove') {
      cart = cart.filter((item: any) => item.bookId !== bookId);
    } else if (action === 'clear') {
      cart = [];
    }
    userData.cart = cart;
    await store.setJSON(user.id, userData);
    return Response.json(cart);
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/cart',
  method: ['GET', 'POST'],
};
