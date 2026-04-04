import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const bookId = url.searchParams.get('bookId');
  if (!bookId) return new Response('Book ID required', { status: 400 });

  const coverStore = getStore('covers');
  const cover = await coverStore.get(bookId, { type: 'blob' });
  if (!cover) {
    return new Response('Cover not found', { status: 404 });
  }

  return new Response(cover, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};

export const config = {
  path: '/api/cover',
};
