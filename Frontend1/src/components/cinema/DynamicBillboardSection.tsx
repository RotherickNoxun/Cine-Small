import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { SeatSelectorModal } from '@/components/cinema/SeatSelectorModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMovies } from '@/hooks/useEcommerce';
import { createBrandedFallbackImage, formatCurrency } from '@/lib/format';
import type {
  Movie,
  MovieFormat,
  MovieLanguage,
  MovieStatus,
} from '@/types/ecommerce';

const STATUS_BADGE: Record<
  MovieStatus,
  { label: string; className: string }
> = {
  ESTRENO: {
    label: 'Estreno',
    className: 'bg-[#D4AF37] text-[#0A192F]',
  },
  EN_CARTELERA: {
    label: 'En Cartelera',
    className: 'bg-[#10B981] text-white',
  },
  PREVENTA: {
    label: 'Preventa',
    className: 'bg-[#F59E0B] text-[#0A192F]',
  },
  PROXIMAMENTE: {
    label: 'Próximamente',
    className: 'bg-[#112240] text-white border border-[#D4AF37]/50',
  },
};

function buildUpcomingDates() {
  const result: { key: string; shortLabel: string; fullLabel: string; weekday: string; dayNum: string }[] = [];
  const base = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const weekday =
      i === 0
        ? 'Hoy'
        : i === 1
          ? 'Mañana'
          : new Intl.DateTimeFormat('es-BO', { weekday: 'short' }).format(d);
    const dayNum = new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
    }).format(d);
    const fullLabel = new Intl.DateTimeFormat('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(d);
    result.push({
      key,
      shortLabel: `${weekday} ${dayNum}`,
      fullLabel,
      weekday,
      dayNum,
    });
  }
  return result;
}

export function DynamicBillboardSection() {
  const { data: movies = [], isLoading } = useMovies();
  const dateOptions = useMemo(() => buildUpcomingDates(), []);

  const [selectedDateKey, setSelectedDateKey] = useState(dateOptions[0].key);
  const [statusFilter, setStatusFilter] = useState<'ALL' | MovieStatus>('ALL');
  const [formatFilter, setFormatFilter] = useState<'ALL' | MovieFormat>('ALL');
  const [languageFilter, setLanguageFilter] = useState<'ALL' | MovieLanguage>(
    'ALL'
  );
  const [movieQuery, setMovieQuery] = useState('');
  const [failedPosters, setFailedPosters] = useState<Record<string, boolean>>({});

  const [seatModalState, setSeatModalState] = useState<{
    movie: Movie | null;
    showtimeId?: string;
  }>({ movie: null });

  const filteredMovies = useMemo(() => {
    const q = movieQuery.trim().toLowerCase();

    return movies
      .filter((movie) => {
        if (!movie.isActive) return false;
        if (statusFilter !== 'ALL' && movie.status !== statusFilter) {
          return false;
        }
        if (q) {
          const hit =
            movie.title.toLowerCase().includes(q) ||
            movie.genre.toLowerCase().includes(q) ||
            movie.director.toLowerCase().includes(q);
          if (!hit) return false;
        }

        const matchingShowtimes = movie.showtimes.filter((st) => {
          if (formatFilter !== 'ALL' && st.format !== formatFilter) return false;
          if (languageFilter !== 'ALL' && st.language !== languageFilter) {
            return false;
          }
          return true;
        });

        return matchingShowtimes.length > 0;
      })
      .map((movie) => ({
        ...movie,
        filteredShowtimes: movie.showtimes.filter((st) => {
          if (formatFilter !== 'ALL' && st.format !== formatFilter) return false;
          if (languageFilter !== 'ALL' && st.language !== languageFilter) {
            return false;
          }
          return true;
        }),
      }));
  }, [movies, statusFilter, formatFilter, languageFilter, movieQuery]);

  const resetBillboardFilters = () => {
    setStatusFilter('ALL');
    setFormatFilter('ALL');
    setLanguageFilter('ALL');
    setMovieQuery('');
  };

  return (
    <section
      id="cartelera"
      className="border-b border-[#E2E8F0] bg-[#0A192F] py-14 text-white sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado de Cartelera */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              <Icon icon="solar:reel-bold" className="h-4 w-4" />
              Cartelera Dinámica en Vivo
            </span>
            <h2 className="mt-1.5 font-heading text-2xl font-extrabold text-white sm:text-3xl">
              Estrenos, Funciones y Selección de Butacas
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-300">
              Filtra por fecha, formato o idioma, haz clic en cualquier horario
              y reserva tus asientos al instante con pago QR.
            </p>
          </div>

          {/* Buscador rápido de cartelera */}
          <div className="relative w-full lg:w-72">
            <Icon
              icon="solar:magnifer-linear"
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={movieQuery}
              onChange={(e) => setMovieQuery(e.target.value)}
              placeholder="Buscar película o género..."
              aria-label="Buscar en cartelera"
              className="h-10 w-full rounded-xl border border-[#1E3A5F] bg-[#112240] pr-8 pl-10 text-xs text-white placeholder-slate-400 outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Selector de Fechas Dinámico + Filtros de Formato / Estado / Idioma */}
        <div className="mt-6 space-y-4 rounded-2xl border border-[#1E3A5F] bg-[#112240]/90 p-4 sm:p-5">
          {/* Tira de Fechas */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {dateOptions.map((d) => {
              const active = d.key === selectedDateKey;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDateKey(d.key)}
                  className={`flex min-w-[105px] shrink-0 flex-col items-center rounded-xl border px-3.5 py-2 transition-all duration-200 ${
                    active
                      ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0A192F] shadow-md'
                      : 'border-[#1E3A5F] bg-[#0A192F]/80 text-white hover:border-[#D4AF37]/60'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {d.weekday}
                  </span>
                  <span className="font-heading text-sm font-extrabold tabular-nums">
                    {d.dayNum}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pills de Estado, Formato e Idioma */}
          <div className="flex flex-col gap-3 border-t border-[#1E3A5F] pt-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'ALL', label: 'Todas' },
                  { id: 'ESTRENO', label: 'Estrenos' },
                  { id: 'EN_CARTELERA', label: 'En Cartelera' },
                  { id: 'PREVENTA', label: 'Preventa' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    statusFilter === st.id
                      ? 'bg-[#D4AF37] text-[#0A192F]'
                      : 'bg-[#0A192F] text-slate-300 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-[#1E3A5F] bg-[#0A192F] p-1">
                {(['ALL', '2D', '3D', '4K LÁSER VIP'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormatFilter(fmt)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      formatFilter === fmt
                        ? 'bg-[#D4AF37] text-[#0A192F]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {fmt === 'ALL' ? 'Todos formatos' : fmt}
                  </button>
                ))}
              </div>

              <select
                aria-label="Filtrar idioma"
                value={languageFilter}
                onChange={(e) =>
                  setLanguageFilter(e.target.value as 'ALL' | MovieLanguage)
                }
                className="h-8 rounded-xl border border-[#1E3A5F] bg-[#0A192F] px-3 text-xs font-semibold text-white outline-none focus:border-[#D4AF37]"
              >
                <option value="ALL">Idioma: Todos</option>
                <option value="DOBLADA">Doblada (Español)</option>
                <option value="SUBTITULADA">Subtitulada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listado Dinámico de Películas */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl bg-[#112240]"
                />
              ))}
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="text-[#0F172A]">
              <EmptyState
                variant="catalog"
                title="No hay funciones con estos filtros"
                description="Prueba seleccionando otro formato (2D, 3D, 4K LÁSER VIP), idioma o limpia el filtro de búsqueda."
                actionLabel="Mostrar toda la cartelera"
                onAction={resetBillboardFilters}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMovies.map((movie) => {
                const badge = STATUS_BADGE[movie.status];
                const posterSrc = failedPosters[movie.id]
                  ? createBrandedFallbackImage(movie.title, movie.genre)
                  : movie.posterUrl;

                return (
                  <motion.article
                    key={movie.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#1E3A5F] bg-[#112240] shadow-lg transition-all duration-200 hover:border-[#D4AF37]/75"
                  >
                    {/* Poster + Información superior */}
                    <div className="flex gap-4 p-4">
                      <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl border border-[#1E3A5F] bg-[#0A192F] sm:w-32">
                        <img
                          src={posterSrc}
                          alt={`Poster ${movie.title}`}
                          loading="lazy"
                          onError={() =>
                            setFailedPosters((prev) => ({
                              ...prev,
                              [movie.id]: true,
                            }))
                          }
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span
                          className={`absolute top-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase shadow-sm ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="rounded-md bg-[#0A192F] px-2 py-0.5 font-bold text-[#D4AF37] tabular-nums">
                            ★ {movie.score}
                          </span>
                          <span className="rounded-md border border-[#1E3A5F] px-2 py-0.5 font-semibold text-slate-200">
                            {movie.rating}
                          </span>
                          <span className="text-slate-300 tabular-nums">
                            {movie.duration}
                          </span>
                        </div>

                        <h3 className="mt-2 line-clamp-2 font-heading text-lg font-extrabold leading-snug text-white group-hover:text-[#D4AF37]">
                          {movie.title}
                        </h3>

                        <p className="mt-0.5 text-xs font-semibold text-[#D4AF37]">
                          {movie.genre}
                        </p>

                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-300">
                          {movie.synopsis}
                        </p>
                      </div>
                    </div>

                    {/* Horarios dinámicos clicables */}
                    <div className="mt-auto border-t border-[#1E3A5F] bg-[#0A192F]/70 p-4">
                      <div className="mb-2.5 flex items-center justify-between text-[11px]">
                        <span className="font-bold uppercase tracking-wider text-slate-300">
                          Horarios disponibles ({movie.filteredShowtimes.length})
                        </span>
                        <span className="text-[#D4AF37] font-semibold">
                          Elige hora para butacas
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {movie.filteredShowtimes.map((st) => {
                          const availableCount = 48 - st.occupiedSeats.length;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() =>
                                setSeatModalState({
                                  movie,
                                  showtimeId: st.id,
                                })
                              }
                              className="flex flex-col rounded-xl border border-[#1E3A5F] bg-[#112240] px-3 py-2 text-left transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#172E54]"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-heading text-sm font-extrabold text-[#D4AF37] tabular-nums">
                                  {st.time}
                                </span>
                                <span className="text-[11px] font-bold text-white tabular-nums">
                                  {formatCurrency(st.ticketPrice)}
                                </span>
                              </div>
                              <span className="mt-0.5 truncate text-[10px] font-semibold text-slate-200">
                                {st.format} · {st.language === 'DOBLADA' ? 'DOB' : 'SUB'}
                              </span>
                              <span className="mt-0.5 text-[10px] text-[#10B981] tabular-nums">
                                {availableCount} butacas libres
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        onPress={() =>
                          setSeatModalState({
                            movie,
                            showtimeId: movie.filteredShowtimes[0]?.id,
                          })
                        }
                        className="mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] text-xs font-extrabold text-[#0A192F] transition-colors hover:bg-[#E5C158] active:bg-[#B5952F]"
                      >
                        <Icon icon="solar:armchair-2-bold" className="h-4 w-4" />
                        <span>Elegir Butacas y Comprar</span>
                      </Button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Interactivo de Butacas */}
      <SeatSelectorModal
        movie={seatModalState.movie}
        initialShowtimeId={seatModalState.showtimeId}
        initialDateKey={selectedDateKey}
        dateOptions={dateOptions}
        onClose={() => setSeatModalState({ movie: null })}
      />
    </section>
  );
}

