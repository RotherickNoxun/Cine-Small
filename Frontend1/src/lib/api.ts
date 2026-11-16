import axios from 'axios';
import {
  generateNextOrderId,
  loadContactMessages,
  loadMovies,
  loadOrders,
  loadProducts,
  saveContactMessage,
  saveMovies,
  saveOrders,
  saveProducts,
} from '@/lib/storage';
import { normalizeOrderId } from '@/lib/format';
import type {
  ContactMessage,
  Movie,
  Order,
  OrderReceipt,
  OrderStatus,
  PaymentStatus,
  Product,
} from '@/types/ecommerce';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.cinesmall.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Brand': 'CineSmall',
  },
});

export async function fetchProducts(): Promise<Product[]> {
  return loadProducts();
}

export async function upsertProduct(product: Product): Promise<Product[]> {
  const current = loadProducts();
  const exists = current.some((p) => p.id === product.id);
  const updated = exists
    ? current.map((p) => (p.id === product.id ? product : p))
    : [product, ...current];
  saveProducts(updated);
  return updated;
}

export async function fetchOrders(): Promise<Order[]> {
  return loadOrders();
}

export async function fetchOrderById(rawOrderId: string): Promise<Order | null> {
  const target = normalizeOrderId(rawOrderId);
  const orders = loadOrders();
  return orders.find((o) => normalizeOrderId(o.id) === target) ?? null;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  items: Order['items'];
}

export async function createOrderRecord(input: CreateOrderInput): Promise<Order> {
  const orders = loadOrders();
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const newOrder: Order = {
    id: generateNextOrderId(orders),
    createdAt: new Date().toISOString(),
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    address: input.address.trim(),
    notes: input.notes?.trim() || undefined,
    items: input.items,
    subtotal,
    total: subtotal,
    paymentStatus: 'PENDIENTE',
    orderStatus: 'PENDIENTE',
  };
  const updated = [newOrder, ...orders];
  saveOrders(updated);
  return newOrder;
}

export async function attachOrderReceipt(
  rawOrderId: string,
  receipt: OrderReceipt
): Promise<Order | null> {
  const target = normalizeOrderId(rawOrderId);
  const orders = loadOrders();
  let updatedOrder: Order | null = null;
  const nextOrders = orders.map((order) => {
    if (normalizeOrderId(order.id) === target) {
      updatedOrder = {
        ...order,
        receipt,
        paymentStatus: 'COMPROBANTE_ENVIADO',
      };
      return updatedOrder;
    }
    return order;
  });
  saveOrders(nextOrders);
  return updatedOrder;
}

export async function updateOrderStatuses(
  rawOrderId: string,
  patch: { paymentStatus?: PaymentStatus; orderStatus?: OrderStatus }
): Promise<Order | null> {
  const target = normalizeOrderId(rawOrderId);
  const orders = loadOrders();
  let updatedOrder: Order | null = null;
  const nextOrders = orders.map((order) => {
    if (normalizeOrderId(order.id) === target) {
      updatedOrder = {
        ...order,
        ...patch,
      };
      return updatedOrder;
    }
    return order;
  });
  saveOrders(nextOrders);
  return updatedOrder;
}

export async function submitContactMessage(
  payload: Omit<ContactMessage, 'id' | 'createdAt'>
): Promise<ContactMessage> {
  const created: ContactMessage = {
    ...payload,
    id: `MSG-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveContactMessage(created);
  return created;
}

export function getStoredMessages(): ContactMessage[] {
  return loadContactMessages();
}


export async function fetchMovies(): Promise<Movie[]> {
  return loadMovies();
}

export async function upsertMovie(movie: Movie): Promise<Movie[]> {
  const current = loadMovies();
  const exists = current.some((m) => m.id === movie.id);
  const updated = exists
    ? current.map((m) => (m.id === movie.id ? movie : m))
    : [movie, ...current];
  saveMovies(updated);
  return updated;
}

export async function deleteMovie(movieId: string): Promise<Movie[]> {
  const updated = loadMovies().filter((m) => m.id !== movieId);
  saveMovies(updated);
  return updated;
}

export async function reserveShowtimeSeats(
  movieId: string,
  showtimeId: string,
  seats: string[]
): Promise<Movie[]> {
  const current = loadMovies();
  const updated = current.map((movie) => {
    if (movie.id !== movieId) return movie;
    return {
      ...movie,
      showtimes: movie.showtimes.map((st) => {
        if (st.id !== showtimeId) return st;
        const merged = Array.from(new Set([...st.occupiedSeats, ...seats]));
        return { ...st, occupiedSeats: merged };
      }),
    };
  });
  saveMovies(updated);
  return updated;
}
