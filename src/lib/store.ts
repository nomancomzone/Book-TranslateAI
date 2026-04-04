import { Store } from '@tanstack/store';
import type { CartItem } from './types';

interface AppState {
  cart: CartItem[];
  isCartOpen: boolean;
  searchQuery: string;
  selectedCategory: string | null;
}

export const appStore = new Store<AppState>({
  cart: [],
  isCartOpen: false,
  searchQuery: '',
  selectedCategory: null,
});

export function addToCart(bookId: string) {
  appStore.setState((state) => {
    const existing = state.cart.find((item) => item.bookId === bookId);
    if (existing) return state;
    return { ...state, cart: [...state.cart, { bookId, quantity: 1 }] };
  });
  saveCartToStorage();
}

export function removeFromCart(bookId: string) {
  appStore.setState((state) => ({
    ...state,
    cart: state.cart.filter((item) => item.bookId !== bookId),
  }));
  saveCartToStorage();
}

export function clearCart() {
  appStore.setState((state) => ({ ...state, cart: [] }));
  saveCartToStorage();
}

export function toggleCart() {
  appStore.setState((state) => ({ ...state, isCartOpen: !state.isCartOpen }));
}

export function setSearchQuery(query: string) {
  appStore.setState((state) => ({ ...state, searchQuery: query }));
}

export function setSelectedCategory(category: string | null) {
  appStore.setState((state) => ({ ...state, selectedCategory: category }));
}

function saveCartToStorage() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('boipoka-cart', JSON.stringify(appStore.state.cart));
  }
}

export function loadCartFromStorage() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('boipoka-cart');
    if (saved) {
      try {
        const cart = JSON.parse(saved) as CartItem[];
        appStore.setState((state) => ({ ...state, cart }));
      } catch { /* ignore */ }
    }
  }
}
