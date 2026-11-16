import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useStore } from '@/context/StoreContext';
import { useProducts, useReserveSeats } from '@/hooks/useEcommerce';
import { createBrandedFallbackImage, formatCurrency } from '@/lib/format';
import type { Movie, MovieShowtime, Product } from '@/types/ecommerce';

interface DateOption {
  key: string;
  shortLabel: string;
  fullLabel: string;
}

interface SeatSelectorModalProps {
  movie: Movie | null;
  initialShowtimeId?: string;
  initialDateKey?: string;
  dateOptions: DateOption[];
  onClose: () => void;
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
const COLS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function SeatSelectorModal({
  movie,
  initialShowtimeId,
  initialDateKey,
  dateOptions,
  onClose,
}: SeatSelectorModalProps) {
  const { addToCart, openCart } = useStore();
  const { data: products = [] } = useProducts();
  const reserveSeats = useReserveSeats();

  const [selectedDateKey, setSelectedDateKey] = useState(
    initialDateKey || dateOptions[0]?.key || ''
  );
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(
    initialShowtimeId || movie?.showtimes[0]?.id || ''
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [includeCombo, setIncludeCombo] = useState(false);

  useEffect(() => {
    if (!movie) return;
    setSelectedDateKey(initialDateKey || dateOptions[0]?.key || '');
    setSelectedShowtimeId(initialShowtimeId || movie.showtimes[0]?.id || '');
    setSelectedSeats([]);
    setIncludeCombo(false);
  }, [movie?.id, initialShowtimeId, initialDateKey, dateOptions]);

  useEffect(() => {
    if (!movie) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [movie, onClose]);

  const activeShowtime: MovieShowtime | undefined = useMemo(() => {
    if (!movie) return undefined;
    return (
      movie.showtimes.find((s) => s.id === selectedShowtimeId) ??
      movie.showtimes[0]
    );
  }, [movie, selectedShowtimeId]);

  const activeDateObj =
    dateOptions.find((d) => d.key === selectedDateKey) ?? dateOptions[0];

  const candyComboProduct = useMemo(
    () => products.find((p) => p.id === 'prod-2') ?? products[1],
    [products]
  );

  const occupiedSet = useMemo(
    () => new Set(activeShowtime?.occupiedSeats ?? []),
    [activeShowtime]
  );

  const toggleSeat = (seatId: string) => {
    if (occupiedSet.has(seatId)) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      }
      if (prev.length >= 8) {
        toast.info('Máximo 8 butacas por reserva rápida');
        return prev;
      }
      return [...prev, seatId].sort();
    });
  };

  const ticketsTotal =
    (activeShowtime?.ticketPrice ?? 0) * selectedSeats.length;
  const comboTotal =
    includeCombo && candyComboProduct ? candyComboProduct.price : 0;
  const grandTotal = ticketsTotal + comboTotal;

  const handleAddTickets = async () => {
    if (!movie || !activeShowtime || selectedSeats.length === 0) return;

    const syntheticTicketProduct: Product = {
      id: `ticket-${movie.id}-${activeShowtime.id}-${selectedDateKey}-${selectedSeats.join('-')}`,
      name: `Entradas Cine: ${movie.title} (${activeDateObj?.shortLabel ?? ''} ${activeShowtime.time} · ${activeShowtime.format}) — Butacas: ${selectedSeats.join(', ')}`,
      slug: `entrada-${movie.id}-${activeShowtime.id}`,
      category: 'Servicios',
      type: 'SERVICIO',
      price: activeShowtime.ticketPrice,
      shortDescription: `${activeShowtime.room} · ${activeShowtime.language} · Asientos: ${selectedSeats.join(', ')}`,
      fullDescription: `Reserva de ${selectedSeats.length} entrada(s) para "${movie.title}" en ${activeShowtime.room} (${activeShowtime.format} ${activeShowtime.language}) el día ${activeDateObj?.fullLabel ?? ''} a las ${activeShowtime.time}. Butacas seleccionadas: ${selectedSeats.join(', ')}.`,
      images: [movie.posterUrl],
      isFeatured: movie.isFeatured,
      isActive: true,
      serviceModalities: {
        duration: movie.duration,
        availability: `${activeDateObj?.fullLabel ?? ''} · ${activeShowtime.time}`,
        coverage: `${activeShowtime.room} · Cine Small`,
        includes: [
          `Butacas reservadas: ${selectedSeats.join(', ')}`,
          `Formato ${activeShowtime.format} (${activeShowtime.language})`,
          'Acceso QR directo en boletería',
        ],
      },
      specs: {
        Película: movie.title,
        Sala: activeShowtime.room,
        Horario: `${activeDateObj?.shortLabel ?? ''} · ${activeShowtime.time}`,
        Butacas: selectedSeats.join(', '),
      },
    };

    await reserveSeats.mutateAsync({
      movieId: movie.id,
      showtimeId: activeShowtime.id,
      seats: selectedSeats,
    });

    addToCart(syntheticTicketProduct, selectedSeats.length);
    if (includeCombo && candyComboProduct) {
      addToCart(candyComboProduct, 1);
    }

    onClose();
    openCart();
  };

  return (
    <AnimatePresence>
      {movie && activeShowtime && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="seat-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-white shadow-2xl"
          >
            {/* Cabecera Azul Noche */}
            <div className="flex items-center justify-between gap-3 bg-[#0A192F] px-5 py-4 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  onError={(e) => {
                    e.currentTarget.src = createBrandedFallbackImage(
                      movie.title,
                      'Cartelera'
                    );
                  }}
                  className="h-12 w-9 shrink-0 rounded-lg border border-[#D4AF37]/50 object-cover"
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                    Selección de Función y Butacas
                  </span>
                  <h2
                    id="seat-modal-title"
                    className="truncate font-heading text-lg font-extrabold"
                  >
                    {movie.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar selector de butacas"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#112240] text-slate-200 transition-colors hover:bg-[#D4AF37] hover:text-[#0A192F]"
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="grid grid-cols-1 gap-6 overflow-y-auto p-5 sm:p-6 lg:grid-cols-12">
              {/* Columna Izquierda: Fecha, Horarios y Mapa de Butacas */}
              <div className="space-y-5 lg:col-span-7">
                {/* Selector de Fecha */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    1. Elige la fecha de tu función
                  </p>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {dateOptions.map((d) => {
                      const active = d.key === selectedDateKey;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => setSelectedDateKey(d.key)}
                          className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                            active
                              ? 'border-[#D4AF37] bg-[#0A192F] text-[#D4AF37]'
                              : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] hover:border-[#D4AF37]'
                          }`}
                        >
                          {d.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selector de Horario */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    2. Elige sala y horario
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {movie.showtimes.map((st) => {
                      const active = st.id === activeShowtime.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setSelectedShowtimeId(st.id);
                            setSelectedSeats([]);
                          }}
                          className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                            active
                              ? 'border-[#D4AF37] bg-[#FEF3C7]/45 ring-2 ring-[#D4AF37]/30'
                              : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#D4AF37]'
                          }`}
                        >
                          <div>
                            <p className="font-heading text-sm font-extrabold text-[#0A192F] tabular-nums">
                              {st.time} ·{' '}
                              <span className="text-xs font-bold text-[#92400E]">
                                {st.format}
                              </span>
                            </p>
                            <p className="text-[11px] text-[#475569]">
                              {st.room} · {st.language}
                            </p>
                          </div>
                          <span className="font-heading text-xs font-extrabold text-[#0A192F] tabular-nums">
                            {formatCurrency(st.ticketPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mapa de Butacas */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#0A192F] p-4 text-white sm:p-5">
                  <div className="mb-5 text-center">
                    <div className="mx-auto h-2 w-4/5 rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-[#D4AF37] to-[#D4AF37]/30 shadow-[0_6px_18px_rgba(212,175,55,0.45)]" />
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">
                      Pantalla Láser 4K · {activeShowtime.room}
                    </span>
                  </div>

                  <div className="space-y-2 overflow-x-auto pb-1">
                    {ROWS.map((row) => (
                      <div
                        key={row}
                        className="flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        <span className="w-5 text-center text-xs font-bold text-[#D4AF37]">
                          {row}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {COLS.map((col) => {
                            const seatId = `${row}${col}`;
                            const isOccupied = occupiedSet.has(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            const isVipRow = row === 'F';

                            return (
                              <div key={seatId} className="flex items-center">
                                <button
                                  type="button"
                                  disabled={isOccupied}
                                  onClick={() => toggleSeat(seatId)}
                                  title={
                                    isOccupied
                                      ? `Butaca ${seatId} ocupada`
                                      : `Butaca ${seatId}${isVipRow ? ' (VIP)' : ''}`
                                  }
                                  aria-label={`Butaca ${seatId}`}
                                  className={`flex h-7 w-7 items-center justify-center rounded-t-lg rounded-b-sm text-[10px] font-bold tabular-nums transition-all duration-150 sm:h-8 sm:w-8 ${
                                    isOccupied
                                      ? 'cursor-not-allowed bg-slate-600/50 text-slate-400 line-through'
                                      : isSelected
                                        ? 'scale-105 bg-[#D4AF37] text-[#0A192F] shadow-md ring-2 ring-white'
                                        : isVipRow
                                          ? 'border border-[#D4AF37]/70 bg-[#112240] text-[#D4AF37] hover:bg-[#D4AF37]/30'
                                          : 'border border-[#1E3A5F] bg-[#112240] text-slate-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                                  }`}
                                >
                                  {col}
                                </button>
                                {col === 4 && (
                                  <span className="w-3 sm:w-5" aria-hidden="true" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <span className="w-5 text-center text-xs font-bold text-[#D4AF37]">
                          {row}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Leyenda */}
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-4 border-t border-[#1E3A5F] pt-3 text-[11px] text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded-sm border border-[#1E3A5F] bg-[#112240]" />
                      Disponible
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded-sm bg-[#D4AF37]" />
                      Tu selección
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded-sm bg-slate-600/50" />
                      Ocupada
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded-sm border border-[#D4AF37]/70 bg-[#112240]" />
                      Fila F (VIP Reclinable)
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Resumen y Upsell Candy Bar */}
              <div className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 lg:col-span-5">
                <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-[#0A192F]">
                  Resumen de Entradas
                </h3>

                <div className="mt-4 space-y-2.5 rounded-xl border border-[#E2E8F0] bg-white p-4 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#475569]">Película:</span>
                    <span className="text-right font-bold text-[#0A192F]">
                      {movie.title}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#475569]">Fecha y Hora:</span>
                    <span className="font-bold text-[#0A192F] tabular-nums">
                      {activeDateObj?.shortLabel} · {activeShowtime.time}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#475569]">Formato / Idioma:</span>
                    <span className="font-bold text-[#0A192F]">
                      {activeShowtime.format} ({activeShowtime.language})
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#475569]">Precio por entrada:</span>
                    <span className="font-bold text-[#0A192F] tabular-nums">
                      {formatCurrency(activeShowtime.ticketPrice)}
                    </span>
                  </div>
                </div>

                {/* Butacas elegidas */}
                <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-4">
                  <span className="text-xs font-bold text-[#0A192F]">
                    Butacas seleccionadas ({selectedSeats.length}):
                  </span>
                  {selectedSeats.length === 0 ? (
                    <p className="mt-1.5 text-xs text-[#475569]">
                      Haz clic en los asientos disponibles en el mapa para
                      seleccionarlos.
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedSeats.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0A192F] px-2.5 py-1 text-xs font-bold text-[#D4AF37] tabular-nums"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upsell Candy Bar */}
                {candyComboProduct && (
                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#D4AF37]/50 bg-[#FEF3C7]/35 p-3.5 transition-colors hover:bg-[#FEF3C7]/60">
                    <input
                      type="checkbox"
                      checked={includeCombo}
                      onChange={(e) => setIncludeCombo(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#0A192F]"
                    />
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-bold text-[#0A192F]">
                        Agregar {candyComboProduct.name}
                      </p>
                      <p className="mt-0.5 text-[#475569]">
                        Pipocas con mantequilla y nachos listos al ingresar a
                        sala ·{' '}
                        <strong className="text-[#0A192F] tabular-nums">
                          +{formatCurrency(candyComboProduct.price)}
                        </strong>
                      </p>
                    </div>
                  </label>
                )}

                <div className="mt-auto pt-5">
                  <div className="mb-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                    <span className="font-heading text-sm font-bold text-[#0A192F]">
                      Total Entradas{includeCombo ? ' + Combo' : ''}
                    </span>
                    <span className="font-heading text-2xl font-extrabold text-[#0A192F] tabular-nums">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  <Button
                    onPress={handleAddTickets}
                    isDisabled={
                      selectedSeats.length === 0 || reserveSeats.isPending
                    }
                    className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold transition-colors ${
                      selectedSeats.length > 0
                        ? 'bg-[#D4AF37] text-[#0A192F] shadow-md hover:bg-[#E5C158] active:bg-[#B5952F]'
                        : 'cursor-not-allowed bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Icon icon="solar:ticket-bold" className="h-5 w-5" />
                    <span>
                      {selectedSeats.length === 0
                        ? 'Selecciona al menos 1 butaca'
                        : `Reservar y Pagar por QR · ${formatCurrency(grandTotal)}`}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

