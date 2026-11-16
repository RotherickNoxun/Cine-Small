export type ProductType = 'ESTANDAR' | 'SERVICIO';

export type ProductCategory =
  | 'Alquileres'
  | 'Materiales'
  | 'Equipamiento'
  | 'Productos'
  | 'Servicios';

export interface ServiceModalities {
  duration: string;
  availability: string;
  coverage: string;
  includes: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  type: ProductType;
  price: number;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  stock?: number;
  serviceModalities?: ServiceModalities;
  specs: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentStatus =
  | 'PENDIENTE'
  | 'COMPROBANTE_ENVIADO'
  | 'PAGADO'
  | 'RECHAZADO';

export type OrderStatus =
  | 'PENDIENTE'
  | 'VERIFICADO'
  | 'ENVIADO_COMPLETADO'
  | 'CANCELADO';

export interface OrderReceipt {
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl: string;
  uploadedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  type: ProductType;
  category: ProductCategory;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  receipt?: OrderReceipt;
}

export interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  subject: string;
  message: string;
  createdAt: string;
}


export type MovieStatus =
  | 'ESTRENO'
  | 'EN_CARTELERA'
  | 'PREVENTA'
  | 'PROXIMAMENTE';

export type MovieFormat = '2D' | '3D' | '4K LÁSER VIP';

export type MovieLanguage = 'DOBLADA' | 'SUBTITULADA';

export interface MovieShowtime {
  id: string;
  time: string;
  room: string;
  format: MovieFormat;
  language: MovieLanguage;
  ticketPrice: number;
  occupiedSeats: string[];
}

export interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: string;
  rating: string;
  score: string;
  status: MovieStatus;
  synopsis: string;
  director: string;
  posterUrl: string;
  backdropUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  showtimes: MovieShowtime[];
}
