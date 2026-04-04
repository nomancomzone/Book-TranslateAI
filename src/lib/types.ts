export interface Book {
  id: string;
  title: string;
  titleBn: string;
  author: string;
  authorBn: string;
  price: number;
  originalPrice?: number;
  coverImage: string;
  category: string;
  categoryBn: string;
  tags: string[];
  tagsBn: string[];
  mainMessage: string;
  mainMessageBn: string;
  summary: string;
  summaryBn: string;
  keyPoints: string[];
  keyPointsBn: string[];
  targetAudience: string;
  targetAudienceBn: string;
  readingTime: string;
  mood: 'motivational' | 'sad' | 'funny' | 'informative' | 'thriller' | 'romantic';
  moodBn: string;
  quotes: { text: string; textBn: string }[];
  aboutAuthor: string;
  aboutAuthorBn: string;
  totalReaders: number;
  rating: number;
  ratingBreakdown: { star5: number; star4: number; star3: number; star2: number; star1: number };
  reviews: Review[];
  relatedBookIds: string[];
  previewPages: string[];
  epubKey: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface CartItem {
  bookId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: { bookId: string; title: string; price: number }[];
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  purchasedBooks: string[];
  readingProgress: Record<string, { progress: number; lastPosition: number; lastRead: string }>;
  bookmarks: Record<string, { position: number; note: string; createdAt: string }[]>;
  wishlist: WishlistItem[];
  cart: CartItem[];
  orders: string[];
  devices: { deviceId: string; lastActive: string }[];
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  bookName: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export interface SalesReport {
  date: string;
  totalSales: number;
  totalRevenue: number;
  orders: string[];
}

export type Category = {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: 'islamic', name: 'Islamic', nameBn: 'ইসলামিক', icon: '🕌' },
  { id: 'novel', name: 'Novel', nameBn: 'উপন্যাস', icon: '📖' },
  { id: 'science', name: 'Science', nameBn: 'বিজ্ঞান', icon: '🔬' },
  { id: 'history', name: 'History', nameBn: 'ইতিহাস', icon: '🏛️' },
  { id: 'children', name: 'Children', nameBn: 'শিশু-কিশোর', icon: '🧒' },
  { id: 'biography', name: 'Biography', nameBn: 'জীবনী', icon: '👤' },
  { id: 'selfhelp', name: 'Self-help', nameBn: 'আত্মউন্নয়ন', icon: '🌟' },
  { id: 'poetry', name: 'Poetry', nameBn: 'কবিতা', icon: '✍️' },
  { id: 'thriller', name: 'Thriller', nameBn: 'থ্রিলার', icon: '🔍' },
  { id: 'religion', name: 'Religion', nameBn: 'ধর্ম', icon: '📿' },
  { id: 'technology', name: 'Technology', nameBn: 'প্রযুক্তি', icon: '💻' },
  { id: 'travel', name: 'Travel', nameBn: 'ভ্রমণ', icon: '✈️' },
];
