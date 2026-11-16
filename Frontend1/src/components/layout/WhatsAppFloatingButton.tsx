import { Icon } from '@iconify/react';
import { buildWhatsAppLink } from '@/lib/format';

export function WhatsAppFloatingButton() {
  const whatsappUrl = buildWhatsAppLink(
    'Hola Cine Small (cinesmall.com), quisiera recibir atención personalizada sobre sus productos y servicios.'
  );

  return (
    <div className="group fixed right-5 bottom-5 z-50 flex items-center gap-3 sm:right-6 sm:bottom-6">
      {/* Tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none translate-x-2 rounded-xl border border-[#D4AF37]/50 bg-[#0A192F] px-3.5 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100"
      >
        Chatea con nosotros
      </span>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatea con nosotros por WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-xl ring-4 ring-white/90 transition-transform duration-200 hover:scale-105 hover:bg-[#059669] focus:outline-none focus:ring-[#D4AF37]"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#10B981]/35" />
        <Icon icon="ic:baseline-whatsapp" className="relative h-7 w-7" />
      </a>
    </div>
  );
}

