import { useState } from 'react';
import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { formatCurrency, formatDateShort, stripOrderHash } from '@/lib/format';
import type { Order } from '@/types/ecommerce';

const pdfStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#0A192F',
    padding: 18,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandGold: {
    color: '#D4AF37',
  },
  domain: {
    fontSize: 9,
    color: '#CBD5E1',
    marginTop: 4,
  },
  orderTag: {
    alignItems: 'flex-end',
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  dateText: {
    fontSize: 9,
    color: '#E2E8F0',
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0A192F',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#112240',
    color: '#FFFFFF',
    padding: 8,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
  },
  colName: { width: '50%' },
  colType: { width: '18%' },
  colQty: { width: '12%', textAlign: 'right' },
  colPrice: { width: '20%', textAlign: 'right' },
  totalBox: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  totalPill: {
    backgroundColor: '#0A192F',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  totalText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    fontSize: 8,
    color: '#475569',
    textAlign: 'center',
  },
});

function OrderPdfDocument({ order }: { order: Order }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.brandTitle}>
              CINE <Text style={pdfStyles.brandGold}>SMALL</Text>
            </Text>
            <Text style={pdfStyles.domain}>
              cinesmall.com · Productos, Equipamiento & Servicios
            </Text>
          </View>
          <View style={pdfStyles.orderTag}>
            <Text style={pdfStyles.orderIdText}>{order.id}</Text>
            <Text style={pdfStyles.dateText}>{formatDateShort(order.createdAt)}</Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Datos del Cliente y Entrega</Text>
        <View style={pdfStyles.card}>
          <View style={pdfStyles.row}>
            <Text>Cliente: {order.customerName}</Text>
            <Text>Teléfono: {order.customerPhone}</Text>
          </View>
          <Text>Dirección / Ubicación: {order.address}</Text>
          {order.notes && <Text>Notas: {order.notes}</Text>}
          <Text style={{ marginTop: 4 }}>
            Estado Pago: {order.paymentStatus} | Estado Pedido: {order.orderStatus}
          </Text>
        </View>

        <Text style={pdfStyles.sectionTitle}>Detalle del Pedido</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.colName}>Producto / Servicio</Text>
          <Text style={pdfStyles.colType}>Tipo</Text>
          <Text style={pdfStyles.colQty}>Cant.</Text>
          <Text style={pdfStyles.colPrice}>Subtotal</Text>
        </View>
        {order.items.map((item) => (
          <View key={item.productId} style={pdfStyles.tableRow}>
            <Text style={pdfStyles.colName}>{item.name}</Text>
            <Text style={pdfStyles.colType}>
              {item.type === 'SERVICIO' ? 'Servicio' : 'Estándar'}
            </Text>
            <Text style={pdfStyles.colQty}>{item.quantity}</Text>
            <Text style={pdfStyles.colPrice}>
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </View>
        ))}

        <View style={pdfStyles.totalBox}>
          <View style={pdfStyles.totalPill}>
            <Text style={pdfStyles.totalText}>
              TOTAL A PAGAR: {formatCurrency(order.total)}
            </Text>
          </View>
        </View>

        <Text style={pdfStyles.footer}>
          Documento generado automáticamente por Cine Small (cinesmall.com) · Pago
          verificado vía QR Simple y confirmación administrativa.
        </Text>
      </Page>
    </Document>
  );
}

export function OrderPdfButton({ order }: { order: Order }) {
  const [generating, setGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setGenerating(true);
      const blob = await pdf(<OrderPdfDocument order={order} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CineSmall-Pedido-${stripOrderHash(order.id)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Resumen PDF de ${order.id} descargado`);
    } catch {
      toast.error('No se pudo generar el PDF en este navegador');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onPress={handleDownloadPdf}
      isDisabled={generating}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#1E3A5F] bg-[#112240] px-4 text-xs font-bold text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
    >
      <Icon icon="solar:file-download-bold" className="h-4 w-4 text-[#D4AF37]" />
      <span>{generating ? 'Generando PDF...' : 'Resumen PDF'}</span>
    </Button>
  );
}

