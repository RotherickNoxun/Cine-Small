import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductDetailModal } from '@/components/catalog/ProductDetailModal';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { StoreProvider } from '@/context/StoreContext';
import { useRealtimeQuerySync } from '@/hooks/useEcommerce';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootShell() {
  useRealtimeQuerySync();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ProductDetailModal />
      <CartDrawer />
      <WhatsAppFloatingButton />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </div>
  );
}

function RootLayout() {
  return (
    <StoreProvider>
      <RootShell />
    </StoreProvider>
  );
}

