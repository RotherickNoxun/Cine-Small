import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import {
  createBrandedFallbackImage,
  slugifyProductName,
} from '@/lib/format';
import type { CategoryItem, Product, ProductType } from '@/types/ecommerce';

const productSchema = z.object({
  name: z.string().min(3, 'Ingresa al menos 3 caracteres para el nombre'),
  shortDescription: z
    .string()
    .min(6, 'Describe brevemente el producto o servicio'),
  fullDescription: z.string().min(10, 'Ingresa una descripción detallada'),
  type: z.enum(['ESTANDAR', 'SERVICIO']),
  category: z.string().min(1, 'Selecciona una categoría simple'),
  price: z.coerce
    .number()
    .positive('El precio debe ser mayor a 0'),
  stock: z.coerce.number().min(0).optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  editingProduct: Product | null;
  categories: CategoryItem[];
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
}

export function ProductFormModal({
  open,
  editingProduct,
  categories,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const defaultCategory = categories[0]?.name ?? 'Productos';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: '',
      shortDescription: '',
      fullDescription: '',
      type: 'ESTANDAR',
      category: defaultCategory,
      price: 100,
      stock: 15,
      imageUrl: '',
      isActive: true,
      isFeatured: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editingProduct) {
      reset({
        name: editingProduct.name,
        shortDescription: editingProduct.shortDescription,
        fullDescription: editingProduct.fullDescription,
        type: editingProduct.type,
        category: editingProduct.category,
        price: editingProduct.price,
        stock: editingProduct.stock ?? 10,
        imageUrl: editingProduct.images[0] ?? '',
        isActive: editingProduct.isActive,
        isFeatured: editingProduct.isFeatured,
      });
    } else {
      reset({
        name: '',
        shortDescription: '',
        fullDescription: '',
        type: 'ESTANDAR',
        category: defaultCategory,
        price: 100,
        stock: 20,
        imageUrl: '',
        isActive: true,
        isFeatured: false,
      });
    }
  }, [open, editingProduct, defaultCategory, reset]);

  if (!open) return null;

  const watchedType = watch('type');
  const watchedImage = watch('imageUrl');
  const watchedCategory = watch('category');
  const watchedName = watch('name');
  const watchedActive = watch('isActive');
  const watchedFeatured = watch('isFeatured');

  const previewSrc =
    watchedImage?.trim() ||
    createBrandedFallbackImage(
      watchedName || 'Nuevo Ítem Cine Small',
      watchedCategory || 'Catálogo'
    );

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 4 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValue('imageUrl', reader.result, { shouldDirty: true });
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: ProductFormValues) => {
    const finalImage =
      values.imageUrl?.trim() ||
      createBrandedFallbackImage(values.name, values.category);

    const product: Product = {
      id: editingProduct?.id ?? `prod-${Date.now()}`,
      name: values.name.trim(),
      slug: editingProduct?.slug ?? `${slugifyProductName(values.name)}-${Date.now().toString().slice(-4)}`,
      category: values.category,
      type: values.type as ProductType,
      price: Number(values.price),
      shortDescription: values.shortDescription.trim(),
      fullDescription: values.fullDescription.trim(),
      images: [
        finalImage,
        ...(editingProduct?.images.slice(1) ?? []),
      ],
      isFeatured: values.isFeatured,
      isActive: values.isActive,
      stock: values.type === 'ESTANDAR' ? (values.stock ?? 10) : undefined,
      serviceModalities:
        values.type === 'SERVICIO'
          ? editingProduct?.serviceModalities ?? {
              duration: 'Reserva flexible por bloque horario',
              availability: 'Lunes a Domingo previa coordinación',
              coverage: 'Complejo Cine Small / Domicilio',
              includes: ['Atención personalizada', 'Confirmación directa QR'],
            }
          : undefined,
      specs: editingProduct?.specs ?? {
        Tipo: values.type === 'SERVICIO' ? 'Servicio / Reserva' : 'Producto Estándar',
        Categoría: values.category,
        Disponibilidad: values.isActive ? 'Publicado en tienda' : 'Borrador oculto',
      },
    };

    await onSave(product);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/80 p-3 backdrop-blur-xs sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between bg-[#0A192F] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Icon
              icon={
                editingProduct
                  ? 'solar:pen-new-square-bold-duotone'
                  : 'solar:add-square-bold-duotone'
              }
              className="h-6 w-6 text-[#D4AF37]"
            />
            <div>
              <h2 className="font-heading text-lg font-extrabold">
                {editingProduct
                  ? 'Editar Producto / Servicio'
                  : 'Nuevo Producto o Servicio'}
              </h2>
              <p className="text-xs text-slate-300">
                Sincronización inmediata con la tienda pública cinesmall.com
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario de producto"
            className="text-slate-300 hover:text-[#D4AF37]"
          >
            <Icon icon="solar:close-circle-bold" className="h-6 w-6" />
          </button>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-5 overflow-y-auto p-6"
        >
          {/* Imagen + Vista Previa */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-3">
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
              <img
                src={previewSrc}
                alt="Vista previa del producto"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
            <div className="space-y-3 sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F]">
                Imagen del Producto / Servicio (URL o Archivo)
              </label>
              <input
                type="text"
                {...register('imageUrl')}
                placeholder="https://images.unsplash.com/..."
                className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs text-[#0F172A] outline-none focus:border-[#D4AF37]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#0A192F]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#0A192F] transition hover:border-[#D4AF37] hover:bg-[#FEF3C7]/40">
                  <Icon icon="solar:upload-bold" className="h-4 w-4 text-[#D4AF37]" />
                  <span>Subir archivo desde equipo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
                {watchedImage && (
                  <button
                    type="button"
                    onClick={() => setValue('imageUrl', '')}
                    className="text-xs font-semibold text-[#EF4444] hover:underline"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Selector de Tipo Genérico: Visual Radio Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F]">
              Tipo Genérico de Oferta
            </label>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setValue('type', 'ESTANDAR')}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${
                  watchedType === 'ESTANDAR'
                    ? 'border-[#0A192F] bg-[#0A192F]/5'
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    watchedType === 'ESTANDAR'
                      ? 'bg-[#0A192F] text-[#D4AF37]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon icon="solar:box-bold-duotone" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading text-sm font-extrabold text-[#0A192F]">
                    Producto Estándar
                  </p>
                  <p className="mt-0.5 text-xs text-[#475569]">
                    Bien físico o de inventario con control de stock (Candy Bar,
                    equipos, materiales).
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue('type', 'SERVICIO')}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${
                  watchedType === 'SERVICIO'
                    ? 'border-[#D4AF37] bg-[#FEF3C7]/40'
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    watchedType === 'SERVICIO'
                      ? 'bg-[#D4AF37] text-[#0A192F]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon
                    icon="solar:calendar-mark-bold-duotone"
                    className="h-5 w-5"
                  />
                </div>
                <div>
                  <p className="font-heading text-sm font-extrabold text-[#0A192F]">
                    Servicio / Alquiler
                  </p>
                  <p className="mt-0.5 text-xs text-[#475569]">
                    Reserva de sala privada, evento, alquiler o prestación
                    intangible por horario.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Nombre, Categoría y Precio */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#0A192F]">
                Nombre del producto o servicio *
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Ej. Sala Privada VIP 4K + Combo Pareja"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm font-semibold text-[#0F172A] outline-none focus:border-[#D4AF37]"
              />
              {errors.name && (
                <p className="mt-1 text-xs font-semibold text-[#EF4444]">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A192F]">
                Categoría Simple *
              </label>
              <select
                {...register('category')}
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-semibold text-[#0F172A] outline-none focus:border-[#D4AF37]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs font-semibold text-[#EF4444]">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Precio (Bs.) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  {...register('price')}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-extrabold text-[#0A192F] tabular-nums outline-none focus:border-[#D4AF37]"
                />
                {errors.price && (
                  <p className="mt-1 text-xs font-semibold text-[#EF4444]">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {watchedType === 'ESTANDAR' && (
                <div>
                  <label className="block text-xs font-bold text-[#0A192F]">
                    Stock disponible
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('stock')}
                    className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-bold text-[#0F172A] tabular-nums outline-none focus:border-[#D4AF37]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Descripciones */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#0A192F]">
                Resumen breve (tarjeta de catálogo) *
              </label>
              <input
                type="text"
                {...register('shortDescription')}
                placeholder="Resumen atractivo de hasta 2 líneas para los clientes..."
                className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#D4AF37]"
              />
              {errors.shortDescription && (
                <p className="mt-1 text-xs font-semibold text-[#EF4444]">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A192F]">
                Descripción detallada *
              </label>
              <textarea
                rows={3}
                {...register('fullDescription')}
                placeholder="Especificaciones completas, alcances del servicio o contenido exacto..."
                className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#D4AF37]"
              />
              {errors.fullDescription && (
                <p className="mt-1 text-xs font-semibold text-[#EF4444]">
                  {errors.fullDescription.message}
                </p>
              )}
            </div>
          </div>

          {/* Toggles Visibilidad & Destacado */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
              <div>
                <span className="block text-xs font-bold text-[#0A192F]">
                  Publicar inmediatamente en tienda
                </span>
                <span className="text-[11px] text-[#475569]">
                  Visible para clientes en catálogo
                </span>
              </div>
              <input
                type="checkbox"
                checked={watchedActive}
                onChange={(e) => setValue('isActive', e.target.checked)}
                className="h-5 w-5 accent-[#10B981]"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-[#FEF3C7]/25 px-4 py-3">
              <div>
                <span className="block text-xs font-bold text-[#0A192F]">
                  Mostrar en Destacados del Inicio
                </span>
                <span className="text-[11px] text-[#475569]">
                  Cintillo dorado en Home
                </span>
              </div>
              <input
                type="checkbox"
                checked={watchedFeatured}
                onChange={(e) => setValue('isFeatured', e.target.checked)}
                className="h-5 w-5 accent-[#D4AF37]"
              />
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E2E8F0] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-[#E2E8F0] px-5 text-xs font-bold text-[#475569] hover:bg-[#F8FAFC]"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              isDisabled={isSubmitting}
              className="h-11 rounded-xl bg-[#D4AF37] px-6 text-xs font-extrabold text-[#0A192F] shadow-sm hover:bg-[#E5C158]"
            >
              {editingProduct ? 'Guardar Cambios' : 'Crear y Sincronizar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

