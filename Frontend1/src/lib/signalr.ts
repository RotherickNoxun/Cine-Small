import * as signalR from '@microsoft/signalr';

export type RealtimeEventType =
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'RECEIPT_UPLOADED'
  | 'PRODUCTS_UPDATED'
  | 'MOVIES_UPDATED';

export interface RealtimeMessage {
  type: RealtimeEventType;
  orderId?: string;
  timestamp: string;
}

type Listener = (event: RealtimeMessage) => void;

const CHANNEL_NAME = 'cinesmall_realtime_hub_v1';

class RealtimeSyncHub {
  private listeners = new Set<Listener>();
  private broadcast: BroadcastChannel | null = null;
  private connection: signalR.HubConnection | null = null;
  private initialized = false;

  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    if ('BroadcastChannel' in window) {
      this.broadcast = new BroadcastChannel(CHANNEL_NAME);
      this.broadcast.onmessage = (event: MessageEvent<RealtimeMessage>) => {
        if (event.data) {
          this.notify(event.data);
        }
      };
    }

    window.addEventListener('storage', (event) => {
      if (event.key === 'cinesmall_orders_v2') {
        this.notify({
          type: 'ORDER_UPDATED',
          timestamp: new Date().toISOString(),
        });
      }
      if (event.key === 'cinesmall_products_v2') {
        this.notify({
          type: 'PRODUCTS_UPDATED',
          timestamp: new Date().toISOString(),
        });
      }
      if (event.key === 'cinesmall_movies_v2') {
        this.notify({
          type: 'MOVIES_UPDATED',
          timestamp: new Date().toISOString(),
        });
      }
    });

    const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL;
    if (hubUrl) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.on('OrderStatusChanged', (payload: RealtimeMessage) => {
        this.notify(payload);
      });

      this.connection.start().catch(() => {
        // Fallback smoothly to BroadcastChannel + storage sync when standalone
      });
    }
  }

  subscribe(listener: Listener): () => void {
    this.init();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(type: RealtimeEventType, orderId?: string): void {
    this.init();
    const message: RealtimeMessage = {
      type,
      orderId,
      timestamp: new Date().toISOString(),
    };
    this.broadcast?.postMessage(message);
    this.notify(message);
  }

  private notify(event: RealtimeMessage): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export const realtimeHub = new RealtimeSyncHub();

