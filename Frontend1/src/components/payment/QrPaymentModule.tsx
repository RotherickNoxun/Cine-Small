import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { BANK_ACCOUNT_INFO } from '@/data/seed';
import { formatCurrency, stripOrderHash } from '@/lib/format';
import type { Order } from '@/types/ecommerce';

interface QrPaymentModuleProps {
  order: Order;
}

export function QrPaymentModule({ order }: QrPaymentModuleProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const qrPayload = `CINESMALL|PEDIDO:${order.id}|MONTO:${order.total.toFixed(2)}|BOB|CUENTA:${BANK_ACCOUNT_INFO.accountNumber}|TITULAR:${BANK_ACCOUNT_INFO.holder}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(qrPayload, {
      width: 560,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0A192F',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        // Fallback silencioso
      });
    return () => {
      active = false;
    };
  }, [qrPayload]);

  const handleCopyAmount = async () => {
    const exactValue = order.total.toFixed(2);
    try {
      await navigator.clipboard.writeText(exactValue);
      toast.success(`Monto exacto copiado: ${formatCurrency(order.total)}`, {
        description: `Valor copiado al portapapeles (${exactValue})`,
      });
    } catch {
      toast.info(`Monto a transferir: ${exactValue}`);
    }
  };

  const handleCopyAccount = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado: ${text}`);
    } catch {
      toast.info(`${label}: ${text}`);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 880;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#0A192F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 8;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CINE SMALL — PAGO QR PREMIER', 360, 88);

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Pedido ${order.id} · cinesmall.com`, 360, 128);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(100, 165, 520, 520);
      ctx.drawImage(img, 120, 185, 480, 480);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`Total: ${formatCurrency(order.total)}`, 360, 745);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '20px sans-serif';
      ctx.fillText(
        `${BANK_ACCOUNT_INFO.bankName} · Cta ${BANK_ACCOUNT_INFO.accountNumber}`,
        360,
        795
      );

      const link = document.createElement('a');
      link.download = `CineSmall-QR-${stripOrderHash(order.id)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Código QR descargado en alta resolución');
    };
    img.src = qrDataUrl;
  };

  return (
    <section className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A192F] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
            <Icon icon="solar:qr-code-bold" className="h-3.5 w-3.5" />
            Pago Bancario QR Simple
          </span>
          <h2 className="mt-2 font-heading text-xl font-extrabold text-[#0A192F]">
            Escanea y transfiere el monto exacto
          </h2>
        </div>
      </div>

      {/* Marco Dorado del QR */}
      <div className="mt-5 flex flex-col items-center rounded-2xl bg-[#F8FAFC] p-5 border border-[#E2E8F0]">
        <div className="rounded-2xl border-4 border-[#D4AF37] bg-white p-4 shadow-lg">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Código QR bancario para pedido ${order.id}`}
              className="h-56 w-56 sm:h-64 sm:w-64"
            />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
              <Icon
                icon="solar:qr-code-bold"
                className="h-16 w-16 animate-pulse text-[#0A192F]/30"
              />
            </div>
          )}
        </div>

        <Button
          onPress={handleDownloadQr}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-[#0A192F]/20 bg-white px-4 text-xs font-bold text-[#0A192F] shadow-xs transition-colors hover:border-[#D4AF37] hover:bg-[#FEF3C7]/40"
        >
          <Icon icon="solar:download-minimalistic-bold" className="h-4 w-4 text-[#D4AF37]" />
          <span>Descargar QR</span>
        </Button>
      </div>

      {/* Monto exacto en grande + Copiar monto */}
      <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-[#0A192F] p-4 text-white sm:flex-row sm:px-5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Monto exacto a transferir
          </span>
          <p className="font-heading text-2xl font-extrabold text-[#D4AF37] tabular-nums sm:text-3xl">
            {formatCurrency(order.total)}
          </p>
        </div>
        <Button
          onPress={handleCopyAmount}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 text-xs font-extrabold text-[#0A192F] transition-colors hover:bg-[#E5C158] active:bg-[#B5952F] sm:w-auto"
        >
          <Icon icon="solar:copy-bold" className="h-4 w-4" />
          <span>Copiar monto</span>
        </Button>
      </div>

      {/* Datos de cuenta de respaldo */}
      <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#0A192F]">
          Datos de Cuenta Bancaria de Respaldo
        </h3>
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#475569]">Entidad:</span>
            <span className="font-semibold text-[#0F172A]">
              {BANK_ACCOUNT_INFO.bankName}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#475569]">Titular:</span>
            <span className="font-semibold text-[#0F172A]">
              {BANK_ACCOUNT_INFO.holder}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#475569]">Nro. de Cuenta:</span>
            <button
              type="button"
              onClick={() =>
                handleCopyAccount('Cuenta', BANK_ACCOUNT_INFO.accountNumber)
              }
              className="inline-flex items-center gap-1 font-bold text-[#0A192F] tabular-nums hover:text-[#D4AF37]"
            >
              <span>{BANK_ACCOUNT_INFO.accountNumber}</span>
              <Icon icon="solar:copy-linear" className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#475569]">NIT:</span>
            <button
              type="button"
              onClick={() => handleCopyAccount('NIT', BANK_ACCOUNT_INFO.nit)}
              className="inline-flex items-center gap-1 font-bold text-[#0A192F] tabular-nums hover:text-[#D4AF37]"
            >
              <span>{BANK_ACCOUNT_INFO.nit}</span>
              <Icon icon="solar:copy-linear" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

