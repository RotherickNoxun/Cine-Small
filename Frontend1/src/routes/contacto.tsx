import { createFileRoute } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { ContactSection } from '@/components/sections/ContactSection';

export const Route = createFileRoute('/contacto')({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div>
      <section className="bg-hero-radial py-12 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/45 bg-[#112240] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            <Icon icon="solar:headphones-round-sound-bold" className="h-4 w-4" />
            Soporte & Ventas Cine Small
          </span>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Atención, Reservas de Salas & Candy Bar
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Consultas sobre disponibilidad de salas privadas VIP, paquetes de
            cumpleaños, combos de confitería y verificación de pagos QR en
            cinesmall.com.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#1E3A5F] bg-[#112240]/90 p-5">
              <Icon icon="solar:cup-hot-bold" className="h-6 w-6 text-[#D4AF37]" />
              <h2 className="mt-3 font-heading text-base font-bold">
                Candy Bar & Productos
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Combos de pipocas recién hechas, baldes coleccionables y packs de
                cine en casa para retiro en sala o delivery.
              </p>
            </div>
            <div className="rounded-2xl border border-[#1E3A5F] bg-[#112240]/90 p-5">
              <Icon
                icon="solar:clapperboard-play-bold"
                className="h-6 w-6 text-[#D4AF37]"
              />
              <h2 className="mt-3 font-heading text-base font-bold">
                Salas Privadas & Eventos
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Reserva de funciones privadas VIP, cumpleaños de película, citas
                románticas y sesiones gamer en 180&quot;.
              </p>
            </div>
            <div className="rounded-2xl border border-[#1E3A5F] bg-[#112240]/90 p-5">
              <Icon icon="solar:qr-code-bold" className="h-6 w-6 text-[#D4AF37]" />
              <h2 className="mt-3 font-heading text-base font-bold">
                Verificación QR Ágil
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Sube tu comprobante desde la web y notifica con un clic por
                WhatsApp para agilizar la aprobación.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}

