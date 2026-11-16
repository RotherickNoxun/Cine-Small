import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useSendContactMessage } from '@/hooks/useEcommerce';
import { buildWhatsAppLink } from '@/lib/format';

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresa tu nombre (mínimo 2 caracteres).'),
  contact: z
    .string()
    .trim()
    .min(5, 'Ingresa un teléfono válido o correo electrónico.'),
  subject: z
    .string()
    .trim()
    .min(3, 'Especifica un asunto breve.'),
  message: z
    .string()
    .trim()
    .min(10, 'Escribe tu consulta (mínimo 10 caracteres).'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactSection() {
  const sendMessage = useSendContactMessage();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      contact: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    await sendMessage.mutateAsync(values);
    setSubmitted(true);
    reset();
    toast.success('Mensaje enviado a Cine Small', {
      description: 'Nuestro equipo comercial se comunicará contigo a la brevedad.',
    });
  };

  return (
    <section
      id="contacto"
      className="border-t border-[#E2E8F0] bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Información y canales directos */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#FEF3C7]/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#92400E]">
                <Icon icon="solar:chat-round-dots-bold" className="h-3.5 w-3.5" />
                Atención Directa Cine Small
              </span>
              <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-[#0A192F] sm:text-4xl">
                ¿Quieres reservar una sala privada o un evento en el cine?
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#475569]">
                Coordinamos funciones privadas para cumpleaños, citas románticas,
                torneos gamer en pantalla gigante, combos Candy Bar y pedidos por
                delivery.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A192F] text-[#D4AF37]">
                  <Icon icon="solar:phone-calling-bold" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#475569]">
                    Línea Directa & WhatsApp
                  </p>
                  <p className="font-heading text-sm font-bold text-[#0A192F] tabular-nums">
                    +591 700 12345
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A192F] text-[#D4AF37]">
                  <Icon icon="solar:letter-bold" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#475569]">
                    Correo Comercial
                  </p>
                  <p className="font-heading text-sm font-bold text-[#0A192F]">
                    ventas@cinesmall.com
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={buildWhatsAppLink(
                  'Hola Cine Small (cinesmall.com), deseo realizar una consulta comercial.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-5 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-[#059669]"
              >
                <Icon icon="ic:baseline-whatsapp" className="h-5 w-5" />
                <span>Chatear por WhatsApp ahora</span>
              </a>

              <div className="flex items-center gap-2.5">
                {[
                  { name: 'Facebook', url: 'https://facebook.com', icon: 'ri:facebook-fill' },
                  { name: 'Instagram', url: 'https://instagram.com', icon: 'ri:instagram-line' },
                  { name: 'TikTok', url: 'https://tiktok.com', icon: 'ri:tiktok-fill' },
                  { name: 'X', url: 'https://x.com', icon: 'ri:twitter-x-fill' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0A192F] transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]"
                  >
                    <Icon icon={social.icon} className="h-4 w-4" />
                    <span className="hidden sm:inline">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Formulario con validación en tiempo real */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-sm sm:p-8 lg:col-span-7">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981]">
                  <Icon icon="solar:check-circle-bold" className="h-10 w-10" />
                </div>
                <h3 className="mt-4 font-heading text-2xl font-extrabold text-[#0A192F]">
                  ¡Mensaje recibido con éxito!
                </h3>
                <p className="mt-2 max-w-md text-sm text-[#475569]">
                  Tu consulta fue registrada en Cine Small (cinesmall.com). Un
                  asesor responderá a la brevedad.
                </p>
                <Button
                  onPress={() => setSubmitted(false)}
                  className="mt-6 rounded-xl bg-[#0A192F] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#112240]"
                >
                  Enviar otra consulta
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block text-xs font-semibold text-[#0F172A]"
                    >
                      Nombre completo *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Tu nombre"
                      {...register('name')}
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#D4AF37]"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs font-medium text-[#EF4444]">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-info"
                      className="mb-1.5 block text-xs font-semibold text-[#0F172A]"
                    >
                      Teléfono o Email *
                    </label>
                    <input
                      id="contact-info"
                      type="text"
                      placeholder="Ej. 71234567 o correo@empresa.com"
                      {...register('contact')}
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#D4AF37]"
                    />
                    {errors.contact && (
                      <p className="mt-1 text-xs font-medium text-[#EF4444]">
                        {errors.contact.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-1.5 block text-xs font-semibold text-[#0F172A]"
                  >
                    Asunto *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="Cotización de alquiler, disponibilidad de stock, asesoría..."
                    {...register('subject')}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#D4AF37]"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs font-medium text-[#EF4444]">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block text-xs font-semibold text-[#0F172A]"
                  >
                    Mensaje *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Cuéntanos qué producto o servicio necesitas, fechas o cantidades..."
                    {...register('message')}
                    className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#D4AF37]"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs font-medium text-[#EF4444]">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start justify-between gap-3 pt-2 sm:flex-row sm:items-center">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#475569]">
                    <Icon
                      icon={
                        isValid
                          ? 'solar:check-circle-bold'
                          : 'solar:info-circle-bold'
                      }
                      className={`h-4 w-4 ${
                        isValid ? 'text-[#10B981]' : 'text-[#F59E0B]'
                      }`}
                    />
                    {isValid
                      ? 'Formulario listo para enviar'
                      : 'Validación en tiempo real activa'}
                  </span>

                  <Button
                    type="submit"
                    isDisabled={isSubmitting}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-6 text-sm font-extrabold text-[#0A192F] shadow-sm transition-colors duration-200 hover:bg-[#E5C158] active:bg-[#B5952F] sm:w-auto"
                  >
                    <Icon icon="solar:plain-bold" className="h-4 w-4" />
                    <span>
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                    </span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

