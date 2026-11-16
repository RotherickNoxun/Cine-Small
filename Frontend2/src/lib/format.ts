import type { OrderStatus, PaymentStatus } from '@/types/ecommerce';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('BOB', 'Bs.');
}

export function formatDateShort(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function normalizePhoneForWhatsApp(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('591') || digits.length > 9) return digits;
  return `591${digits}`;
}

export function buildCustomerWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function getPaymentStageLabel(status: PaymentStatus): string {
  switch (status) {
    case 'PENDIENTE':
      return 'Sin comprobante';
    case 'COMPROBANTE_ENVIADO':
      return 'Comprobante por verificar';
    case 'PAGADO':
      return 'Pago aprobado';
    case 'RECHAZADO':
      return 'Rechazado';
  }
}

export function getOrderStageLabel(status: OrderStatus): string {
  switch (status) {
    case 'PENDIENTE':
      return 'Pendiente';
    case 'VERIFICADO':
      return 'Pagado';
    case 'ENVIADO_COMPLETADO':
      return 'Enviado';
    case 'CANCELADO':
      return 'Cancelado';
  }
}

export function slugifyProductName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function createBrandedFallbackImage(title: string, category: string): string {
  const safeTitle = title.replace(/[<>&"']/g, '').slice(0, 32);
  const safeCategory = category.replace(/[<>&"']/g, '').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <radialGradient id="bg" cx="50%" cy="35%" r="75%">
        <stop offset="0%" stop-color="#112240" />
        <stop offset="100%" stop-color="#0A192F" />
      </radialGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg)"/>
    <rect x="40" y="40" width="720" height="520" rx="20" fill="none" stroke="#D4AF37" stroke-opacity="0.4" stroke-width="2"/>
    <circle cx="400" cy="240" r="56" fill="#D4AF37" fill-opacity="0.16" stroke="#D4AF37" stroke-width="2.5"/>
    <path d="M386 218 L424 240 L386 262 Z" fill="#D4AF37"/>
    <text x="400" y="340" text-anchor="middle" fill="#D4AF37" font-family="sans-serif" font-size="16" font-weight="700" letter-spacing="4">${safeCategory}</text>
    <text x="400" y="382" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="24" font-weight="700">${safeTitle}</text>
    <text x="400" y="425" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="14">cinesmall.com</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

