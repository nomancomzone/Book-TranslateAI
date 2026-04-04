import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const bookId = url.searchParams.get('bookId');
  const preview = url.searchParams.get('preview') === 'true';

  if (!bookId) return new Response('Book ID required', { status: 400 });

  const bookStore = getStore('books');
  const book = await bookStore.get(bookId, { type: 'json' }) as any;
  if (!book) return new Response('Book not found', { status: 404 });

  if (preview) {
    return Response.json({
      content: book.previewPages || [],
      isPreview: true,
      totalPages: book.previewPages?.length || 0,
    });
  }

  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const userStore = getStore({ name: 'users', consistency: 'strong' });
  const userData = await userStore.get(user.id, { type: 'json' }) as any;

  if (!userData?.purchasedBooks?.includes(bookId)) {
    return new Response('Book not purchased', { status: 403 });
  }

  // Check device limit (max 2)
  const deviceId = url.searchParams.get('deviceId') || 'unknown';
  const now = new Date();
  let devices = (userData.devices || []).filter((d: any) => {
    const lastActive = new Date(d.lastActive);
    return now.getTime() - lastActive.getTime() < 30 * 60 * 1000; // 30 min active
  });

  const existingDevice = devices.find((d: any) => d.deviceId === deviceId);
  if (!existingDevice && devices.length >= 2) {
    return new Response('Maximum 2 devices allowed', { status: 429 });
  }

  if (existingDevice) {
    existingDevice.lastActive = now.toISOString();
  } else {
    devices.push({ deviceId, lastActive: now.toISOString() });
  }
  userData.devices = devices;
  await userStore.setJSON(user.id, userData);

  // Serve content with watermark info
  const contentStore = getStore('book-content');
  const content = await contentStore.get(bookId, { type: 'text' });

  return Response.json({
    content: content || '',
    watermark: user.email,
    isPreview: false,
  });
};

export const config = {
  path: '/api/book-content',
};
