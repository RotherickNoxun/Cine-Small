import { SEED_MOVIES, SEED_ORDERS, SEED_PRODUCTS } from '@/data/seed';
import type {
  CartItem,
  ContactMessage,
  Movie,
  Order,
  Product,
} from '@/types/ecommerce';

const KEYS = {
  PRODUCTS: 'cinesmall_products_v2',
  MOVIES: 'cinesmall_movies_v2',
  ORDERS: 'cinesmall_orders_v2',
  CART: 'cinesmall_cart_v2',
  MESSAGES: 'cinesmall_messages_v2',
} as const;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadProducts(): Product[] {
  const existing = safeParse<Product[] | null>(
    localStorage.getItem(KEYS.PRODUCTS),
    null
  );
  if (!existing || existing.length === 0) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
  return existing;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

export function loadOrders(): Order[] {
  const existing = safeParse<Order[] | null>(
    localStorage.getItem(KEYS.ORDERS),
    null
  );
  if (!existing || existing.length === 0) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    return SEED_ORDERS;
  }
  return existing;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
}

export function generateNextOrderId(orders: Order[]): string {
  const year = new Date().getFullYear();
  let maxSeq = 0;
  for (const order of orders) {
    const match = order.id.match(/#?CS-\d{4}-(\d+)/i);
    if (match) {
      const seq = Number.parseInt(match[1], 10);
      if (!Number.isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  const next = String(maxSeq + 1).padStart(3, '0');
  return `#CS-${year}-${next}`;
}

export function loadCart(): CartItem[] {
  return safeParse<CartItem[]>(localStorage.getItem(KEYS.CART), []);
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(KEYS.CART, JSON.stringify(items));
}

export function loadContactMessages(): ContactMessage[] {
  return safeParse<ContactMessage[]>(localStorage.getItem(KEYS.MESSAGES), []);
}

export function saveContactMessage(msg: ContactMessage): ContactMessage[] {
  const current = loadContactMessages();
  const next = [msg, ...current];
  localStorage.setItem(KEYS.MESSAGES, JSON.stringify(next));
  return next;
}

export function loadMovies(): Movie[] {
  const existing = safeParse<Movie[] | null>(
    localStorage.getItem(KEYS.MOVIES),
    null
  );
  if (!existing || existing.length === 0) {
    localStorage.setItem(KEYS.MOVIES, JSON.stringify(SEED_MOVIES));
    return SEED_MOVIES;
  }
  return existing;
}

export function saveMovies(movies: Movie[]): void {
  localStorage.setItem(KEYS.MOVIES, JSON.stringify(movies));
}
