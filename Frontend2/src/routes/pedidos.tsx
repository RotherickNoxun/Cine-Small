import { useEffect, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { PaymentStatusBadge } from '@/components/ui/AdminBadges';
import { OrderAuditDrawer } from '@/components/orders/OrderAuditDrawer';
import { useOrders, useUpdateOrderWorkflow } from '@/hooks/useAdminStore';
import {
  buildCustomerWhatsAppLink,
  formatCurrency,
  formatDateShort,
  getOrderStageLabel,
} from '@/lib/format';
import type { Order, OrderStatus, PaymentStatus } from '@/types/ecommerce';

type OrderWorkflowFilter = 'ALL' | 'PENDIENTE' | 'VERIFICADO' | 'ENVIADO_COMPLETADO';
type PaymentFilter = 'ALL' | PaymentStatus;

export const Route = createFileRoute('/pedidos')({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === 'string' ? search.orderId : undefined,
  }),
  component: OrdersManagementPage,
});

const columnHelper = createColumnHelper<Order>();

function OrdersManagementPage() {
  const { orderId: urlOrderId } = Route.useSearch();
  const { data: orders = [] } = useOrders();
  const updateWorkflow = useUpdateOrderWorkflow();

  const [searchQuery, setSearchQuery] = useState('');
  const [orderTab, setOrderTab] = useState<OrderWorkflowFilter>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!urlOrderId) return;
    const normalized = urlOrderId.startsWith('#')
      ? urlOrderId
      : `#${urlOrderId}`;
    const found = orders.find(
      (o) => o.id.toUpperCase() === normalized.toUpperCase()
    );
    if (found) {
      setActiveOrderId(found.id);
    }
  }, [urlOrderId, orders]);

  const activeOrder = useMemo<Order | null>(
    () => orders.find((o) => o.id === activeOrderId) ?? null,
    [orders, activeOrderId]
  );

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .filter((order) => {
        if (orderTab !== 'ALL' && order.orderStatus !== orderTab) return false;
        if (paymentFilter !== 'ALL' && order.paymentStatus !== paymentFilter)
          return false;
        if (!q) return true;
        return (
          order.id.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerPhone.toLowerCase().includes(q)
        );
      });
  }, [orders, searchQuery, orderTab, paymentFilter]);

  const handleQuickOrderStage = async (
    order: Order,
    nextStatus: OrderStatus
  ) => {
    await updateWorkflow.mutateAsync({
      orderId: order.id,
      orderStatus: nextStatus,
    });
    toast.success(
      `Pedido ${order.id} actualizado a ${getOrderStageLabel(nextStatus)}`
    );
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID Orden',
        cell: (info) => (
          <span className="font-heading text-sm font-extrabold text-[#0A192F] tabular-nums">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Fecha y Hora',
        cell: (info) => (
          <span className="text-xs font-medium text-[#475569] tabular-nums">
            {formatDateShort(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('customerName', {
        header: 'Cliente',
        cell: (info) => {
          const order = info.row.original;
          const waUrl = buildCustomerWhatsAppLink(
            order.customerPhone,
            `Hola ${order.customerName}, te contactamos de Cine Small sobre tu pedido ${order.id}.`
          );
          return (
            <div className="space-y-1">
              <p className="font-bold text-[#0F172A]">{order.customerName}</p>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-[#10B981]/15 px-2 py-0.5 text-[11px] font-bold text-[#047857] hover:bg-[#10B981] hover:text-white tabular-nums"
              >
                <Icon icon="ic:baseline-whatsapp" className="h-3.5 w-3.5" />
                <span>{order.customerPhone}</span>
              </a>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'summary',
        header: 'Resumen de Ítems',
        cell: (info) => {
          const items = info.row.original.items;
          const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
          const hasServices = items.some((i) => i.type === 'SERVICIO');
          const hasStandard = items.some((i) => i.type === 'ESTANDAR');
          return (
            <div className="text-xs">
              <p className="font-bold text-[#0F172A] tabular-nums">
                {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'}
              </p>
              <p className="text-[#475569]">
                {hasStandard && hasServices
                  ? 'Estándar + Servicio'
                  : hasServices
                    ? 'Servicio / Alquiler'
                    : 'Producto Estándar'}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-heading text-sm font-extrabold text-[#0A192F] tabular-nums">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'Estado de Pago',
        cell: (info) => <PaymentStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('orderStatus', {
        header: 'Estado de Pedido',
        cell: (info) => {
          const order = info.row.original;
          return (
            <select
              aria-label={`Estado rápido del pedido ${order.id}`}
              value={order.orderStatus}
              onChange={(e) =>
                handleQuickOrderStage(order, e.target.value as OrderStatus)
              }
              className="h-9 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-xs font-bold text-[#0A192F] outline-none focus:border-[#D4AF37]"
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="VERIFICADO">Pagado</option>
              <option value="ENVIADO_COMPLETADO">Enviado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          );
        },
      }),
      columnHelper.display({
        id: 'manage',
        header: 'Acción',
        cell: (info) => {
          const order = info.row.original;
          const needsAttention = order.paymentStatus === 'COMPROBANTE_ENVIADO';
          return (
            <button
              type="button"
              onClick={() => setActiveOrderId(order.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold whitespace-nowrap transition ${
                needsAttention
                  ? 'bg-[#D4AF37] text-[#0A192F] hover:bg-[#E5C158]'
                  : 'bg-[#0A192F] text-white hover:bg-[#112240]'
              }`}
            >
              <Icon icon="solar:document-text-bold" className="h-3.5 w-3.5" />
              <span>
                {order.receipt
                  ? 'Gestionar / Ver Comprobante'
                  : 'Gestionar Pedido'}
              </span>
            </button>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const orderTabs: { id: OrderWorkflowFilter; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'PENDIENTE', label: 'Pendiente' },
    { id: 'VERIFICADO', label: 'Pagado' },
    { id: 'ENVIADO_COMPLETADO', label: 'Enviado' },
  ];

  return (
    <div className="space-y-5">
      {/* Barra de Filtros Avanzados */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Buscador */}
          <div className="relative flex-1 lg:max-w-md">
            <Icon
              icon="solar:magnifer-linear"
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#475569]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID (#CS-...), cliente o teléfono..."
              className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pr-3 pl-10 text-xs font-medium text-[#0F172A] outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Filtro por Estado de Pago */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#475569]">Pago QR:</span>
            <select
              aria-label="Filtrar por estado de pago QR"
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value as PaymentFilter)
              }
              className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-bold text-[#0A192F] outline-none focus:border-[#D4AF37]"
            >
              <option value="ALL">Todos los pagos</option>
              <option value="PENDIENTE">Sin comprobante</option>
              <option value="COMPROBANTE_ENVIADO">
                Comprobante por verificar
              </option>
              <option value="PAGADO">Pago aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
        </div>

        {/* Pestañas rápidas de Estado del Pedido */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E2E8F0] pt-4">
          {orderTabs.map((tab) => {
            const active = orderTab === tab.id;
            const count =
              tab.id === 'ALL'
                ? orders.length
                : orders.filter((o) => o.orderStatus === tab.id).length;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOrderTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? 'bg-[#0A192F] text-[#D4AF37]'
                    : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:text-[#0A192F]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums ${
                    active
                      ? 'bg-[#D4AF37] text-[#0A192F]'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tabla en PC (md+) */}
      <section className="hidden overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-[#0A192F] text-xs font-bold uppercase tracking-wider text-white">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-[#475569]"
                  >
                    No hay pedidos que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition hover:bg-[#F8FAFC]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tarjetas Apiladas en Móvil (<md) */}
      <section className="space-y-3 md:hidden">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center text-xs text-[#475569]">
            No hay pedidos que coincidan con los filtros seleccionados.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const waUrl = buildCustomerWhatsAppLink(
              order.customerPhone,
              `Hola ${order.customerName}, te contactamos de Cine Small sobre tu pedido ${order.id}.`
            );
            return (
              <article
                key={order.id}
                className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-heading text-sm font-extrabold text-[#0A192F] tabular-nums">
                      {order.id}
                    </span>
                    <p className="text-[11px] text-[#475569] tabular-nums">
                      {formatDateShort(order.createdAt)}
                    </p>
                  </div>
                  <span className="font-heading text-base font-extrabold text-[#0A192F] tabular-nums">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-[#475569]">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} ítem(s)
                    </p>
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-[#10B981]/15 px-2.5 py-1 text-xs font-bold text-[#047857]"
                  >
                    <Icon icon="ic:baseline-whatsapp" className="h-4 w-4" />
                    <span>{order.customerPhone}</span>
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-3">
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <select
                    aria-label={`Cambiar estado del pedido ${order.id}`}
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleQuickOrderStage(
                        order,
                        e.target.value as OrderStatus
                      )
                    }
                    className="h-8 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 text-xs font-bold text-[#0A192F]"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="VERIFICADO">Pagado</option>
                    <option value="ENVIADO_COMPLETADO">Enviado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveOrderId(order.id)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0A192F] text-xs font-extrabold text-[#D4AF37]"
                >
                  <Icon icon="solar:document-text-bold" className="h-4 w-4" />
                  <span>
                    {order.receipt
                      ? 'Gestionar / Ver Comprobante'
                      : 'Gestionar Pedido'}
                  </span>
                </button>
              </article>
            );
          })
        )}
      </section>

      <OrderAuditDrawer
        order={activeOrder}
        onClose={() => setActiveOrderId(null)}
      />
    </div>
  );
}

