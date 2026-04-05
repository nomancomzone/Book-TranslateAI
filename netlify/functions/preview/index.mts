import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const bookId = url.searchParams.get('bookId');
  const index = url.searchParams.get('index') || '0';

  if (!bookId) return new Response('Book ID required', { status: 400 });

  const previewStore = getStore('previews');
  const key = `${bookId}-${index}`;
  const image = await previewStore.get(key, { type: 'blob' });

  if (!image) {
    return new Response('Preview not found', { status: 404 });
  }

  return new Response(image, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};

export const config = {
  path: '/api/preview',
};