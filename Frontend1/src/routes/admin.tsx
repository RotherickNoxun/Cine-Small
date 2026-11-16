import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  ProductTypeBadge,
} from '@/components/ui/StatusBadge';
import {
  useDeleteMovie,
  useMovies,
  useOrders,
  useProducts,
  useUpdateOrderStatus,
  useUpsertMovie,
  useUpsertProduct,
} from '@/hooks/useEcommerce';
import {
  formatCurrency,
  formatDateShort,
  stripOrderHash,
} from '@/lib/format';
import type {
  Movie,
  MovieFormat,
  MovieLanguage,
  MovieStatus,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
} from '@/types/ecommerce';

export const Route = createFileRoute('/admin')({
  component: AdminPortalPage,
});

const columnHelper = createColumnHelper<Order>();

function AdminPortalPage() {
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();
  const { data: movies = [] } = useMovies();
  const updateOrderStatus = useUpdateOrderStatus();
  const upsertProduct = useUpsertProduct();
  const upsertMovie = useUpsertMovie();
  const deleteMovie = useDeleteMovie();

  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'cartelera'>(
    'orders'
  );
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newMovieGenre, setNewMovieGenre] = useState('Acción / Estreno');
  const [newMovieDuration, setNewMovieDuration] = useState('2h 10m');
  const [newMovieStatus, setNewMovieStatus] = useState<MovieStatus>('ESTRENO');
  const [newMovieTime, setNewMovieTime] = useState('20:00');
  const [newMovieFormat, setNewMovieFormat] =
    useState<MovieFormat>('4K LÁSER VIP');
  const [newMovieLang, setNewMovieLang] =
    useState<MovieLanguage>('SUBTITULADA');
  const [newMoviePrice, setNewMoviePrice] = useState('60');

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'PAGADO')
      .reduce((sum, o) => sum + o.total, 0);
    const pendingReview = orders.filter(
      (o) =>
        o.paymentStatus === 'COMPROBANTE_ENVIADO' ||
        o.paymentStatus === 'PENDIENTE'
    ).length;
    const completed = orders.filter(
      (o) => o.orderStatus === 'ENVIADO_COMPLETADO'
    ).length;
    return { totalRevenue, pendingReview, completed };
  }, [orders]);

  const chartData = useMemo(() => {
    const map = {
      Pendiente: 0,
      'Con Comprobante': 0,
      Pagado: 0,
      Rechazado: 0,
    };
    for (const o of orders) {
      if (o.paymentStatus === 'PENDIENTE') map.Pendiente += o.total;
      if (o.paymentStatus === 'COMPROBANTE_ENVIADO')
        map['Con Comprobante'] += o.total;
      if (o.paymentStatus === 'PAGADO') map.Pagado += o.total;
      if (o.paymentStatus === 'RECHAZADO') map.Rechazado += o.total;
    }
    return Object.entries(map).map(([estado, monto]) => ({ estado, monto }));
  }, [orders]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Pedido',
        cell: (info) => {
          const order = info.row.original;
          return (
            <div>
              <Link
                to="/pago/$orderId"
                params={{ orderId: stripOrderHash(order.id) }}
                className="font-heading font-bold text-[#0A192F] underline decoration-[#D4AF37] tabular-nums hover:text-[#D4AF37]"
              >
                {order.id}
              </Link>
              <p className="text-[11px] text-[#475569] tabular-nums">
                {formatDateShort(order.createdAt)}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor('customerName', {
        header: 'Cliente',
        cell: (info) => {
          const order = info.row.original;
          return (
            <div>
              <p className="font-semibold text-[#0F172A]">{order.customerName}</p>
              <p className="text-xs text-[#475569] tabular-nums">
                Tel: {order.customerPhone}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor('total', {
        header: 'Monto',
        cell: (info) => (
          <span className="font-heading font-extrabold text-[#0A192F] tabular-nums">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'Estado de Pago',
        cell: (info) => {
          const order = info.row.original;
          return (
            <div className="space-y-1.5">
              <PaymentStatusBadge status={order.paymentStatus} />
              <select
                aria-label={`Cambiar estado de pago de ${order.id}`}
                value={order.paymentStatus}
                onChange={async (e) => {
                  const nextPayment = e.target.value as PaymentStatus;
                  await updateOrderStatus.mutateAsync({
                    orderId: order.id,
                    paymentStatus: nextPayment,
                  });
                  toast.success(`Pago de ${order.id} actualizado a ${nextPayment}`);
                }}
                className="block w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-xs font-medium text-[#0F172A]"
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="COMPROBANTE_ENVIADO">COMPROBANTE_ENVIADO</option>
                <option value="PAGADO">PAGADO</option>
                <option value="RECHAZADO">RECHAZADO</option>
              </select>
            </div>
          );
        },
      }),
      columnHelper.accessor('orderStatus', {
        header: 'Estado de Pedido',
        cell: (info) => {
          const order = info.row.original;
          return (
            <div className="space-y-1.5">
              <OrderStatusBadge status={order.orderStatus} />
              <select
                aria-label={`Cambiar estado logístico de ${order.id}`}
                value={order.orderStatus}
                onChange={async (e) => {
                  const nextOrder = e.target.value as OrderStatus;
                  await updateOrderStatus.mutateAsync({
                    orderId: order.id,
                    orderStatus: nextOrder,
                  });
                  toast.success(`Pedido ${order.id} actualizado a ${nextOrder}`);
                }}
                className="block w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-xs font-medium text-[#0F172A]"
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="VERIFICADO">VERIFICADO</option>
                <option value="ENVIADO_COMPLETADO">ENVIADO_COMPLETADO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Comprobante',
        cell: (info) => {
          const order = info.row.original;
          return order.receipt ? (
            <button
              type="button"
              onClick={() => setPreviewOrder(order)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#D4AF37] bg-[#FEF3C7]/40 px-2.5 py-1.5 text-xs font-bold text-[#92400E] hover:bg-[#D4AF37] hover:text-[#0A192F]"
            >
              <Icon icon="solar:eye-bold" className="h-3.5 w-3.5" />
              <span>Ver archivo</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">Sin adjunto</span>
          );
        },
      }),
    ],
    [updateOrderStatus]
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const toggleProductFlag = async (
    product: Product,
    field: 'isFeatured' | 'isActive'
  ) => {
    await upsertProduct.mutateAsync({
      ...product,
      [field]: !product[field],
    });
    toast.success(`Catálogo actualizado: ${product.name}`);
  };

  return (
    <div className="min-h-[80vh] pb-16">
      {/* Header Admin */}
      <section className="bg-hero-radial py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#112240] px-3 py-1 text-xs font-bold text-[#D4AF37]">
              <Icon icon="solar:shield-check-bold" className="h-4 w-4" />
              Portal Administrativo · Cine Small
            </span>
            <h1 className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl">
              Gestión de Pedidos QR y Catálogo
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onPress={() => setActiveTab('orders')}
              className={`rounded-xl px-4 py-2 text-xs font-bold ${
                activeTab === 'orders'
                  ? 'bg-[#D4AF37] text-[#0A192F]'
                  : 'border border-[#1E3A5F] bg-[#112240] text-white'
              }`}
            >
              Pedidos ({orders.length})
            </Button>
            <Button
              onPress={() => setActiveTab('cartelera')}
              className={`rounded-xl px-4 py-2 text-xs font-bold ${
                activeTab === 'cartelera'
                  ? 'bg-[#D4AF37] text-[#0A192F]'
                  : 'border border-[#1E3A5F] bg-[#112240] text-white'
              }`}
            >
              Cartelera ({movies.length})
            </Button>
            <Button
              onPress={() => setActiveTab('catalog')}
              className={`rounded-xl px-4 py-2 text-xs font-bold ${
                activeTab === 'catalog'
                  ? 'bg-[#D4AF37] text-[#0A192F]'
                  : 'border border-[#1E3A5F] bg-[#112240] text-white'
              }`}
            >
              Candy Bar & Salas ({products.length})
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-8 sm:px-6 lg:px-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Ingresos Verificados
            </span>
            <p className="mt-1 font-heading text-2xl font-extrabold text-[#10B981] tabular-nums">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Por Verificar / Pendientes
            </span>
            <p className="mt-1 font-heading text-2xl font-extrabold text-[#F59E0B] tabular-nums">
              {stats.pendingReview} pedidos
            </p>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Enviados / Completados
            </span>
            <p className="mt-1 font-heading text-2xl font-extrabold text-[#0A192F] tabular-nums">
              {stats.completed} pedidos
            </p>
          </div>
        </div>

        {activeTab === 'orders' ? (
          <>
            {/* Gráfico Recharts */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#0A192F]">
                Volumen de Pedidos por Estado de Pago (Bs.)
              </h2>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="estado" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Bar dataKey="monto" fill="#D4AF37" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla TanStack Table v8 */}
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
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
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#F8FAFC]">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3.5 align-top">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeTab === 'cartelera' ? (
          <div className="space-y-6">
            {/* Alta dinámica de película en Cartelera */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newMovieTitle.trim()) {
                  toast.error('Ingresa el título de la película');
                  return;
                }
                const priceNum = Number.parseFloat(newMoviePrice) || 50;
                const created: Movie = {
                  id: `mov-${Date.now()}`,
                  title: newMovieTitle.trim(),
                  genre: newMovieGenre.trim() || 'Cine Premier',
                  duration: newMovieDuration.trim() || '2h 00m',
                  rating: 'B-12',
                  score: '9.0',
                  status: newMovieStatus,
                  director: 'Estreno Cine Small',
                  synopsis:
                    'Nueva función agregada dinámicamente desde el Portal Administrativo de Cine Small.',
                  posterUrl:
                    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80',
                  backdropUrl:
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
                  isActive: true,
                  isFeatured: true,
                  showtimes: [
                    {
                      id: `st-${Date.now()}`,
                      time: newMovieTime || '20:00',
                      room: 'Sala VIP Láser',
                      format: newMovieFormat,
                      language: newMovieLang,
                      ticketPrice: priceNum,
                      occupiedSeats: [],
                    },
                  ],
                };
                await upsertMovie.mutateAsync(created);
                setNewMovieTitle('');
                toast.success(`"${created.title}" publicada en la Cartelera`);
              }}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs"
            >
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#0A192F]">
                Agregar Película a Cartelera en Vivo
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  type="text"
                  value={newMovieTitle}
                  onChange={(e) => setNewMovieTitle(e.target.value)}
                  placeholder="Título de la película *"
                  className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#D4AF37]"
                />
                <input
                  type="text"
                  value={newMovieGenre}
                  onChange={(e) => setNewMovieGenre(e.target.value)}
                  placeholder="Género"
                  className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#D4AF37]"
                />
                <input
                  type="text"
                  value={newMovieDuration}
                  onChange={(e) => setNewMovieDuration(e.target.value)}
                  placeholder="Duración (ej. 2h 10m)"
                  className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#D4AF37]"
                />
                <select
                  value={newMovieStatus}
                  onChange={(e) =>
                    setNewMovieStatus(e.target.value as MovieStatus)
                  }
                  className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0F172A]"
                >
                  <option value="ESTRENO">ESTRENO</option>
                  <option value="EN_CARTELERA">EN_CARTELERA</option>
                  <option value="PREVENTA">PREVENTA</option>
                  <option value="PROXIMAMENTE">PROXIMAMENTE</option>
                </select>
                <input
                  type="text"
                  value={newMovieTime}
                  onChange={(e) => setNewMovieTime(e.target.value)}
                  placeholder="Horario (ej. 20:00)"
                  className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium text-[#0F172A] tabular-nums outline-none focus:border-[#D4AF37]"
                />
                <select
                  value={newMovieFormat}
                  onChange={(e) =>
                    setNewMovieFormat(e.target.value as MovieFormat)
                  }
                  className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0F172A]"
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="4K LÁSER VIP">4K LÁSER VIP</option>
                </select>
                <select
                  value={newMovieLang}
                  onChange={(e) =>
                    setNewMovieLang(e.target.value as MovieLanguage)
                  }
                  className="h-10 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-semibold text-[#0F172A]"
                >
                  <option value="DOBLADA">DOBLADA</option>
                  <option value="SUBTITULADA">SUBTITULADA</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="10"
                    value={newMoviePrice}
                    onChange={(e) => setNewMoviePrice(e.target.value)}
                    placeholder="Bs."
                    className="h-10 w-24 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-bold text-[#0F172A] tabular-nums outline-none focus:border-[#D4AF37]"
                  />
                  <Button
                    type="submit"
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] px-4 text-xs font-extrabold text-[#0A192F] hover:bg-[#E5C158]"
                  >
                    <Icon icon="solar:add-circle-bold" className="h-4 w-4" />
                    <span>Publicar</span>
                  </Button>
                </div>
              </div>
            </form>

            {/* Tabla de Películas en Cartelera */}
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="bg-[#0A192F] text-xs font-bold uppercase tracking-wider text-white">
                    <tr>
                      <th className="px-4 py-3.5">Película</th>
                      <th className="px-4 py-3.5">Estado</th>
                      <th className="px-4 py-3.5">Funciones</th>
                      <th className="px-4 py-3.5">Visible</th>
                      <th className="px-4 py-3.5">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {movies.map((m) => (
                      <tr key={m.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#0A192F]">{m.title}</p>
                          <p className="text-xs text-[#475569]">
                            {m.genre} · {m.duration}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            aria-label={`Estado de ${m.title}`}
                            value={m.status}
                            onChange={async (e) => {
                              await upsertMovie.mutateAsync({
                                ...m,
                                status: e.target.value as MovieStatus,
                              });
                              toast.success(`Estado actualizado para ${m.title}`);
                            }}
                            className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-bold text-[#0A192F]"
                          >
                            <option value="ESTRENO">ESTRENO</option>
                            <option value="EN_CARTELERA">EN_CARTELERA</option>
                            <option value="PREVENTA">PREVENTA</option>
                            <option value="PROXIMAMENTE">PROXIMAMENTE</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {m.showtimes.map((st) => (
                              <span
                                key={st.id}
                                className="rounded-md bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-semibold text-[#0F172A] ring-1 ring-[#E2E8F0] tabular-nums"
                              >
                                {st.time} · {st.format} ({formatCurrency(st.ticketPrice)})
                              </span>
                            ))}
                            <button
                              type="button"
                              onClick={async () => {
                                await upsertMovie.mutateAsync({
                                  ...m,
                                  showtimes: [
                                    ...m.showtimes,
                                    {
                                      id: `st-${Date.now()}`,
                                      time: '23:00',
                                      room: 'Sala Trasnoche VIP',
                                      format: '4K LÁSER VIP',
                                      language: 'SUBTITULADA',
                                      ticketPrice: 65,
                                      occupiedSeats: [],
                                    },
                                  ],
                                });
                                toast.success(
                                  `Función 23:00 añadida a ${m.title}`
                                );
                              }}
                              className="rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#92400E] hover:bg-[#D4AF37] hover:text-[#0A192F]"
                            >
                              +23:00 VIP
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={async () => {
                              await upsertMovie.mutateAsync({
                                ...m,
                                isActive: !m.isActive,
                              });
                              toast.success(`Cartelera actualizada: ${m.title}`);
                            }}
                            className={`rounded-lg px-3 py-1 text-xs font-bold ${
                              m.isActive
                                ? 'bg-[#10B981]/15 text-[#047857]'
                                : 'bg-[#EF4444]/15 text-[#B91C1C]'
                            }`}
                          >
                            {m.isActive ? 'En Cartelera' : 'Oculta'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteMovie.mutateAsync(m.id);
                              toast.info(`"${m.title}" eliminada de cartelera`);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#EF4444]/10 px-2.5 py-1 text-xs font-bold text-[#B91C1C] hover:bg-[#EF4444] hover:text-white"
                          >
                            <Icon
                              icon="solar:trash-bin-trash-bold"
                              className="h-3.5 w-3.5"
                            />
                            <span>Quitar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#0A192F] text-xs font-bold uppercase tracking-wider text-white">
                  <tr>
                    <th className="px-4 py-3.5">Ítem</th>
                    <th className="px-4 py-3.5">Categoría / Tipo</th>
                    <th className="px-4 py-3.5">Precio</th>
                    <th className="px-4 py-3.5">Destacado</th>
                    <th className="px-4 py-3.5">Activo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-semibold text-[#0F172A]">
                        {p.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-[#475569]">
                            {p.category}
                          </span>
                          <ProductTypeBadge type={p.type} />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-heading font-bold text-[#0A192F] tabular-nums">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleProductFlag(p, 'isFeatured')}
                          className={`rounded-lg px-3 py-1 text-xs font-bold ${
                            p.isFeatured
                              ? 'bg-[#D4AF37] text-[#0A192F]'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.isFeatured ? 'Destacado' : 'Normal'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleProductFlag(p, 'isActive')}
                          className={`rounded-lg px-3 py-1 text-xs font-bold ${
                            p.isActive
                              ? 'bg-[#10B981]/15 text-[#047857]'
                              : 'bg-[#EF4444]/15 text-[#B91C1C]'
                          }`}
                        >
                          {p.isActive ? 'Activo' : 'Oculto'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de vista previa de comprobante en Admin */}
      {previewOrder?.receipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/80 p-4"
          onClick={() => setPreviewOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-[#0A192F] px-5 py-3.5 text-white">
              <span className="font-heading text-sm font-bold">
                Comprobante {previewOrder.id} · {previewOrder.receipt.fileName}
              </span>
              <button
                type="button"
                onClick={() => setPreviewOrder(null)}
                className="text-slate-300 hover:text-[#D4AF37]"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              {previewOrder.receipt.fileType === 'application/pdf' ? (
                <iframe
                  src={previewOrder.receipt.previewUrl}
                  title={previewOrder.receipt.fileName}
                  className="h-96 w-full rounded-xl border border-[#E2E8F0]"
                />
              ) : (
                <img
                  src={previewOrder.receipt.previewUrl}
                  alt={previewOrder.receipt.fileName}
                  className="mx-auto max-h-96 rounded-xl border border-[#E2E8F0] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
