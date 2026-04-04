import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response('Book ID required', { status: 400 });

  try {
    const store = getStore('books');
    const book = await store.get(id, { type: 'json' });
    if (!book) return new Response('Book not found', { status: 404 });
    return Response.json(book);
  } catch {
    return new Response('Error fetching book', { status: 500 });
  }
};

export const config = {
  path: '/api/books/detail',
};
