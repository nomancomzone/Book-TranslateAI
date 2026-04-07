import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const adminPassword = Netlify.env.get('ADMIN_PASSWORD') || 'admin123';
  const authHeader = req.headers.get('x-admin-password');

  if (authHeader !== adminPassword) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action === 'create-book' || action === 'update-book') {
    const bookData = await req.json();
    const bookStore = getStore('books');
    const id = bookData.id || `book-${Date.now()}`;

    // Update হলে আগের data রাখো
    let existing: any = {};
    if (action === 'update-book' && id) {
      existing = await bookStore.get(id, { type: 'json' }) as any || {};
    }

    const book = {
      ...existing,
      ...bookData,
      id,
      updatedAt: new Date().toISOString(),
      // এগুলো existing থেকে রাখো যদি নতুন না আসে
      coverImage: bookData.coverImage || existing.coverImage || '',
      previewImages: bookData.previewImages || existing.previewImages || [],
      totalReaders: existing.totalReaders || 0,
      rating: existing.rating || 0,
      ratingBreakdown: existing.ratingBreakdown || { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 },
      reviews: existing.reviews || [],
    };

    if (action === 'create-book') {
      book.createdAt = new Date().toISOString();
      book.totalReaders = 0;
      book.rating = 0;
      book.ratingBreakdown = { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 };
      book.reviews = [];
    }

    await bookStore.setJSON(id, book);
    return Response.json(book);
  }

  if (action === 'delete-book') {
    const { bookId } = await req.json();
    const bookStore = getStore('books');
    await bookStore.delete(bookId);
    return Response.json({ success: true });
  }

  if (action === 'upload-pdf') {
    const formData = await req.formData();
    const bookId = formData.get('bookId') as string;
    const file = formData.get('pdf') as File;
    if (!bookId || !file) return new Response('Missing data', { status: 400 });
    const pdfStore = getStore('pdfs');
    const buffer = await file.arrayBuffer();
    await pdfStore.set(bookId, buffer, {
      metadata: { contentType: 'application/pdf', fileName: file.name }
    });
    return Response.json({ success: true, url: `/api/pdf?bookId=${bookId}` });
  }

  if (action === 'upload-cover') {
    const formData = await req.formData();
    const bookId = formData.get('bookId') as string;
    const file = formData.get('cover') as File;
    if (!bookId || !file) return new Response('Missing data', { status: 400 });
    const coverStore = getStore('covers');
    const buffer = await file.arrayBuffer();
    await coverStore.set(bookId, buffer, {
      metadata: { contentType: file.type || 'image/jpeg' }
    });

    // Book record এ coverImage URL আপডেট করো
    const bookStore = getStore('books');
    const book = await bookStore.get(bookId, { type: 'json' }) as any;
    if (book) {
      book.coverImage = `/api/cover?bookId=${bookId}`;
      await bookStore.setJSON(bookId, book);
    }

    return Response.json({ url: `/api/cover?bookId=${bookId}` });
  }

  // Preview screenshots upload
  if (action === 'upload-preview') {
    const formData = await req.formData();
    const bookId = formData.get('bookId') as string;
    const files = formData.getAll('previews') as File[];
    if (!bookId || !files.length) return new Response('Missing data', { status: 400 });

    const previewStore = getStore('previews');
    const previewUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = `${bookId}-${i}`;
      const buffer = await file.arrayBuffer();
      await previewStore.set(key, buffer, {
        metadata: { contentType: file.type || 'image/jpeg' }
      });
      previewUrls.push(`/api/preview?bookId=${bookId}&index=${i}`);
    }

    // Book record এ previewImages আপডেট করো
    const bookStore = getStore('books');
    const book = await bookStore.get(bookId, { type: 'json' }) as any;
    if (book) {
      book.previewImages = previewUrls;
      book.previewCount = previewUrls.length;
      await bookStore.setJSON(bookId, book);
    }

    return Response.json({ success: true, urls: previewUrls });
  }

  if (action === 'list-books') {
    const bookStore = getStore('books');
    const { blobs } = await bookStore.list();
    const books = [];
    for (const blob of blobs) {
      const book = await bookStore.get(blob.key, { type: 'json' });
      if (book) books.push(book);
    }
    return Response.json(books);
  }

  if (action === 'list-users') {
    const userStore = getStore('users');
    const { blobs } = await userStore.list();
    const users = [];
    for (const blob of blobs) {
      const user = await userStore.get(blob.key, { type: 'json' });
      if (user) users.push(user);
    }
    return Response.json(users);
  }

  if (action === 'sales-report') {
    const salesStore = getStore('sales');
    const { blobs } = await salesStore.list();
    const reports = [];
    for (const blob of blobs) {
      const report = await salesStore.get(blob.key, { type: 'json' });
      if (report) reports.push(report);
    }
    reports.sort((a: any, b: any) => b.date.localeCompare(a.date));
    return Response.json(reports);
  }

  if (action === 'list-wishlists') {
    const wishlistStore = getStore('wishlists');
    const { blobs } = await wishlistStore.list();
    const allWishlists: any[] = [];
    for (const blob of blobs) {
      const items = await wishlistStore.get(blob.key, { type: 'json' }) as any[] || [];
      for (const item of items) {
        allWishlists.push(item);
      }
    }
    allWishlists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Response.json(allWishlists);
  }

  if (action === 'manage-review') {
    const { bookId, reviewId, approved, deleteReview } = await req.json();
    const reviewStore = getStore('reviews');
    const reviews = await reviewStore.get(bookId, { type: 'json' }) as any[] || [];
    if (deleteReview) {
      const filtered = reviews.filter((r: any) => r.id !== reviewId);
      await reviewStore.setJSON(bookId, filtered);
      return Response.json(filtered);
    }
   const review = reviews.find((r: any) => r.id === reviewId);
    if (review) {
      review.approved = approved;
      await reviewStore.setJSON(bookId, reviews);
    }
    return Response.json(reviews);
  }

  if (action === 'delete-user') {
    const { userId } = await req.json();
    const userStore = getStore('users');
    await userStore.delete(userId);
    return Response.json({ success: true });
  }

  if (action === 'list-orders') {
    const orderStore = getStore('orders');
    const { blobs } = await orderStore.list();
    const orders = [];
    for (const blob of blobs) {
      const order = await orderStore.get(blob.key, { type: 'json' });
      if (order) orders.push(order);
    }
    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Response.json(orders);
  }

  return new Response('Unknown action', { status: 400 });
};

export const config = {
  path: '/api/admin',
};