import { useRef, useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useUploadReceipt } from '@/hooks/useEcommerce';
import { formatDateShort, formatFileSize } from '@/lib/format';
import type { Order, OrderReceipt } from '@/types/ecommerce';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

interface ReceiptUploadModuleProps {
  order: Order;
}

export function ReceiptUploadModule({ order }: ReceiptUploadModuleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadReceipt = useUploadReceipt();

  const [isDragging, setIsDragging] = useState(false);
  const [draftReceipt, setDraftReceipt] = useState<OrderReceipt | null>(null);

  const activeReceipt = draftReceipt ?? order.receipt ?? null;

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isAllowedExt = ['jpg', 'jpeg', 'png', 'pdf'].includes(ext);
    if (!ACCEPTED_TYPES.includes(file.type) && !isAllowedExt) {
      toast.error('Formato no compatible', {
        description: 'Sube una imagen JPG, PNG o documento PDF.',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo supera los 5 MB permitidos', {
        description: `Peso detectado: ${formatFileSize(file.size)}`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;
      setDraftReceipt({
        fileName: file.name,
        fileType: file.type || (ext === 'pdf' ? 'application/pdf' : 'image/png'),
        fileSize: file.size,
        previewUrl: result,
        uploadedAt: new Date().toISOString(),
      });
      toast.success('Comprobante listo para enviar', {
        description: 'Revisa la vista previa y presiona "Enviar comprobante".',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmitReceipt = async () => {
    if (!draftReceipt) return;
    await uploadReceipt.mutateAsync({
      orderId: order.id,
      receipt: draftReceipt,
    });
    setDraftReceipt(null);
    toast.success('Comprobante enviado correctamente', {
      description: `El estado de pago de ${order.id} cambió a COMPROBANTE_ENVIADO.`,
    });
  };

  const isPdf =
    activeReceipt?.fileType === 'application/pdf' ||
    activeReceipt?.fileName.toLowerCase().endsWith('.pdf');

  return (
    <section className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#FEF3C7]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#92400E]">
          <Icon icon="solar:cloud-upload-bold" className="h-3.5 w-3.5" />
          Subida de Comprobante (Opcional / Recomendado)
        </span>
        <h2 className="mt-2 font-heading text-xl font-extrabold text-[#0A192F]">
          Adjunta tu voucher de transferencia
        </h2>
        <p className="mt-1 text-xs text-[#475569]">
          Acelera la verificación administrativa adjuntando la captura o PDF del
          pago (máx. 5 MB).
        </p>
      </div>

      {/* Zona Drag & Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Zona de carga para comprobante de pago"
        className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-7 text-center transition-all duration-200 ${
          isDragging
            ? 'border-[#D4AF37] bg-[#FEF3C7]/40'
            : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#D4AF37] hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = '';
          }}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A192F] text-[#D4AF37] shadow-sm">
          <Icon icon="solar:upload-minimalistic-bold" className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-bold text-[#0A192F]">
          Arrastra tu comprobante aquí o haz clic para seleccionarlo
        </p>
        <p className="mt-1 text-xs text-[#475569]">
          Formatos permitidos: JPG, PNG o PDF · Tamaño máximo 5 MB
        </p>
      </div>

      {/* Previsualización instantánea */}
      {activeReceipt && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <Icon
                icon={isPdf ? 'solar:document-text-bold' : 'solar:gallery-bold'}
                className="h-5 w-5 shrink-0 text-[#D4AF37]"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[#0A192F]">
                  {activeReceipt.fileName}
                </p>
                <p className="text-[11px] text-[#475569] tabular-nums">
                  {formatFileSize(activeReceipt.fileSize)} ·{' '}
                  {draftReceipt
                    ? 'Listo para enviar'
                    : `Enviado el ${formatDateShort(activeReceipt.uploadedAt)}`}
                </p>
              </div>
            </div>
            {draftReceipt && (
              <button
                type="button"
                onClick={() => setDraftReceipt(null)}
                aria-label="Quitar archivo seleccionado"
                className="rounded-lg p-1.5 text-[#475569] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="p-3">
            {isPdf ? (
              <div className="h-64 w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
                <Worker workerUrl={pdfWorkerUrl}>
                  <Viewer fileUrl={activeReceipt.previewUrl} />
                </Worker>
              </div>
            ) : (
              <img
                src={activeReceipt.previewUrl}
                alt={`Comprobante ${activeReceipt.fileName}`}
                className="mx-auto max-h-64 rounded-xl border border-[#E2E8F0] bg-white object-contain"
              />
            )}
          </div>
        </div>
      )}

      {/* Botón Enviar Comprobante */}
      <div className="mt-5">
        <Button
          onPress={handleSubmitReceipt}
          isDisabled={!draftReceipt || uploadReceipt.isPending}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold transition-colors duration-200 ${
            draftReceipt
              ? 'bg-[#D4AF37] text-[#0A192F] shadow-md hover:bg-[#E5C158] active:bg-[#B5952F]'
              : 'cursor-not-allowed bg-slate-200 text-slate-500'
          }`}
        >
          <Icon icon="solar:check-circle-bold" className="h-5 w-5" />
          <span>
            {uploadReceipt.isPending
              ? 'Subiendo comprobante...'
              : order.receipt && !draftReceipt
                ? 'Comprobante ya enviado (selecciona otro si deseas reemplazar)'
                : 'Enviar comprobante'}
          </span>
        </Button>
      </div>
    </section>
  );
}

