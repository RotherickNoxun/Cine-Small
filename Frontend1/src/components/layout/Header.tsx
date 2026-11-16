import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useStore } from '@/context/StoreContext';
import { useProducts } from '@/hooks/useEcommerce';
import { STORE_CATEGORIES } from '@/data/seed';
import {
  buildWhatsAppLink,
  createBrandedFallbackImage,
  formatCurrency,
} from '@/lib/format';

export function Header() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const {
    totalItems,
    openCart,
    searchQuery,
    setSearchQuery,
    openProductDetail,
  } = useStore();
  const { data: products = [] } = useProducts();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const liveMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.isActive &&
          (p.name.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [products, searchQuery]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    setMobileMenuOpen(false);
    navigate({ to: '/catalogo' });
  };

  const navLinks = [
    { label: 'Inicio', to: '/' as const },
    { label: 'Catálogo', to: '/catalogo' as const },
    { label: 'Contacto', to: '/contacto' as const },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#112240] bg-[#0A192F]/95 text-white shadow-md backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú de navegación"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#112240] bg-[#112240] text-white transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37] lg:hidden"
          >
            <Icon icon="solar:hamburger-menu-bold" className="h-5 w-5" />
          </button>

          <Link to="/" aria-label="Cine Small Inicio">
            <BrandLogo />
          </Link>
        </div>

        {/* Barra de búsqueda en tiempo real (Tablet/Desktop) */}
        <div
          ref={searchContainerRef}
          className="relative hidden flex-1 max-w-md md:block"
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <Icon
              icon="solar:magnifer-linear"
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar salas VIP, combos, pipocas o eventos..."
              aria-label="Buscar en Cine Small"
              className="h-10 w-full rounded-xl border border-[#1E3A5F] bg-[#112240] pr-9 pl-10 text-sm text-white placeholder-slate-400 outline-none transition-colors duration-200 focus:border-[#D4AF37] focus:bg-[#0F203C]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-[#D4AF37]"
              >
                <Icon icon="solar:close-circle-bold" className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Dropdown de resultados en tiempo real */}
          <AnimatePresence>
            {searchFocused && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white text-[#0F172A] shadow-2xl"
              >
                {liveMatches.length > 0 ? (
                  <>
                    <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                      Coincidencias en tiempo real ({liveMatches.length})
                    </div>
                    <ul className="divide-y divide-[#E2E8F0]">
                      {liveMatches.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchFocused(false);
                              openProductDetail(item);
                            }}
                            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-[#F8FAFC]"
                          >
                            <img
                              src={
                                item.images[0] ||
                                createBrandedFallbackImage(
                                  item.name,
                                  item.category
                                )
                              }
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.src = createBrandedFallbackImage(
                                  item.name,
                                  item.category
                                );
                              }}
                              className="h-11 w-14 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-[#0A192F]">
                                {item.name}
                              </p>
                              <p className="truncate text-[11px] text-[#475569]">
                                {item.category} ·{' '}
                                {item.type === 'SERVICIO'
                                  ? 'Servicio / Alquiler'
                                  : 'Producto Estándar'}
                              </p>
                            </div>
                            <span className="shrink-0 font-heading text-xs font-extrabold text-[#0A192F] tabular-nums">
                              {formatCurrency(item.price)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchFocused(false);
                        navigate({ to: '/catalogo' });
                      }}
                      className="flex w-full items-center justify-center gap-1.5 bg-[#0A192F] px-4 py-2.5 text-xs font-bold text-[#D4AF37] transition-colors hover:bg-[#112240]"
                    >
                      <span>Ver todos los resultados en Catálogo</span>
                      <Icon icon="solar:arrow-right-bold" className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-5 text-center">
                    <p className="text-xs font-semibold text-[#0F172A]">
                      No encontramos ítems con &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="mt-1 text-[11px] text-[#475569]">
                      Prueba con otra palabra clave o explora el catálogo completo.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navegación Desktop + Carrito */}
        <div className="flex items-center gap-2 sm:gap-5">
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {navLinks.map((item) => {
              const isActive =
                item.to === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-[#D4AF37]'
                      : 'text-slate-200 hover:bg-[#112240] hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="header-nav-indicator"
                      className="absolute right-3 bottom-1 left-3 h-0.5 rounded-full bg-[#D4AF37]"
                    />
                  )}
                </Link>
              );
            })}
            <Link
              to="/"
              hash="cartelera"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-200 transition-colors duration-200 hover:bg-[#112240] hover:text-[#D4AF37]"
            >
              Cartelera
            </Link>
            <Link
              to="/pago/$orderId"
              params={{ orderId: 'CS-2026-002' }}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
                pathname.startsWith('/pago')
                  ? 'bg-[#112240] text-[#D4AF37]'
                  : 'text-slate-300 hover:bg-[#112240] hover:text-white'
              }`}
            >
              Estado QR
            </Link>
          </nav>

          {/* Botón de Carrito */}
          <button
            type="button"
            onClick={openCart}
            aria-label="Abrir carrito de compras"
            className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#112240] px-3.5 text-sm font-semibold text-white transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#172D52]"
          >
            <Icon
              icon="solar:cart-large-minimalistic-bold"
              className="h-5 w-5 text-[#D4AF37]"
            />
            <span className="hidden sm:inline">Carrito</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={totalItems}
                initial={{ scale: 0.65, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.65, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1.5 py-0.5 text-[11px] font-extrabold text-[#0A192F] tabular-nums"
              >
                {totalItems}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Buscador compacto visible en móvil (<768px) */}
      <div className="border-t border-[#112240] px-4 py-2 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Icon
            icon="solar:magnifer-linear"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar salas VIP, combos, pipocas o eventos..."
            aria-label="Buscar en móvil"
            className="h-9 w-full rounded-xl border border-[#1E3A5F] bg-[#112240] pr-8 pl-9 text-xs text-white placeholder-slate-400 outline-none focus:border-[#D4AF37]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda móvil"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
            >
              <Icon icon="solar:close-circle-bold" className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* Drawer de menú móvil / tablet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-xs"
            />

            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col border-r border-[#112240] bg-[#0A192F] p-5 text-white shadow-2xl"
              aria-label="Menú móvil"
            >
              <div className="flex items-center justify-between border-b border-[#112240] pb-4">
                <BrandLogo compact />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#112240] text-slate-200 hover:text-[#D4AF37]"
                >
                  <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-1.5">
                {navLinks.map((item) => {
                  const active =
                    item.to === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-[#D4AF37] text-[#0A192F]'
                          : 'bg-[#112240]/60 text-white hover:bg-[#112240]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4" />
                    </Link>
                  );
                })}
                <Link
                  to="/"
                  hash="cartelera"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-[#112240]/60 px-4 py-3 text-sm font-semibold text-[#D4AF37] hover:bg-[#112240]"
                >
                  <span>Cartelera de Cine</span>
                  <Icon icon="solar:reel-bold" className="h-4 w-4 text-[#D4AF37]" />
                </Link>
                <Link
                  to="/pago/$orderId"
                  params={{ orderId: 'CS-2026-002' }}
                  className="flex items-center justify-between rounded-xl bg-[#112240]/60 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-[#112240]"
                >
                  <span>Pasarela / Seguimiento QR</span>
                  <Icon icon="solar:qr-code-bold" className="h-4 w-4 text-[#D4AF37]" />
                </Link>
              </div>

              <div className="mt-6 border-t border-[#112240] pt-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Categorías Rápidas
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {STORE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.name}
                      to="/catalogo"
                      search={{ category: cat.name }}
                      className="rounded-lg border border-[#1E3A5F] bg-[#112240] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-auto space-y-2.5 border-t border-[#112240] pt-4">
                <a
                  href={buildWhatsAppLink(
                    'Hola Cine Small (cinesmall.com), necesito asesoría sobre productos y servicios.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white"
                >
                  <Icon icon="ic:baseline-whatsapp" className="h-5 w-5" />
                  <span>Asesoría por WhatsApp</span>
                </a>
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#1E3A5F] py-2 text-xs text-slate-400 hover:text-[#D4AF37]"
                >
                  <Icon icon="solar:lock-keyhole-bold" className="h-3.5 w-3.5" />
                  <span>Portal Administrativo</span>
                </Link>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}

