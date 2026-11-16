import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useAdminNotifications,
  useMarkAllNotificationsRead,
  useOrders,
  useRealtimeAdminSync,
  useSimulateIncomingReceipt,
  useStoreSettings,
} from '@/hooks/useAdminStore';
import { formatDateShort } from '@/lib/format';

interface NavItem {
  to: '/' | '/pedidos' | '/catalogo' | '/categorias' | '/configuracion';
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Resumen y Métricas',
    icon: 'solar:chart-square-bold-duotone',
  },
  {
    to: '/pedidos',
    label: 'Gestión de Pedidos y Pagos QR',
    icon: 'solar:bill-check-bold-duotone',
  },
  {
    to: '/catalogo',
    label: 'Catálogo de Productos y Servicios',
    icon: 'solar:box-minimalistic-bold-duotone',
  },
  {
    to: '/categorias',
    label: 'Categorías Simples',
    icon: 'solar:widget-4-bold-duotone',
  },
  {
    to: '/configuracion',
    label: 'Configuración de Pago QR y Contacto',
    icon: 'solar:settings-bold-duotone',
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  useRealtimeAdminSync();

  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: orders = [] } = useOrders();
  const { data: notifications = [] } = useAdminNotifications();
  const { data: settings } = useStoreSettings();
  const markAllRead = useMarkAllNotificationsRead();
  const simulateReceipt = useSimulateIncomingReceipt();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const pendingOrdersCount = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.paymentStatus === 'COMPROBANTE_ENVIADO' ||
          o.paymentStatus === 'PENDIENTE'
      ).length,
    [orders]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const activeTitle = useMemo(() => {
    const matched = NAV_ITEMS.find((item) => item.to === pathname);
    return matched?.label ?? 'Panel Ejecutivo · Cine Small Admin';
  }, [pathname]);

  const handleSimulateLiveEvent = async () => {
    const created = await simulateReceipt.mutateAsync();
    toast.success(`Nuevo comprobante recibido en ${created.id}`);
  };

  const renderSidebarContent = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col bg-[#0A192F] text-white">
      {/* Brand Header */}
      <div className="border-b border-[#1E3A5F] px-5 py-5">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/50 bg-[#112240] text-[#D4AF37] shadow-inner">
            <Icon icon="solar:clapperboard-play-bold" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-base font-extrabold tracking-tight text-white">
                Cine Small
              </span>
              <span className="rounded-md bg-[#D4AF37] px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-[#0A192F]">
                Admin
              </span>
            </div>
            <p className="truncate text-[11px] font-medium text-slate-400">
              Backoffice · cinesmall.com
            </p>
          </div>
        </Link>

        {/* Estado Tienda Online */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#1E3A5F] bg-[#112240] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            </span>
            <span className="text-xs font-bold text-slate-200">
              Tienda Online
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37]">
            Sync Activo
          </span>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Operación y Catálogo
        </p>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`group flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-3 text-xs font-bold transition duration-150 ${
                active
                  ? 'bg-[#D4AF37] text-[#0A192F] shadow-sm'
                  : 'text-slate-300 hover:bg-[#112240] hover:text-white'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Icon
                  icon={item.icon}
                  className={`h-5 w-5 shrink-0 ${
                    active
                      ? 'text-[#0A192F]'
                      : 'text-[#D4AF37] group-hover:text-[#E5C158]'
                  }`}
                />
                <span className="leading-snug">{item.label}</span>
              </div>

              {item.to === '/pedidos' && pendingOrdersCount > 0 && (
                <span
                  className={`inline-flex min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums ${
                    active
                      ? 'bg-[#0A192F] text-[#D4AF37]'
                      : 'bg-[#D4AF37] text-[#0A192F]'
                  }`}
                >
                  {pendingOrdersCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="border-t border-[#1E3A5F] p-4">
        <a
          href={settings?.publicStoreUrl || 'http://localhost:5173'}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#112240] px-3 py-2.5 text-xs font-bold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-[#0A192F]"
        >
          <Icon icon="solar:shop-bold-duotone" className="h-4 w-4" />
          <span>Ver Tienda Pública</span>
          <Icon icon="solar:arrow-right-up-linear" className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-[#F1F5F9] text-[#0F172A]">
      {/* Sidebar Fijo en Desktop */}
      <aside className="hidden w-72 shrink-0 lg:sticky lg:top-0 lg:block lg:h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Drawer Móvil / Tablet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#0A192F]/70 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 h-full w-72 max-w-[85vw] shadow-2xl"
            >
              {renderSidebarContent(() => setMobileMenuOpen(false))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Workspace Principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar Ejecutivo */}
        <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú lateral"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0A192F] hover:border-[#D4AF37] lg:hidden"
              >
                <Icon icon="solar:hamburger-menu-bold" className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-heading text-base font-extrabold text-[#0A192F] sm:text-lg">
                  {activeTitle}
                </h1>
                <p className="hidden text-[11px] font-medium text-[#475569] sm:block">
                  Sincronizado vía almacenamiento local compartido + BroadcastChannel
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* Simular comprobante entrante en tiempo real */}
              <button
                type="button"
                onClick={handleSimulateLiveEvent}
                title="Simular recepción de nuevo comprobante QR desde la tienda"
                className="hidden items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#0A192F] transition hover:border-[#D4AF37] hover:bg-[#FEF3C7]/40 md:inline-flex"
              >
                <Icon
                  icon="solar:bell-bing-bold-duotone"
                  className="h-4 w-4 text-[#D4AF37]"
                />
                <span>Simular Comprobante</span>
              </button>

              {/* Centro de Notificaciones */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  aria-label="Notificaciones de pedidos y comprobantes"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0A192F] transition hover:border-[#D4AF37]"
                >
                  <Icon icon="solar:bell-bold" className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[10px] font-extrabold text-[#0A192F] tabular-nums shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setNotifOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl sm:w-96">
                      <div className="flex items-center justify-between bg-[#0A192F] px-4 py-3 text-white">
                        <span className="font-heading text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
                          Alertas en Tiempo Real ({unreadCount})
                        </span>
                        <button
                          type="button"
                          onClick={() => markAllRead.mutate()}
                          className="text-[11px] font-semibold text-slate-300 hover:text-white"
                        >
                          Marcar leídas
                        </button>
                      </div>
                      <div className="max-h-80 divide-y divide-[#E2E8F0] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-[#475569]">
                            No hay notificaciones recientes.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                setNotifOpen(false);
                                navigate({
                                  to: '/pedidos',
                                  search: { orderId: n.orderId.replace(/^#/, '') },
                                });
                              }}
                              className={`block w-full px-4 py-3 text-left transition hover:bg-[#F8FAFC] ${
                                n.isRead ? 'opacity-70' : 'bg-[#FEF3C7]/20'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-extrabold text-[#0A192F]">
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />
                                )}
                              </div>
                              <p className="mt-1 text-xs text-[#475569]">
                                {n.message}
                              </p>
                              <p className="mt-1 text-[10px] font-semibold text-slate-400 tabular-nums">
                                {formatDateShort(n.createdAt)}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Botón rápido Tienda Pública */}
              <a
                href={settings?.publicStoreUrl || 'http://localhost:5173'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0A192F] px-3.5 text-xs font-bold text-[#D4AF37] shadow-xs transition hover:bg-[#112240]"
              >
                <Icon icon="solar:eye-bold" className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Tienda Pública</span>
              </a>
            </div>
          </div>
        </header>

        {/* Área de Contenido */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

