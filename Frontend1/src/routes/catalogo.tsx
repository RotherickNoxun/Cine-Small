import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton';
import { STORE_CATEGORIES } from '@/data/seed';
import { useStore } from '@/context/StoreContext';
import { useProducts } from '@/hooks/useEcommerce';
import type { ProductCategory, ProductType } from '@/types/ecommerce';

type CatalogSearch = {
  category?: string;
  type?: string;
};

type SortOption = 'featured' | 'price-asc' | 'price-desc';

export const Route = createFileRoute('/catalogo')({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    category: typeof search.category === 'string' ? search.category : undefined,
    type: typeof search.type === 'string' ? search.type : undefined,
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();
  const { searchQuery, setSearchQuery } = useStore();
  const { data: products = [], isLoading } = useProducts();

  const selectedCategory: 'Todos' | ProductCategory = useMemo(() => {
    const valid = STORE_CATEGORIES.some((c) => c.name === searchParams.category);
    return valid ? (searchParams.category as ProductCategory) : 'Todos';
  }, [searchParams.category]);

  const selectedType: 'Todos' | ProductType = useMemo(() => {
    if (searchParams.type === 'ESTANDAR' || searchParams.type === 'SERVICIO') {
      return searchParams.type;
    }
    return 'Todos';
  }, [searchParams.type]);

  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const setCategoryFilter = (category: 'Todos' | ProductCategory) => {
    navigate({
      search: (prev) => ({
        ...prev,
        category: category === 'Todos' ? undefined : category,
      }),
    });
  };

  const setTypeFilter = (type: 'Todos' | ProductType) => {
    navigate({
      search: (prev) => ({
        ...prev,
        type: type === 'Todos' ? undefined : type,
      }),
    });
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSortBy('featured');
    navigate({ search: {} });
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = products.filter((item) => {
      if (!item.isActive) return false;
      if (selectedCategory !== 'Todos' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedType !== 'Todos' && item.type !== selectedType) {
        return false;
      }
      if (q) {
        const hayMatch =
          item.name.toLowerCase().includes(q) ||
          item.shortDescription.toLowerCase().includes(q) ||
          item.fullDescription.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        if (!hayMatch) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [products, selectedCategory, selectedType, searchQuery, sortBy]);

  return (
    <div className="min-h-[75vh] pb-16">
      {/* Encabezado de Catálogo */}
      <section className="bg-hero-radial py-10 text-white sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Cartelera & Tienda Cine Small
              </span>
              <h1 className="mt-1.5 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                Salas Privadas, Candy Bar & Coleccionables
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Combina reservas de sala privada, paquetes de cumpleaños, combos
                de pipocas y productos de cine en un mismo pedido con pago QR.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-xl border border-[#1E3A5F] bg-[#112240] px-4 py-2 text-xs font-semibold text-slate-200 tabular-nums md:self-auto">
              <Icon icon="solar:layers-bold" className="h-4 w-4 text-[#D4AF37]" />
              <span>
                {filteredProducts.length}{' '}
                {filteredProducts.length === 1
                  ? 'resultado disponible'
                  : 'resultados disponibles'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Filtros Combinados */}
      <section className="md:sticky md:top-[65px] z-30 border-b border-[#E2E8F0] bg-white/95 shadow-xs backdrop-blur-md">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-center">
            {/* Buscador por texto */}
            <div className="relative lg:col-span-5">
              <Icon
                icon="solar:magnifer-linear"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#475569]"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nombre, material, alquiler o descripción..."
                aria-label="Filtrar catálogo por texto"
                className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pr-9 pl-10 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#D4AF37] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Borrar filtro de texto"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[#475569] hover:text-[#0A192F]"
                >
                  <Icon icon="solar:close-circle-bold" className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filtro Tipo Genérico */}
            <div className="flex flex-wrap items-center gap-1.5 lg:col-span-4">
              <span className="mr-1 text-xs font-bold text-[#475569]">
                Tipo:
              </span>
              {(
                [
                  { id: 'Todos', label: 'Todos' },
                  { id: 'ESTANDAR', label: 'Estándar' },
                  { id: 'SERVICIO', label: 'Servicio' },
                ] as const
              ).map((opt) => {
                const active = selectedType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTypeFilter(opt.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors duration-200 ${
                      active
                        ? 'bg-[#0A192F] text-[#D4AF37] shadow-xs'
                        : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#D4AF37] hover:text-[#0A192F]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Ordenamiento por precio */}
            <div className="flex items-center justify-between gap-2 lg:col-span-3 lg:justify-end">
              <label
                htmlFor="catalog-sort"
                className="text-xs font-bold text-[#475569]"
              >
                Ordenar:
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#D4AF37]"
              >
                <option value="featured">Destacados primero</option>
                <option value="price-asc">Precio: Menor a mayor</option>
                <option value="price-desc">Precio: Mayor a menor</option>
              </select>
            </div>
          </div>

          {/* Pills de Categorías Simples Dinámicas */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategoryFilter('Todos')}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors duration-200 ${
                selectedCategory === 'Todos'
                  ? 'bg-[#D4AF37] text-[#0A192F] shadow-xs'
                  : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#D4AF37] hover:text-[#0A192F]'
              }`}
            >
              Todas las categorías
            </button>
            {STORE_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategoryFilter(cat.name)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-colors duration-200 ${
                    active
                      ? 'bg-[#D4AF37] text-[#0A192F] shadow-xs'
                      : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#D4AF37] hover:text-[#0A192F]'
                  }`}
                >
                  <Icon icon={cat.icon} className="h-3.5 w-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid de Productos */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            variant="catalog"
            title="No hay coincidencias con estos filtros"
            description="No encontramos productos o servicios activos que coincidan con tu búsqueda actual. Restablece los filtros para explorar todo el catálogo."
            actionLabel="Restablecer filtros"
            onAction={resetAllFilters}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showFeaturedRibbon
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

