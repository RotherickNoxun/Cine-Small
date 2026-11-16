import { useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { FeaturedProductCarousel } from '@/components/carousel/FeaturedProductCarousel';
import { HeroShowcaseCarousel } from '@/components/carousel/HeroShowcaseCarousel';
import { DynamicBillboardSection } from '@/components/cinema/DynamicBillboardSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { STORE_CATEGORIES } from '@/data/seed';
import { useOrders, useProducts } from '@/hooks/useEcommerce';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: orders = [] } = useOrders();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.isActive) {
        counts[p.category] = (counts[p.category] ?? 0) + 1;
      }
    }
    return counts;
  }, [products]);

  return (
    <div>
      {/* 1. Carrusel Hero Vitrina de Alto Impacto */}
      <HeroShowcaseCarousel products={products} orders={orders} />

      {/* 2. Cartelera Dinámica en Vivo + Selector de Butacas */}
      <DynamicBillboardSection />

      {/* 3. Carrusel Interactivo de Productos y Servicios Destacados + Comparador */}
      <FeaturedProductCarousel products={products} isLoading={isLoading} />

      {/* 3. Accesos Rápidos por Categoría */}
      <section className="border-y border-[#E2E8F0] bg-[#0A192F] py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              Navegación Directa
            </span>
            <h2 className="mt-1.5 font-heading text-2xl font-extrabold text-white sm:text-3xl">
              Explora por Categoría
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300">
              Filtra instantáneamente entre bienes físicos estándar, insumos,
              equipamiento y reservas de servicio.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STORE_CATEGORIES.map((category) => (
              <Link
                key={category.name}
                to="/catalogo"
                search={{ category: category.name }}
                className="group flex flex-col rounded-2xl border border-[#1E3A5F] bg-[#112240] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A192F] text-[#D4AF37] transition-colors group-hover:bg-[#D4AF37] group-hover:text-[#0A192F]">
                    <Icon icon={category.icon} className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[#0A192F] px-2.5 py-0.5 text-[11px] font-bold text-[#D4AF37] tabular-nums">
                    {categoryCounts[category.name] ?? 0} ítems
                  </span>
                </div>

                <h3 className="mt-4 font-heading text-base font-bold text-white group-hover:text-[#D4AF37]">
                  {category.name}
                </h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-300">
                  {category.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-[#1E3A5F] pt-3 text-xs font-semibold text-[#D4AF37]">
                  <span>{category.tagline}</span>
                  <Icon
                    icon="solar:arrow-right-bold"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Comunicación y Contacto Directo */}
      <ContactSection />
    </div>
  );
}
