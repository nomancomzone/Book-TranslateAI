import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

export default async (req: Request, context: Context) => {
  const formData = await req.formData();
  const status = formData.get('status') as string;
  const tranId = formData.get('tran_id') as string;
  const valId = formData.get('val_id') as string;
  const cardType = formData.get('card_type') as string;

  const siteUrl = Netlify.env.get('URL') || 'http://localhost:8888';
  const orderStore = getStore({ name: 'orders', consistency: 'strong' });
  const userStore = getStore({ name: 'users', consistency: 'strong' });

  if (!tranId) {
    return Response.redirect(`${siteUrl}/payment-result?status=failed`);
  }

  const order = await orderStore.get(tranId, { type: 'json' }) as any;
  if (!order) {
    return Response.redirect(`${siteUrl}/payment-result?status=failed`);
  }

  if (status === 'VALID' || status === 'VALIDATED') {
    order.paymentStatus = 'completed';
    order.paymentMethod = cardType || 'unknown';
    order.transactionId = valId || '';
    await orderStore.setJSON(tranId, order);

    const userData = await userStore.get(order.userId, { type: 'json' }) as any;
    if (userData) {
      const bookIds = order.items.map((item: any) => item.bookId);
      userData.purchasedBooks = [...new Set([...(userData.purchasedBooks || []), ...bookIds])];
      userData.orders = [...(userData.orders || []), tranId];
      userData.cart = [];
      await userStore.setJSON(order.userId, userData);
    }

    // Update sales report
    const salesStore = getStore('sales');
    const today = new Date().toISOString().split('T')[0];
    const dailySales = await salesStore.get(today, { type: 'json' }) as any || { date: today, totalSales: 0, totalRevenue: 0, orders: [] };
    dailySales.totalSales += 1;
    dailySales.totalRevenue += order.totalAmount;
    dailySales.orders.push(tranId);
    await salesStore.setJSON(today, dailySales);

    // Update book reader count
    const bookStore = getStore('books');
    for (const item of order.items) {
      const book = await bookStore.get(item.bookId, { type: 'json' }) as any;
      if (book) {
        book.totalReaders = (book.totalReaders || 0) + 1;
        await bookStore.setJSON(item.bookId, book);
      }
    }

    return Response.redirect(`${siteUrl}/payment-result?status=success&orderId=${tranId}`);
  } else {
    order.paymentStatus = 'failed';
    await orderStore.setJSON(tranId, order);
    return Response.redirect(`${siteUrl}/payment-result?status=failed&orderId=${tranId}`);
  }
};

export const config = {
  path: '/api/payment-callback',
  method: ['POST'],
};
