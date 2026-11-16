import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { ProductTypeBadge } from '@/components/ui/AdminBadges';
import { ProductFormModal } from '@/components/catalog/ProductFormModal';
import {
  useCategories,
  useDeleteProduct,
  useProducts,
  useUpsertProduct,
} from '@/hooks/useAdminStore';
import { formatCurrency } from '@/lib/format';
import type { Product, ProductType } from '@/types/ecommerce';

type VisibilityFilter = 'ALL' | 'ACTIVE' | 'HIDDEN';
type TypeFilter = 'ALL' | ProductType;

export const Route = createFileRoute('/catalogo')({
  component: CatalogAdminPage,
});

function CatalogAdminPage() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const upsertProduct = useUpsertProduct();
  const deleteProduct = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) {
        return false;
      }
      if (typeFilter !== 'ALL' && p.type !== typeFilter) {
        return false;
      }
      if (visibilityFilter === 'ACTIVE' && !p.isActive) return false;
      if (visibilityFilter === 'HIDDEN' && p.isActive) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [
    products,
    searchQuery,
    categoryFilter,
    typeFilter,
    visibilityFilter,
  ]);

  const handleToggleFlag = async (
    product: Product,
    field: 'isActive' | 'isFeatured'
  ) => {
    const updated: Product = {
      ...product,
      [field]: !product[field],
    };
    await upsertProduct.mutateAsync(updated);
    if (field === 'isActive') {
      toast.success(
        updated.isActive
          ? `"${product.name}" publicado en la tienda pública`
          : `"${product.name}" bajado (oculto de la tienda pública)`
      );
    } else {
      toast.success(
        updated.isFeatured
          ? `"${product.name}" fijado como Destacado en Home`
          : `"${product.name}" removido de Destacados`
      );
    }
  };

  const handleSaveProduct = async (product: Product) => {
    await upsertProduct.mutateAsync(product);
    toast.success(
      editingProduct
        ? `Cambios guardados en "${product.name}"`
        : `"${product.name}" agregado al catálogo público`
    );
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    await deleteProduct.mutateAsync(productToDelete.id);
    toast.info(`"${productToDelete.name}" eliminado del catálogo`);
    setProductToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Barra de Herramientas */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {/* Buscador instantáneo */}
            <div className="relative">
              <Icon
                icon="solar:magnifer-linear"
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#475569]"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar producto o servicio..."
                className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pr-3 pl-9 text-xs font-medium text-[#0F172A] outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Filtro Categoría Simple */}
            <select
              aria-label="Filtrar por categoría simple"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-bold text-[#0A192F] outline-none focus:border-[#D4AF37]"
            >
              <option value="ALL">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Filtro Tipo Genérico */}
            <select
              aria-label="Filtrar por tipo genérico"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-bold text-[#0A192F] outline-none focus:border-[#D4AF37]"
            >
              <option value="ALL">Tipo: Todos</option>
              <option value="ESTANDAR">Solo Estándar</option>
              <option value="SERVICIO">Solo Servicio / Alquiler</option>
            </select>

            {/* Filtro Visibilidad */}
            <select
              aria-label="Filtrar por visibilidad en tienda"
              value={visibilityFilter}
              onChange={(e) =>
                setVisibilityFilter(e.target.value as VisibilityFilter)
              }
              className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-bold text-[#0A192F] outline-none focus:border-[#D4AF37]"
            >
              <option value="ALL">Visibilidad: Todos</option>
              <option value="ACTIVE">Activos en tienda</option>
              <option value="HIDDEN">Ocultos / Borrador</option>
            </select>
          </div>

          <Button
            onPress={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 text-xs font-extrabold text-[#0A192F] shadow-sm transition hover:bg-[#E5C158]"
          >
            <Icon icon="solar:add-circle-bold" className="h-4 w-4" />
            <span>+ Nuevo Producto / Servicio</span>
          </Button>
        </div>
      </section>

      {/* Tabla Desktop (md+) */}
      <section className="hidden overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-[#0A192F] text-xs font-bold uppercase tracking-wider text-white">
              <tr>
                <th className="px-4 py-3.5">Producto / Servicio</th>
                <th className="px-4 py-3.5">Categoría & Tipo</th>
                <th className="px-4 py-3.5">Precio</th>
                <th className="px-4 py-3.5">Destacado en Home</th>
                <th className="px-4 py-3.5">Publicado / Bajado</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-[#475569]"
                  >
                    No se encontraron ítems con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-[#F8FAFC]"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-12 w-14 shrink-0 rounded-xl border border-[#E2E8F0] object-cover"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="truncate font-bold text-[#0F172A]">
                            {product.name}
                          </p>
                          <p className="line-clamp-1 text-xs text-[#475569]">
                            {product.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-bold text-[#0A192F]">
                          {product.category}
                        </span>
                        <ProductTypeBadge type={product.type} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-heading font-extrabold text-[#0A192F] tabular-nums">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleFlag(product, 'isFeatured')}
                        aria-label={`Destacar ${product.name}`}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          product.isFeatured
                            ? 'bg-[#D4AF37] text-[#0A192F]'
                            : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#D4AF37]'
                        }`}
                      >
                        <Icon
                          icon={
                            product.isFeatured
                              ? 'solar:star-bold'
                              : 'solar:star-linear'
                          }
                          className="h-4 w-4"
                        />
                        <span>
                          {product.isFeatured ? 'Destacado' : 'Estándar'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleFlag(product, 'isActive')}
                        aria-label={`Publicar o bajar ${product.name}`}
                        className="inline-flex items-center gap-2"
                      >
                        <span
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.isActive ? 'bg-[#10B981]' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.isActive
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            product.isActive
                              ? 'text-[#047857]'
                              : 'text-[#64748B]'
                          }`}
                        >
                          {product.isActive ? 'Publicado' : 'Bajado'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A192F] hover:border-[#D4AF37] hover:bg-[#FEF3C7]/30"
                        >
                          <Icon icon="solar:pen-bold" className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#EF4444]/10 px-2.5 py-1.5 text-xs font-bold text-[#B91C1C] hover:bg-[#EF4444] hover:text-white"
                        >
                          <Icon
                            icon="solar:trash-bin-trash-bold"
                            className="h-3.5 w-3.5"
                          />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tarjetas Móvil (<md) */}
      <section className="space-y-3 md:hidden">
        {filteredProducts.map((product) => (
          <article
            key={product.id}
            className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs"
          >
            <div className="flex gap-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-16 w-20 shrink-0 rounded-xl border border-[#E2E8F0] object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <ProductTypeBadge type={product.type} />
                  <span className="text-[11px] font-bold text-[#475569]">
                    {product.category}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-bold text-[#0F172A]">
                  {product.name}
                </p>
                <p className="mt-0.5 font-heading text-sm font-extrabold text-[#0A192F] tabular-nums">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-3">
              <button
                type="button"
                onClick={() => handleToggleFlag(product, 'isFeatured')}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                  product.isFeatured
                    ? 'bg-[#D4AF37] text-[#0A192F]'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon icon="solar:star-bold" className="h-3.5 w-3.5" />
                <span>{product.isFeatured ? 'Destacado' : 'Normal'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleFlag(product, 'isActive')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  product.isActive
                    ? 'bg-[#10B981]/15 text-[#047857]'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {product.isActive ? 'Publicado' : 'Bajado'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(product);
                    setModalOpen(true);
                  }}
                  className="rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-xs font-bold text-[#0A192F]"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setProductToDelete(product)}
                  className="rounded-lg bg-[#EF4444]/10 px-2.5 py-1 text-xs font-bold text-[#B91C1C]"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Modal Crear / Editar Producto */}
      <ProductFormModal
        open={modalOpen}
        editingProduct={editingProduct}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Modal de Confirmación de Eliminación */}
      {productToDelete && (
        <div
          onClick={() => setProductToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/80 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-[#B91C1C]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EF4444]/10">
                <Icon icon="solar:danger-triangle-bold" className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-base font-extrabold text-[#0A192F]">
                  ¿Eliminar del catálogo?
                </h3>
                <p className="text-xs text-[#475569]">
                  Esta acción retirará permanentemente el ítem.
                </p>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-[#F8FAFC] p-3 text-xs font-semibold text-[#0F172A]">
              {productToDelete.name}
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#475569] hover:bg-[#F8FAFC]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-[#EF4444] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#DC2626]"
              >
                Sí, eliminar ítem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

