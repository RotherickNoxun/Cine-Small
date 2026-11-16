import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { loadCart, saveCart } from '@/lib/storage';
import type { CartItem, Product } from '@/types/ecommerce';

interface StoreContextValue {
  cart: CartItem[];
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  selectedProduct: Product | null;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openProductDetail = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);
  const closeProductDetail = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const safeQty = Math.max(1, quantity);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + safeQty }
            : item
        );
      }
      return [...prev, { product, quantity: safeQty }];
    });

    toast.success(`${product.name} agregado al carrito`, {
      description:
        product.type === 'SERVICIO'
          ? `Servicio / Alquiler · Cantidad: ${safeQty}`
          : `Producto Estándar · Cantidad: ${safeQty}`,
      action: {
        label: 'Ver carrito',
        onClick: () => setIsCartOpen(true),
      },
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    toast.info('Ítem eliminado del carrito');
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      totalItems,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      selectedProduct,
      openProductDetail,
      closeProductDetail,
      searchQuery,
      setSearchQuery,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cart,
      totalItems,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      selectedProduct,
      openProductDetail,
      closeProductDetail,
      searchQuery,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore debe utilizarse dentro de StoreProvider');
  }
  return ctx;
}

