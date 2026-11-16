import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QRCode from 'qrcode';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import {
  useResetDemoEnvironment,
  useStoreSettings,
  useUpdateStoreSettings,
} from '@/hooks/useAdminStore';

const settingsSchema = z.object({
  qrImageUrl: z.string().min(5, 'Define una imagen o código QR válido'),
  bankName: z.string().min(2, 'Ingresa el nombre del banco'),
  accountHolder: z.string().min(2, 'Ingresa el titular de la cuenta'),
  accountNumber: z.string().min(4, 'Ingresa el número de cuenta'),
  nit: z.string().min(3, 'Ingresa el NIT / CI'),
  currencyLabel: z.string().min(2),
  sellerWhatsapp: z
    .string()
    .min(7, 'Ingresa el número de WhatsApp del vendedor'),
  publicStoreUrl: z.string().min(4, 'Ingresa la URL de la tienda pública'),
  facebook: z.string(),
  instagram: z.string(),
  tiktok: z.string(),
  x: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export const Route = createFileRoute('/configuracion')({
  component: StoreSettingsPage,
});

function StoreSettingsPage() {
  const { data: settings } = useStoreSettings();
  const updateSettings = useUpdateStoreSettings();
  const resetDemo = useResetDemoEnvironment();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (!settings) return;
    reset({
      qrImageUrl: settings.qrImageUrl,
      bankName: settings.bankName,
      accountHolder: settings.accountHolder,
      accountNumber: settings.accountNumber,
      nit: settings.nit,
      currencyLabel: settings.currencyLabel,
      sellerWhatsapp: settings.sellerWhatsapp,
      publicStoreUrl: settings.publicStoreUrl,
      facebook: settings.socialLinks.facebook,
      instagram: settings.socialLinks.instagram,
      tiktok: settings.socialLinks.tiktok,
      x: settings.socialLinks.x,
    });
  }, [settings, reset]);

  const previewQrUrl = watch('qrImageUrl');
  const watchedBankName = watch('bankName');
  const watchedAccountNumber = watch('accountNumber');
  const watchedHolder = watch('accountHolder');

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error('La imagen del QR no debe superar los 4 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValue('qrImageUrl', reader.result, { shouldDirty: true });
        toast.success('Imagen QR cargada en la vista previa');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateQrFromAccount = async () => {
    try {
      const payload = `CINESMALL|BANCO:${watchedBankName}|TITULAR:${watchedHolder}|CTA:${watchedAccountNumber}|WEB:cinesmall.com`;
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 340,
        margin: 2,
        color: {
          dark: '#0A192F',
          light: '#FFFFFF',
        },
      });
      setValue('qrImageUrl', dataUrl, { shouldDirty: true });
      toast.success('Código QR bancario regenerado con los datos actuales');
    } catch {
      toast.error('No se pudo generar el QR dinámico');
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    await updateSettings.mutateAsync({
      qrImageUrl: values.qrImageUrl.trim(),
      bankName: values.bankName.trim(),
      accountHolder: values.accountHolder.trim(),
      accountNumber: values.accountNumber.trim(),
      nit: values.nit.trim(),
      currencyLabel: values.currencyLabel.trim(),
      sellerWhatsapp: values.sellerWhatsapp.replace(/\D/g, ''),
      publicStoreUrl: values.publicStoreUrl.trim(),
      socialLinks: {
        facebook: values.facebook.trim(),
        instagram: values.instagram.trim(),
        tiktok: values.tiktok.trim(),
        x: values.x.trim(),
      },
      updatedAt: new Date().toISOString(),
    });
    toast.success(
      'Configuración guardada y sincronizada con la tienda pública.'
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Vista previa y carga de Código QR Bancario */}
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
          <h2 className="flex items-center gap-2 font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
            <Icon icon="solar:qr-code-bold-duotone" className="h-5 w-5 text-[#D4AF37]" />
            <span>Código QR de Cobro</span>
          </h2>
          <p className="mt-1 text-xs text-[#475569]">
            Este QR es el que ven tus clientes en el checkout público de
            cinesmall.com.
          </p>

          <div className="mt-5 flex justify-center">
            <div className="overflow-hidden rounded-2xl border-4 border-[#D4AF37] bg-white p-3 shadow-md">
              {previewQrUrl ? (
                <img
                  src={previewQrUrl}
                  alt="Código QR Bancario Cine Small"
                  className="h-56 w-56 object-contain"
                />
              ) : (
                <div className="flex h-56 w-56 items-center justify-center bg-[#F8FAFC] text-xs text-slate-400">
                  Sin QR definido
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0A192F] px-4 py-2.5 text-xs font-bold text-[#D4AF37] transition hover:bg-[#112240]">
              <Icon icon="solar:upload-bold" className="h-4 w-4" />
              <span>Subir Imagen QR del Banco</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleQrFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleGenerateQrFromAccount}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-xs font-bold text-[#0A192F] transition hover:border-[#D4AF37]"
            >
              <Icon icon="solar:refresh-circle-bold" className="h-4 w-4 text-[#D4AF37]" />
              <span>Regenerar QR con Datos Bancarios</span>
            </button>

            <div>
              <label className="block text-[11px] font-bold text-[#475569]">
                O pegar URL / DataURL del QR
              </label>
              <input
                type="text"
                {...register('qrImageUrl')}
                className="mt-1 h-9 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs outline-none focus:border-[#D4AF37]"
              />
              {errors.qrImageUrl && (
                <p className="mt-1 text-xs text-[#EF4444]">
                  {errors.qrImageUrl.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Datos Bancarios + Contacto WhatsApp + Redes Sociales */}
        <section className="space-y-6 lg:col-span-2">
          {/* Datos Bancarios */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
              <Icon icon="solar:buildings-2-bold-duotone" className="h-5 w-5 text-[#D4AF37]" />
              <span>Cuenta Bancaria de Respaldo</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Entidad Bancaria
                </label>
                <input
                  type="text"
                  {...register('bankName')}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-medium outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Titular / Razón Social
                </label>
                <input
                  type="text"
                  {...register('accountHolder')}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-medium outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  {...register('accountNumber')}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-bold tabular-nums outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  NIT / CI
                </label>
                <input
                  type="text"
                  {...register('nit')}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-bold tabular-nums outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Vendedor & Tienda Pública */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
              <Icon icon="ic:baseline-whatsapp" className="h-5 w-5 text-[#10B981]" />
              <span>WhatsApp de Notificaciones y Redes Sociales</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  WhatsApp del Vendedor (con código de país)
                </label>
                <input
                  type="text"
                  {...register('sellerWhatsapp')}
                  placeholder="59170012345"
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-bold tabular-nums outline-none focus:border-[#D4AF37]"
                />
                {errors.sellerWhatsapp && (
                  <p className="mt-1 text-xs text-[#EF4444]">
                    {errors.sellerWhatsapp.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  URL Tienda Pública (botón Ver Tienda)
                </label>
                <input
                  type="text"
                  {...register('publicStoreUrl')}
                  placeholder="http://localhost:5173"
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-medium outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Facebook
                </label>
                <input
                  type="text"
                  {...register('facebook')}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  Instagram
                </label>
                <input
                  type="text"
                  {...register('instagram')}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  TikTok
                </label>
                <input
                  type="text"
                  {...register('tiktok')}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0A192F]">
                  X (Twitter)
                </label>
                <input
                  type="text"
                  {...register('x')}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Barra de Guardado + Reset Demo */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-6 py-4 shadow-xs">
            <button
              type="button"
              onClick={async () => {
                await resetDemo.mutateAsync();
                toast.info('Datos de demostración restaurados.');
              }}
              className="rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-xs font-bold text-[#475569] hover:border-[#EF4444] hover:text-[#EF4444]"
            >
              Restaurar Datos Iniciales Demo
            </button>

            <Button
              type="submit"
              isDisabled={isSubmitting}
              className="h-11 rounded-xl bg-[#D4AF37] px-6 text-xs font-extrabold text-[#0A192F] shadow-sm hover:bg-[#E5C158]"
            >
              Guardar y Publicar Configuración
            </Button>
          </div>
        </section>
      </div>
    </form>
  );
}

