import { Link } from '@tanstack/react-router';
import { Icon } from '@iconify/react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { STORE_CATEGORIES } from '@/data/seed';

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: 'ri:facebook-fill',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: 'ri:instagram-line',
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com',
    icon: 'ri:tiktok-fill',
  },
  {
    name: 'X',
    href: 'https://x.com',
    icon: 'ri:twitter-x-fill',
  },
];

export function Footer() {
  return (
    <footer className="border-t-2 border-[#D4AF37]/60 bg-[#0A192F] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Resumen de marca */}
          <div className="space-y-4">
            <BrandLogo />
            <p className="text-sm leading-relaxed text-slate-300">
              <strong className="text-white">Cine Small</strong> es tu complejo
              de micro-cine premier y tienda oficial: reserva salas privadas VIP,
              paquetes de cumpleaños, funciones para parejas, combos de Candy Bar
              y kits de cine en casa con pago QR inmediato.
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E3A5F] bg-[#112240] px-3 py-1.5 text-xs font-medium text-[#D4AF37]">
              <Icon icon="solar:global-bold" className="h-4 w-4" />
              <span>cinesmall.com</span>
            </div>
          </div>

          {/* Enlaces rápidos a categorías */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Categorías
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {STORE_CATEGORIES.map((category) => (
                <li key={category.name}>
                  <Link
                    to="/catalogo"
                    search={{ category: category.name }}
                    className="inline-flex items-center gap-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"
                  >
                    <Icon
                      icon="solar:alt-arrow-right-linear"
                      className="h-3.5 w-3.5 text-[#D4AF37]"
                    />
                    <span>{category.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Información de dominio y atención */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Atención y Dominio
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Icon
                  icon="solar:link-circle-bold"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]"
                />
                <span>
                  Portal oficial:{' '}
                  <span className="font-semibold text-white">
                    https://cinesmall.com
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon
                  icon="solar:letter-bold"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]"
                />
                <span>ventas@cinesmall.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon
                  icon="solar:phone-calling-bold"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]"
                />
                <span className="tabular-nums">+591 700 12345</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon
                  icon="solar:clock-circle-bold"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]"
                />
                <span>Lun - Sáb: 08:30 a 19:30</span>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Conecta con Cine Small
            </h3>
            <p className="mt-4 text-sm text-slate-300">
              Sigue nuestros lanzamientos, demostraciones de equipo y disponibilidad
              de alquileres en tiempo real.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1E3A5F] bg-[#112240] text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F]"
                >
                  <Icon icon={social.icon} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#112240] pt-6 text-xs text-slate-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Cine Small (cinesmall.com). Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-5">
            <Link
              to="/contacto"
              className="transition-colors hover:text-[#D4AF37]"
            >
              Centro de Contacto
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-[#D4AF37]"
            >
              <Icon icon="solar:lock-keyhole-minimalistic-bold" className="h-3.5 w-3.5" />
              <span>Portal Administrativo</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

