import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const bookId = url.searchParams.get('bookId');

  if (!bookId) {
    return new Response('Missing bookId', { status: 400 });
  }

  const pdfStore = getStore('pdfs');
  const pdf = await pdfStore.get(bookId, { type: 'arrayBuffer' });

  if (!pdf) {
    return new Response('PDF not found', { status: 404 });
  }

  // Preview mode - শুধু প্রথম কিছু bytes দেবো (paid check পরে যোগ হবে)
  const isPaid = req.headers.get('x-user-paid') === 'true';
  const isPreview = url.searchParams.get('preview') === 'true';

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline', // download হবে না
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-store',
    },
  });
};

export const config = {
  path: '/api/pdf',
};