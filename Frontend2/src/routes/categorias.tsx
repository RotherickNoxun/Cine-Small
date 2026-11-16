import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useProducts,
  useUpdateCategory,
} from '@/hooks/useAdminStore';
import type { CategoryItem } from '@/types/ecommerce';

const ICON_OPTIONS = [
  { value: 'solar:clapperboard-play-bold-duotone', label: 'Cine / Salas' },
  { value: 'solar:cup-hot-bold-duotone', label: 'Candy Bar / Bebidas' },
  { value: 'solar:ticket-sale-bold-duotone', label: 'Eventos / Servicios' },
  { value: 'solar:glasses-bold-duotone', label: 'Materiales / 3D' },
  { value: 'solar:tv-bold-duotone', label: 'Equipamiento' },
  { value: 'solar:tag-bold-duotone', label: 'General / Etiqueta' },
];

export const Route = createFileRoute('/categorias')({
  component: CategoriesManagementPage,
});

function CategoriesManagementPage() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('solar:tag-bold-duotone');

  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState('solar:tag-bold-duotone');

  const [deletingCat, setDeletingCat] = useState<CategoryItem | null>(null);

  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Ingresa un nombre para la categoría simple');
      return;
    }
    try {
      await createCategory.mutateAsync({
        name: newName,
        description: newDescription,
        tagline: newTagline,
        icon: newIcon,
      });
      setNewName('');
      setNewTagline('');
      setNewDescription('');
      toast.success(`Categoría "${newName.trim()}" creada correctamente`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear categoría');
    }
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCat(cat);
    setEditName(cat.name);
    setEditTagline(cat.tagline);
    setEditDescription(cat.description);
    setEditIcon(cat.icon);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    try {
      await updateCategory.mutateAsync({
        id: editingCat.id,
        name: editName,
        tagline: editTagline,
        description: editDescription,
        icon: editIcon,
      });
      toast.success(`Categoría "${editName.trim()}" actualizada`);
      setEditingCat(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al renombrar');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCat) return;
    await deleteCategory.mutateAsync(deletingCat.id);
    toast.info(`Categoría "${deletingCat.name}" eliminada`);
    setDeletingCat(null);
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Nueva Categoría */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="border-b border-[#E2E8F0] pb-3">
          <h2 className="font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
            Crear Nueva Categoría Simple
          </h2>
          <p className="mt-0.5 text-xs text-[#475569]">
            Organiza productos físicos estándar y servicios de la tienda pública
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre (ej. Merchandising) *"
            className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#D4AF37]"
          />
          <input
            type="text"
            value={newTagline}
            onChange={(e) => setNewTagline(e.target.value)}
            placeholder="Subtítulo corto (ej. Edición Limitada)"
            className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#D4AF37]"
          />
          <select
            aria-label="Icono de la categoría"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0A192F]"
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] px-4 text-xs font-extrabold text-[#0A192F] hover:bg-[#E5C158]"
          >
            <Icon icon="solar:add-circle-bold" className="h-4 w-4" />
            <span>Agregar Categoría</span>
          </Button>
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Descripción breve para el panel y la tienda pública..."
            className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#D4AF37] sm:col-span-2 lg:col-span-4"
          />
        </form>
      </section>

      {/* Grid / Tabla CRUD de Categorías Simples */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((cat) => {
          const count = productCountByCategory[cat.name] ?? 0;
          return (
            <article
              key={cat.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:border-[#D4AF37]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A192F] text-[#D4AF37]">
                      <Icon icon={cat.icon} className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-extrabold text-[#0A192F]">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5952F]">
                        {cat.tagline}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#0A192F]/10 px-2.5 py-1 text-xs font-extrabold text-[#0A192F] tabular-nums">
                    {count} {count === 1 ? 'ítem' : 'ítems'}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#475569]">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#E2E8F0] pt-3">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#0A192F] hover:border-[#D4AF37]"
                >
                  <Icon icon="solar:pen-bold" className="h-3.5 w-3.5" />
                  <span>Renombrar / Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingCat(cat)}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#EF4444]/10 px-3 py-1.5 text-xs font-bold text-[#B91C1C] hover:bg-[#EF4444] hover:text-white"
                >
                  <Icon
                    icon="solar:trash-bin-trash-bold"
                    className="h-3.5 w-3.5"
                  />
                  <span>Eliminar</span>
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Modal Renombrar / Editar Categoría */}
      {editingCat && (
        <div
          onClick={() => setEditingCat(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/80 p-4 backdrop-blur-xs"
        >
          <form
            onSubmit={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-heading text-base font-extrabold text-[#0A192F]">
                Editar Categoría Simple
              </h3>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="text-slate-400 hover:text-[#0A192F]"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Nombre (actualiza productos asociados en cascada)
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-semibold outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Icono
                </label>
                <select
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#475569]"
              >
                Cancelar
              </button>
              <Button
                type="submit"
                className="rounded-xl bg-[#D4AF37] px-5 py-2 text-xs font-extrabold text-[#0A192F]"
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {deletingCat && (
        <div
          onClick={() => setDeletingCat(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/80 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="font-heading text-base font-extrabold text-[#0A192F]">
              ¿Eliminar categoría "{deletingCat.name}"?
            </h3>
            <p className="mt-2 text-xs text-[#475569]">
              Actualmente tiene{' '}
              <strong className="text-[#0A192F] tabular-nums">
                {productCountByCategory[deletingCat.name] ?? 0} productos/servicios
              </strong>{' '}
              asociados. Los productos existentes conservarán su ficha hasta que
              les asignes otra categoría.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
                className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#475569]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-[#EF4444] px-4 py-2 text-xs font-extrabold text-white"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

