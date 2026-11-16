import {
  DEFAULT_STORE_SETTINGS,
  SEED_CATEGORIES,
  SEED_NOTIFICATIONS,
  SEED_ORDERS,
  SEED_PRODUCTS,
} from '@/data/seed';
import type {
  AdminNotification,
  CategoryItem,
  Order,
  Product,
  StoreSettings,
} from '@/types/ecommerce';

export const STORAGE_KEYS = {
  PRODUCTS: 'cinesmall_products_v2',
  MOVIES: 'cinesmall_movies_v2',
  ORDERS: 'cinesmall_orders_v2',
  CATEGORIES: 'cinesmall_categories_v2',
  SETTINGS: 'cinesmall_settings_v2',
  NOTIFICATIONS: 'cinesmall_admin_notifications_v2',
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
    localStorage.getItem(STORAGE_KEYS.PRODUCTS),
    null
  );
  if (!existing || existing.length === 0) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
  return existing;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export function loadOrders(): Order[] {
  const existing = safeParse<Order[] | null>(
    localStorage.getItem(STORAGE_KEYS.ORDERS),
    null
  );
  if (!existing || existing.length === 0) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    return SEED_ORDERS;
  }
  return existing;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function loadCategories(): CategoryItem[] {
  const existing = safeParse<CategoryItem[] | null>(
    localStorage.getItem(STORAGE_KEYS.CATEGORIES),
    null
  );
  if (!existing || existing.length === 0) {
    localStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(SEED_CATEGORIES)
    );
    return SEED_CATEGORIES;
  }
  return existing;
}

export function saveCategories(categories: CategoryItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function loadStoreSettings(): StoreSettings {
  const existing = safeParse<StoreSettings | null>(
    localStorage.getItem(STORAGE_KEYS.SETTINGS),
    null
  );
  if (!existing || !existing.qrImageUrl) {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(DEFAULT_STORE_SETTINGS)
    );
    return DEFAULT_STORE_SETTINGS;
  }
  return existing;
}

export function saveStoreSettings(settings: StoreSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadAdminNotifications(): AdminNotification[] {
  const existing = safeParse<AdminNotification[] | null>(
    localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
    null
  );
  if (!existing) {
    localStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(SEED_NOTIFICATIONS)
    );
    return SEED_NOTIFICATIONS;
  }
  return existing;
}

export function saveAdminNotifications(notifications: AdminNotification[]): void {
  localStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS,
    JSON.stringify(notifications)
  );
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

export function resetAllDemoStorage(): void {
  saveProducts(SEED_PRODUCTS);
  saveOrders(SEED_ORDERS);
  saveCategories(SEED_CATEGORIES);
  saveStoreSettings(DEFAULT_STORE_SETTINGS);
  saveAdminNotifications(SEED_NOTIFICATIONS);
}

