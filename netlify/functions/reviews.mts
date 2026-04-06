import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const bookId = url.searchParams.get('bookId');
    if (!bookId) return new Response('Book ID required', { status: 400 });
    const store = getStore('reviews');
    try {
      const reviews = await store.get(bookId, { type: 'json' }) as any[] || [];
      return Response.json(reviews.filter((r: any) => r.approved !== false));
    } catch {
      return Response.json([]);
    }
  }

  if (req.method === 'POST') {
    const userEmail = req.headers.get('x-user-email');
    const userName = req.headers.get('x-user-name');
    if (!userEmail) return new Response('Unauthorized', { status: 401 });

    const { bookId, rating, comment, editId } = await req.json();
    if (!bookId || !rating) return new Response('Missing fields', { status: 400 });

    const store = getStore('reviews');
    let existing: any[] = [];
    try {
      existing = await store.get(bookId, { type: 'json' }) as any[] || [];
    } catch {}

    let updatedReview: any;

    if (editId) {
      // Edit existing review — পুরনোটা replace করো
      const index = existing.findIndex((r: any) => r.id === editId && r.userEmail === userEmail)
      if (index !== -1) {
        existing[index] = {
          ...existing[index],
          rating,
          comment,
          updatedAt: new Date().toISOString(),
        }
        updatedReview = existing[index]
      } else {
        return new Response('Review not found', { status: 404 })
      }
    } else {
      // New review
      updatedReview = {
        id: crypto.randomUUID(),
        userEmail,
        userName: userName || userEmail,
        rating,
        comment: comment || '',
        approved: true,
        createdAt: new Date().toISOString(),
      }
      existing.push(updatedReview)
    }

    await store.setJSON(bookId, existing);

    // Book rating update
    const bookStore = getStore('books');
    try {
      const book = await bookStore.get(bookId, { type: 'json' }) as any;
      if (book) {
        const allReviews = existing.filter((r: any) => r.approved !== false);
        const totalRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
        book.rating = allReviews.length > 0 ? totalRating / allReviews.length : 0;
        const breakdown = { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 };
        allReviews.forEach((r: any) => {
          const key = `star${r.rating}` as keyof typeof breakdown;
          if (breakdown[key] !== undefined) breakdown[key]++;
        });
        book.ratingBreakdown = breakdown;
        await bookStore.setJSON(bookId, book);
      }
    } catch {}

    return Response.json(updatedReview);
  }

  // DELETE review
  if (req.method === 'DELETE') {
    const userEmail = req.headers.get('x-user-email');
    if (!userEmail) return new Response('Unauthorized', { status: 401 });

    const { bookId, reviewId } = await req.json();
    if (!bookId || !reviewId) return new Response('Missing fields', { status: 400 });

    const store = getStore('reviews');
    let existing: any[] = [];
    try {
      existing = await store.get(bookId, { type: 'json' }) as any[] || [];
    } catch {}

    // শুধু নিজের review delete করতে পারবে
    const review = existing.find((r: any) => r.id === reviewId)
    if (!review) return new Response('Review not found', { status: 404 })
    if (review.userEmail !== userEmail) return new Response('Forbidden', { status: 403 })

    existing = existing.filter((r: any) => r.id !== reviewId)
    await store.setJSON(bookId, existing);

    // Rating update
    const bookStore = getStore('books');
    try {
      const book = await bookStore.get(bookId, { type: 'json' }) as any;
      if (book) {
        const allReviews = existing.filter((r: any) => r.approved !== false);
        book.rating = allReviews.length > 0 ? allReviews.reduce((s: number, r: any) => s + r.rating, 0) / allReviews.length : 0;
        const breakdown = { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 };
        allReviews.forEach((r: any) => {
          const key = `star${r.rating}` as keyof typeof breakdown;
          if (breakdown[key] !== undefined) breakdown[key]++;
        });
        book.ratingBreakdown = breakdown;
        await bookStore.setJSON(bookId, book);
      }
    } catch {}

    return Response.json({ success: true });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = {
  path: '/api/reviews',
  method: ['GET', 'POST', 'DELETE'],
};