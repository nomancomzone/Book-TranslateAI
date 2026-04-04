import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const store = getStore('books');
  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const sort = url.searchParams.get('sort') || 'popular';
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const minRating = url.searchParams.get('minRating');

  try {
    const { blobs } = await store.list();
    const books = [];
    for (const blob of blobs) {
      const book = await store.get(blob.key, { type: 'json' }) as any;
      if (book && book.published !== false) {
        books.push(book);
      }
    }

    let filtered = books;
    if (category) {
      filtered = filtered.filter((b: any) => b.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((b: any) =>
        b.title?.toLowerCase().includes(q) ||
        b.titleBn?.includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.authorBn?.includes(q)
      );
    }
    if (minPrice) {
      filtered = filtered.filter((b: any) => b.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((b: any) => b.price <= Number(maxPrice));
    }
    if (minRating) {
      filtered = filtered.filter((b: any) => b.rating >= Number(minRating));
    }

    if (sort === 'popular') {
      filtered.sort((a: any, b: any) => (b.totalReaders || 0) - (a.totalReaders || 0));
    } else if (sort === 'new') {
      filtered.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sort === 'price-low') {
      filtered.sort((a: any, b: any) => a.price - b.price);
    } else if (sort === 'price-high') {
      filtered.sort((a: any, b: any) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    }

    return Response.json(filtered);
  } catch (error) {
    return Response.json([]);
  }
};

export const config = {
  path: '/api/books',
};
